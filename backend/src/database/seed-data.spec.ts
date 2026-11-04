import { DataSource } from "typeorm";
import { BikeEntity } from "../bikes/entities/bike.entity";
import { BikeSellEntity } from "../customers/entities/bike-sell.entity";
import { CustomerEntity } from "../customers/entities/customer.entity";
import { databaseOptions } from "./database-options";
import { seedDatabase } from "./seed-data";

describe("SQLite schema and seed", () => {
  let database: DataSource;
  beforeEach(async () => {
    database = await new DataSource({
      ...databaseOptions,
      database: ":memory:",
      entities: [CustomerEntity, BikeEntity, BikeSellEntity],
    }).initialize();
  });
  afterEach(async () => {
    await database.destroy();
  });

  it("uses the explicit SQL table and column names", async () => {
    const expected = {
      customers: [
        "id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "birth_date",
        "address",
        "postal_code",
        "city",
        "country",
      ],
      bikes: [
        "id",
        "brand",
        "model",
        "description",
        "category",
        "frame_material",
        "frame_size_cm",
        "wheel_size_inches",
        "gear_count",
        "weight_kg",
        "electric",
        "price_cents",
      ],
      bike_sells: [
        "id",
        "customer_id",
        "bike_id",
        "quantity",
        "sold_at",
        "unit_price_cents",
      ],
    };
    for (const [table, columns] of Object.entries(expected)) {
      const info = (await database.query(`PRAGMA table_info("${table}")`)) as {
        name: string;
        pk: number;
      }[];
      expect(info.map((column) => column.name)).toEqual(columns);
      expect(
        info.filter((column) => column.pk).map((column) => column.name),
      ).toEqual(["id"]);
    }
    const fks = (await database.query(
      'PRAGMA foreign_key_list("bike_sells")',
    )) as { table: string; from: string; on_delete: string }[];
    expect(fks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: "customers",
          from: "customer_id",
          on_delete: "CASCADE",
        }),
        expect.objectContaining({
          table: "bikes",
          from: "bike_id",
          on_delete: "RESTRICT",
        }),
      ]),
    );
  });

  it("creates 100 customers, 100 bikes and 2 to 10 realistic sales per customer", async () => {
    const summary = await seedDatabase(database);
    const customers = await database.getRepository(CustomerEntity).find();
    const bikes = await database.getRepository(BikeEntity).find();
    const sales = await database.getRepository(BikeSellEntity).find();
    expect(summary).toEqual({
      customers: 100,
      bikes: 100,
      sales: sales.length,
    });
    expect(customers).toHaveLength(100);
    expect(bikes).toHaveLength(100);
    expect(sales.length).toBeGreaterThanOrEqual(200);
    expect(sales.length).toBeLessThanOrEqual(1000);
    const ids = [...customers, ...bikes, ...sales].map((entity) => entity.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids)
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    expect(new Set(customers.map((customer) => customer.email)).size).toBe(100);
    const now = Date.now();
    for (const customer of customers) {
      expect(customer.firstName.length).toBeGreaterThan(0);
      expect(customer.lastName.length).toBeGreaterThan(0);
      expect(customer.email).toBe(customer.email.toLowerCase());
      expect(customer.email).toMatch(/^[^@\s]+@example\.com$/);
      expect(customer.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(customer.country).toBe("France");
      expect(customer.postalCode).toMatch(/^\d{5}$/);
      const purchases = sales.filter((sale) => sale.customerId === customer.id);
      expect(purchases.length).toBeGreaterThanOrEqual(2);
      expect(purchases.length).toBeLessThanOrEqual(10);
    }
    for (const bike of bikes) {
      expect(bike.priceCents).toBeGreaterThan(0);
      expect(Number.isInteger(bike.priceCents)).toBe(true);
      expect(bike.weightKg).toBeGreaterThan(0);
      expect(bike.frameSizeCm).toBeGreaterThan(0);
      expect(bike.wheelSizeInches).toBeGreaterThan(0);
      expect(Number.isInteger(bike.gearCount)).toBe(true);
    }
    const bikesById = new Map(bikes.map((bike) => [bike.id, bike]));
    for (const sale of sales) {
      const bike = bikesById.get(sale.bikeId);
      expect(bike).toBeDefined();
      expect(sale.unitPriceCents).toBe(bike?.priceCents);
      expect(sale.quantity).toBeGreaterThanOrEqual(1);
      expect(sale.quantity).toBeLessThanOrEqual(3);
      expect(sale.soldAt.getTime()).toBeLessThanOrEqual(now);
      expect(sale.soldAt.getTime()).toBeGreaterThan(
        now - 3 * 366 * 24 * 60 * 60 * 1000,
      );
    }
  });

  it("appends a new random dataset and preserves existing records", async () => {
    const first = await seedDatabase(database);
    const customer = await database
      .getRepository(CustomerEntity)
      .findOneByOrFail({});
    const bike = await database.getRepository(BikeEntity).findOneByOrFail({});
    const initialIds = (
      await database.getRepository(CustomerEntity).find()
    ).map((entity) => entity.id);
    await database
      .getRepository(CustomerEntity)
      .update(customer.id, { city: "Nantes" });
    await database
      .getRepository(BikeEntity)
      .update(bike.id, { priceCents: 12345 });
    const second = await seedDatabase(database);
    expect(await database.getRepository(CustomerEntity).count()).toBe(200);
    expect(await database.getRepository(BikeEntity).count()).toBe(200);
    expect(await database.getRepository(BikeSellEntity).count()).toBe(
      first.sales + second.sales,
    );
    expect(
      await database
        .getRepository(CustomerEntity)
        .findOneByOrFail({ id: customer.id }),
    ).toMatchObject({ city: "Nantes" });
    expect(
      await database.getRepository(BikeEntity).findOneByOrFail({ id: bike.id }),
    ).toMatchObject({ priceCents: 12345 });
    const customers = await database.getRepository(CustomerEntity).find();
    expect(
      customers.filter((entity) => !initialIds.includes(entity.id)),
    ).toHaveLength(100);
    expect(new Set(customers.map((entity) => entity.email)).size).toBe(200);
  });

  it("rolls back customers, bikes and sales if sale insertion fails", async () => {
    const existing = await database.getRepository(CustomerEntity).save({
      firstName: "Existing",
      lastName: "Customer",
      email: "existing@example.com",
    });
    // Fail at the final stage, after the customer and bike batches were inserted.
    await database.query(
      `CREATE TRIGGER reject_seed_sales BEFORE INSERT ON bike_sells BEGIN SELECT RAISE(ABORT, 'forced seed failure'); END`,
    );
    await expect(seedDatabase(database)).rejects.toThrow("forced seed failure");
    expect(await database.getRepository(CustomerEntity).count()).toBe(1);
    expect(
      await database
        .getRepository(CustomerEntity)
        .findOneBy({ id: existing.id }),
    ).toMatchObject({ email: "existing@example.com" });
    expect(await database.getRepository(BikeEntity).count()).toBe(0);
    expect(await database.getRepository(BikeSellEntity).count()).toBe(0);
  });
});
