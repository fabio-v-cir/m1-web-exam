import { randomUUID } from "node:crypto";
import type { DataSource } from "typeorm";
import { BikeEntity } from "../../src/bikes/entities/bike.entity";
import { BikeSellEntity } from "../../src/customers/entities/bike-sell.entity";
import { CustomerEntity } from "../../src/customers/entities/customer.entity";

export const fixtureIds = {
  customers: Array.from({ length: 3 }, () => randomUUID()),
  bikes: Array.from({ length: 4 }, () => randomUUID()),
  sales: Array.from({ length: 4 }, () => randomUUID()).sort(),
};

export async function populateShopFixture(
  dataSource: DataSource,
): Promise<void> {
  await dataSource.transaction(async (manager) => {
    const customers = manager.getRepository(CustomerEntity);
    const people = [
      {
        firstName: "Alice",
        lastName: "Martin",
        email: "alice@example.com",
        phone: "0601020304",
        birthDate: "1990-04-12",
        address: "12 rue des Lilas",
        postalCode: "75011",
        city: "Paris",
        country: "France",
      },
      {
        firstName: "Karim",
        lastName: "Bernard",
        email: "karim@example.com",
        city: "Lyon",
        country: "France",
      },
      { firstName: "Léa", lastName: "Durand", email: "lea@example.com" },
    ];
    for (const [index, person] of people.entries()) {
      const id = fixtureIds.customers[index];
      if (!(await customers.existsBy({ id })))
        await customers.insert({ id, ...person });
    }
    const bikes = manager.getRepository(BikeEntity);
    const catalogue = [
      {
        brand: "Veloria",
        model: "City 100",
        category: "city",
        priceCents: 49900,
        electric: false,
      },
      {
        brand: "Veloria",
        model: "Trail 500",
        category: "mountain",
        priceCents: 129900,
        electric: false,
      },
      {
        brand: "Cyclane",
        model: "Road 300",
        category: "road",
        priceCents: 189900,
        electric: false,
      },
      {
        brand: "Cyclane",
        model: "Urban E",
        category: "city",
        priceCents: 249900,
        electric: true,
      },
    ];
    for (const [index, bike] of catalogue.entries()) {
      const id = fixtureIds.bikes[index];
      if (!(await bikes.existsBy({ id })))
        await bikes.insert({
          id,
          description: `Vélo ${bike.model}`,
          frameMaterial: "aluminium",
          frameSizeCm: 54,
          wheelSizeInches: 28,
          gearCount: 9,
          weightKg: bike.electric ? 22.5 : 12.4,
          ...bike,
        });
    }
    const sales = manager.getRepository(BikeSellEntity);
    for (let index = 0; index < fixtureIds.sales.length; index++) {
      const id = fixtureIds.sales[index];
      if (await sales.existsBy({ id })) continue;
      const bikeId = fixtureIds.bikes[index < 2 ? 0 : index - 1];
      const bike = await bikes.findOneByOrFail({ id: bikeId });
      await sales.insert({
        id,
        customerId: fixtureIds.customers[index < 3 ? 0 : 1],
        bikeId,
        quantity: index === 1 ? 2 : 1,
        soldAt: new Date(`2026-01-0${index + 1}T10:00:00.000Z`),
        unitPriceCents: bike.priceCents,
      });
    }
  });
}
