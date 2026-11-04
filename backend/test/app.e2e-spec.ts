import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module";
import type { BikeResponseDto } from "../src/bikes/dto/bike-response.dto";
import type { GetBikesResponseDto } from "../src/bikes/dto/get-bikes-response.dto";
import { BikeEntity } from "../src/bikes/entities/bike.entity";
import { configureApp } from "../src/configure-app";
import type { PurchasedBikeSellResponseDto } from "../src/customers/dto/bike-sell-response.dto";
import type { CustomerResponseDto } from "../src/customers/dto/customer-response.dto";
import type { GetCustomersResponseDto } from "../src/customers/dto/get-customers-response.dto";
import { BikeSellEntity } from "../src/customers/entities/bike-sell.entity";
import { CustomerEntity } from "../src/customers/entities/customer.entity";
import { databaseOptions } from "../src/database/database-options";
import { fixtureIds, populateShopFixture } from "./fixtures/shop-fixture";

const missingId = "90000000-0000-4000-8000-000000000009";
const customerId = fixtureIds.customers[0];
const bikeId = fixtureIds.bikes[0];
const validCustomer = {
  firstName: "  Zoé  ",
  lastName: "Moreau",
  email: " ZOE@EXAMPLE.COM ",
};

describe("Bike shop API", () => {
  let app: INestApplication;
  let database: DataSource;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useFactory({
        // Let Vitest/SWC compile entity classes rather than TypeORM importing
        // the TypeScript source files through its native glob loader.
        factory: () =>
          new DataSource({
            ...databaseOptions,
            database: ":memory:",
            entities: [CustomerEntity, BikeEntity, BikeSellEntity],
          }).initialize(),
      })
      .compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
    database = app.get(DataSource);
    await populateShopFixture(database);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it("creates, lists, reads, updates and deletes a customer", async () => {
    const created = await request(app.getHttpServer())
      .post("/customers")
      .send(validCustomer)
      .expect(201);
    const customer = created.body as CustomerResponseDto;
    expect(customer).toMatchObject({
      firstName: "Zoé",
      lastName: "Moreau",
      email: "zoe@example.com",
      phone: null,
      birthDate: null,
      address: null,
      postalCode: null,
      city: null,
      country: null,
    });
    expect(customer.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Object.keys(customer)).toHaveLength(10);
    await request(app.getHttpServer())
      .get(`/customers/${customer.id}`)
      .expect(200, customer);
    const all = await request(app.getHttpServer())
      .get("/customers")
      .expect(200);
    expect(
      (all.body as GetCustomersResponseDto).customers.map(
        (item) => item.lastName,
      ),
    ).toEqual(["Bernard", "Durand", "Martin", "Moreau"]);
    await request(app.getHttpServer())
      .patch(`/customers/${customer.id}`)
      .send({ city: "Paris", phone: "0600000000" })
      .expect(200);
    const patched = await request(app.getHttpServer())
      .patch(`/customers/${customer.id}`)
      .send({ phone: null })
      .expect(200);
    expect(patched.body).toMatchObject({
      phone: null,
      city: "Paris",
      email: "zoe@example.com",
    });
    const removed = await request(app.getHttpServer())
      .delete(`/customers/${customer.id}`)
      .expect(204);
    expect(removed.text).toBe("");
    await request(app.getHttpServer())
      .get(`/customers/${customer.id}`)
      .expect(404);
  });

  it("enforces email uniqueness on creation and update", async () => {
    await request(app.getHttpServer())
      .post("/customers")
      .send({ ...validCustomer, email: " ALICE@EXAMPLE.COM " })
      .expect(409);
    await request(app.getHttpServer())
      .patch(`/customers/${fixtureIds.customers[1]}`)
      .send({ email: " ALICE@EXAMPLE.COM " })
      .expect(409);
    await request(app.getHttpServer())
      .patch(`/customers/${customerId}`)
      .send({ email: " ALICE@EXAMPLE.COM " })
      .expect(200);
  });

  it("validates customer input, unknown fields and empty patches", async () => {
    for (const input of [
      {},
      { ...validCustomer, firstName: "   " },
      { ...validCustomer, lastName: null },
      { ...validCustomer, email: "invalid" },
      { ...validCustomer, phone: 123 },
      { ...validCustomer, birthDate: "2025-02-30" },
      { ...validCustomer, birthDate: "2999-01-01" },
      { ...validCustomer, birthDate: "1990-1-1" },
      { ...validCustomer, unexpected: true },
    ])
      await request(app.getHttpServer())
        .post("/customers")
        .send(input)
        .expect(400);
    for (const input of [
      {},
      { firstName: null },
      { lastName: "" },
      { email: null },
      { country: 42 },
      { id: missingId },
    ]) {
      await request(app.getHttpServer())
        .patch(`/customers/${customerId}`)
        .send(input)
        .expect(400);
    }
    await request(app.getHttpServer())
      .patch(`/customers/${customerId}`)
      .send({ birthDate: "2000-02-29" })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/customers/${customerId}`)
      .send({ birthDate: null })
      .expect(200);
  });

  it("validates UUIDs and reports missing customers on every route", async () => {
    for (const id of ["invalid", missingId]) {
      const status = id === "invalid" ? 400 : 404;
      await request(app.getHttpServer()).get(`/customers/${id}`).expect(status);
      await request(app.getHttpServer())
        .get(`/customers/${id}/bikes`)
        .expect(status);
      await request(app.getHttpServer())
        .patch(`/customers/${id}`)
        .send({ city: "Paris" })
        .expect(status);
      await request(app.getHttpServer())
        .delete(`/customers/${id}`)
        .expect(status);
      await request(app.getHttpServer())
        .post(`/customers/${id}/bikes`)
        .send({ bikeId, quantity: 1 })
        .expect(status);
    }
  });

  it("returns one entry per sale, ordered by date then UUID, and an empty list for no purchases", async () => {
    const response = await request(app.getHttpServer())
      .get(`/customers/${customerId}/bikes`)
      .expect(200);
    const purchases = response.body as PurchasedBikeSellResponseDto[];
    expect(purchases.map((sale) => sale.id)).toEqual(
      fixtureIds.sales.slice(0, 3),
    );
    expect(purchases.slice(0, 2).map((sale) => sale.bikeId)).toEqual([
      bikeId,
      bikeId,
    ]);
    expect(purchases[1]).toMatchObject({
      quantity: 2,
      bike: { id: bikeId, model: "City 100", frameSizeCm: 54, electric: false },
    });
    await request(app.getHttpServer())
      .get(`/customers/${fixtureIds.customers[2]}/bikes`)
      .expect(200, []);
    // Same timestamp: the UUID provides the deterministic secondary order.
    await database
      .getRepository(BikeSellEntity)
      .update({ customerId }, { soldAt: new Date("2026-02-01T00:00:00Z") });
    const tied = await request(app.getHttpServer())
      .get(`/customers/${customerId}/bikes`)
      .expect(200);
    expect(
      (tied.body as PurchasedBikeSellResponseDto[]).map((sale) => sale.id),
    ).toEqual(fixtureIds.sales.slice(0, 3));
  });

  it("records repeated sales and keeps historical prices when the catalogue changes", async () => {
    const before = Date.now();
    const first = await request(app.getHttpServer())
      .post(`/customers/${customerId}/bikes`)
      .send({ bikeId, quantity: 3 })
      .expect(201);
    expect(first.body).toMatchObject({
      customerId,
      bikeId,
      quantity: 3,
      unitPriceCents: 49900,
    });
    const sale = first.body as PurchasedBikeSellResponseDto;
    expect(Object.keys(sale).sort()).toEqual(
      [
        "id",
        "customerId",
        "bikeId",
        "quantity",
        "soldAt",
        "unitPriceCents",
      ].sort(),
    );
    expect(Date.parse(sale.soldAt)).toBeGreaterThanOrEqual(before);
    expect(sale.soldAt).toMatch(/Z$/);
    await database
      .getRepository(BikeEntity)
      .update(bikeId, { priceCents: 59900 });
    const second = await request(app.getHttpServer())
      .post(`/customers/${customerId}/bikes`)
      .send({ bikeId, quantity: 1 })
      .expect(201);
    expect(second.body).toMatchObject({ unitPriceCents: 59900 });
    expect(second.body.id).not.toBe(sale.id);
    const response = await request(app.getHttpServer())
      .get(`/customers/${customerId}/bikes`)
      .expect(200);
    expect(
      (response.body as PurchasedBikeSellResponseDto[]).find(
        (item) => item.id === sale.id,
      ),
    ).toMatchObject({ unitPriceCents: 49900, bike: { priceCents: 59900 } });
  });

  it("rejects invalid sales and missing bikes without inserting anything", async () => {
    const count = await database.getRepository(BikeSellEntity).count();
    for (const body of [
      {},
      { bikeId, quantity: 0 },
      { bikeId, quantity: -1 },
      { bikeId, quantity: 1.5 },
      { bikeId, quantity: "2" },
      { bikeId: "invalid", quantity: 1 },
      { bikeId, quantity: 1, unitPriceCents: 1 },
      { bikeId, quantity: 1, soldAt: "2026-01-01" },
    ])
      await request(app.getHttpServer())
        .post(`/customers/${customerId}/bikes`)
        .send(body)
        .expect(400);
    await request(app.getHttpServer())
      .post(`/customers/${customerId}/bikes`)
      .send({ bikeId: missingId, quantity: 1 })
      .expect(404);
    expect(await database.getRepository(BikeSellEntity).count()).toBe(count);
  });

  it("cascades customer deletion to sales and keeps bikes and other customers' sales", async () => {
    await request(app.getHttpServer())
      .delete(`/customers/${customerId}`)
      .expect(204);
    expect(
      await database.getRepository(BikeSellEntity).countBy({ customerId }),
    ).toBe(0);
    expect(await database.getRepository(BikeSellEntity).count()).toBe(1);
    expect(await database.getRepository(BikeEntity).count()).toBe(4);
  });

  it("paginates the customers list", async () => {
    const firstPage = await request(app.getHttpServer())
      .get("/customers?page=1&limit=2")
      .expect(200);
    const body = firstPage.body as GetCustomersResponseDto;
    expect(body.totalCount).toBe(3);
    expect(body.customers.map((item) => item.lastName)).toEqual([
      "Bernard",
      "Durand",
    ]);
    const secondPage = await request(app.getHttpServer())
      .get("/customers?page=2&limit=2")
      .expect(200);
    expect(
      (secondPage.body as GetCustomersResponseDto).customers.map(
        (item) => item.lastName,
      ),
    ).toEqual(["Martin"]);
    await request(app.getHttpServer())
      .get("/customers?page=5&limit=2")
      .expect(200, { totalCount: 3, customers: [] });
    const defaults = await request(app.getHttpServer())
      .get("/customers")
      .expect(200);
    expect((defaults.body as GetCustomersResponseDto).customers).toHaveLength(
      3,
    );
    for (const query of [
      "page=0",
      "page=-1",
      "page=abc",
      "page=1.5",
      "page=",
      "page=99999999999999999999",
      "limit=0",
      "limit=51",
      "limit=abc",
    ])
      await request(app.getHttpServer()).get(`/customers?${query}`).expect(400);
    await request(app.getHttpServer()).get("/customers?limit=50").expect(200);
  });

  it("paginates the bikes list", async () => {
    const response = await request(app.getHttpServer())
      .get("/bikes?page=2&limit=3")
      .expect(200);
    const body = response.body as GetBikesResponseDto;
    expect(body.totalCount).toBe(4);
    expect(body.bikes).toHaveLength(1);
    await request(app.getHttpServer())
      .get("/bikes?page=3&limit=3")
      .expect(200, { totalCount: 4, bikes: [] });
    await request(app.getHttpServer()).get("/bikes?limit=51").expect(400);
    await request(app.getHttpServer()).get("/bikes?page=0").expect(400);
  });

  it("creates, reads, updates and deletes a bike", async () => {
    const newBike = {
      brand: " Veloria ",
      model: "Gravel 700",
      description: "Vélo gravel",
      category: "gravel",
      frameMaterial: "steel",
      frameSizeCm: 56,
      wheelSizeInches: 28,
      gearCount: 22,
      weightKg: 10.5,
      electric: false,
      priceCents: 159900,
    };
    const created = await request(app.getHttpServer())
      .post("/bikes")
      .send(newBike)
      .expect(201);
    const bike = created.body as BikeResponseDto;
    expect(bike).toMatchObject({ ...newBike, brand: "Veloria" });
    expect(bike.id).toMatch(/^[0-9a-f-]{36}$/);
    await request(app.getHttpServer())
      .get(`/bikes/${bike.id}`)
      .expect(200, bike);
    const patched = await request(app.getHttpServer())
      .patch(`/bikes/${bike.id}`)
      .send({ priceCents: 149900, electric: true })
      .expect(200);
    expect(patched.body).toMatchObject({
      model: "Gravel 700",
      priceCents: 149900,
      electric: true,
    });
    await request(app.getHttpServer()).delete(`/bikes/${bike.id}`).expect(204);
    await request(app.getHttpServer()).get(`/bikes/${bike.id}`).expect(404);
  });

  it("validates bike input", async () => {
    const validBike = {
      brand: "Veloria",
      model: "Gravel 700",
      description: "Vélo gravel",
      category: "gravel",
      frameMaterial: "steel",
      frameSizeCm: 56,
      wheelSizeInches: 28,
      gearCount: 22,
      weightKg: 10.5,
      electric: false,
      priceCents: 159900,
    };
    for (const input of [
      {},
      { ...validBike, brand: "  " },
      { ...validBike, model: null },
      { ...validBike, frameSizeCm: 0 },
      { ...validBike, weightKg: -2 },
      { ...validBike, gearCount: 1.5 },
      { ...validBike, priceCents: -1 },
      { ...validBike, priceCents: "100" },
      { ...validBike, electric: "yes" },
      { ...validBike, unexpected: true },
    ])
      await request(app.getHttpServer()).post("/bikes").send(input).expect(400);
    for (const input of [
      {},
      { brand: null },
      { gearCount: 0 },
      { id: missingId },
    ])
      await request(app.getHttpServer())
        .patch(`/bikes/${bikeId}`)
        .send(input)
        .expect(400);
  });

  it("validates UUIDs and reports missing bikes", async () => {
    for (const id of ["invalid", missingId]) {
      const status = id === "invalid" ? 400 : 404;
      await request(app.getHttpServer()).get(`/bikes/${id}`).expect(status);
      await request(app.getHttpServer())
        .patch(`/bikes/${id}`)
        .send({ priceCents: 100 })
        .expect(status);
      await request(app.getHttpServer()).delete(`/bikes/${id}`).expect(status);
    }
  });

  it("refuses to delete a bike that was already sold", async () => {
    await request(app.getHttpServer()).delete(`/bikes/${bikeId}`).expect(409);
    expect(
      await database.getRepository(BikeEntity).existsBy({ id: bikeId }),
    ).toBe(true);
    await request(app.getHttpServer())
      .delete(`/bikes/${fixtureIds.bikes[3]}`)
      .expect(204);
  });

  it("exposes no Hello World route", async () => {
    await request(app.getHttpServer()).get("/").expect(404);
  });
});
