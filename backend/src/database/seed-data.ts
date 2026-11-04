import { fakerFR as faker } from "@faker-js/faker";
import { randomUUID } from "node:crypto";
import type { DataSource } from "typeorm";
import { BikeEntity } from "../bikes/entities/bike.entity";
import { BikeSellEntity } from "../customers/entities/bike-sell.entity";
import { CustomerEntity } from "../customers/entities/customer.entity";

const locations = [
  { city: "Paris", postalCode: "75011" },
  { city: "Lyon", postalCode: "69003" },
  { city: "Nantes", postalCode: "44000" },
  { city: "Bordeaux", postalCode: "33000" },
  { city: "Lille", postalCode: "59000" },
  { city: "Toulouse", postalCode: "31000" },
  { city: "Strasbourg", postalCode: "67000" },
  { city: "Rennes", postalCode: "35000" },
];

// Match sizes, equipment, weight and price to the intended kind of bicycle.
const bikeProfiles = [
  {
    category: "road",
    series: "Route",
    wheels: [28],
    gears: [18, 20, 22, 24],
    materials: ["aluminium", "carbon"],
    weight: [7, 11],
    price: [900, 6000],
  },
  {
    category: "mountain",
    series: "Trail",
    wheels: [27.5, 29],
    gears: [10, 11, 12],
    materials: ["aluminium", "carbon"],
    weight: [11, 16],
    price: [600, 5000],
  },
  {
    category: "gravel",
    series: "Aventure",
    wheels: [27.5, 28],
    gears: [11, 12, 20, 22],
    materials: ["aluminium", "carbon", "steel"],
    weight: [9, 13],
    price: [900, 4500],
  },
  {
    category: "city",
    series: "Urbain",
    wheels: [26, 28],
    gears: [3, 7, 8],
    materials: ["aluminium", "steel"],
    weight: [12, 18],
    price: [350, 1500],
  },
  {
    category: "hybrid",
    series: "Évasion",
    wheels: [28],
    gears: [9, 18, 21, 24],
    materials: ["aluminium"],
    weight: [11, 16],
    price: [450, 1800],
  },
];

export interface SeedSummary {
  customers: number;
  bikes: number;
  sales: number;
}

// Each execution appends a fresh random dataset; it never clears existing data.
export async function seedDatabase(
  dataSource: DataSource,
): Promise<SeedSummary> {
  return dataSource.transaction(async (manager) => {
    const customerRepository = manager.getRepository(CustomerEntity);
    const existingCustomers = await customerRepository.find({
      select: { email: true },
    });
    const emails = new Set(existingCustomers.map((customer) => customer.email));
    const customers = Array.from({ length: 100 }, () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const id = randomUUID();
      const baseEmail = faker.internet
        .email({ firstName, lastName, provider: "example.com" })
        .toLowerCase();
      let email = baseEmail;
      let suffix = 1;
      while (emails.has(email)) {
        email = baseEmail.replace("@", `${suffix++}@`);
      }
      emails.add(email);
      return customerRepository.create({
        id,
        firstName,
        lastName,
        email,
        phone: faker.phone.number(),
        birthDate: faker.date
          .birthdate({ min: 18, max: 85, mode: "age" })
          .toISOString()
          .slice(0, 10),
        address: faker.location.streetAddress(),
        ...faker.helpers.arrayElement(locations),
        country: "France",
      });
    });
    for (let index = 0; index < customers.length; index += 50) {
      await customerRepository.insert(customers.slice(index, index + 50));
    }

    const bikeRepository = manager.getRepository(BikeEntity);
    const bikes = Array.from({ length: 100 }, () => {
      const profile = faker.helpers.arrayElement(bikeProfiles);
      const electric = faker.datatype.boolean({ probability: 0.3 });
      const frameMaterial = faker.helpers.arrayElement(profile.materials);
      const model = `${profile.series}${electric ? " E" : ""} ${faker.number.int({ min: 1, max: 9 }) * 100}`;
      return bikeRepository.create({
        id: randomUUID(),
        brand: faker.helpers.arrayElement([
          "Trek",
          "Giant",
          "Lapierre",
          "Specialized",
          "Cannondale",
          "Scott",
          "Orbea",
          "Cube",
        ]),
        model,
        description: `Vélo ${profile.category} ${electric ? "à assistance électrique" : "musculaire"}, cadre en ${frameMaterial}, pour les sorties ${profile.category === "city" ? "du quotidien" : "sportives"}.`,
        category: profile.category,
        frameMaterial,
        frameSizeCm: faker.helpers.arrayElement([
          46, 48, 50, 52, 54, 56, 58, 60,
        ]),
        wheelSizeInches: faker.helpers.arrayElement(profile.wheels),
        gearCount: faker.helpers.arrayElement(profile.gears),
        weightKg: faker.number.float({
          min: profile.weight[0] + (electric ? 7 : 0),
          max: profile.weight[1] + (electric ? 9 : 0),
          fractionDigits: 1,
        }),
        electric,
        priceCents:
          (faker.number.int({ min: profile.price[0], max: profile.price[1] }) +
            (electric ? 1200 : 0)) *
          100,
      });
    });
    for (let index = 0; index < bikes.length; index += 50) {
      await bikeRepository.insert(bikes.slice(index, index + 50));
    }

    const saleRepository = manager.getRepository(BikeSellEntity);
    const sales = customers.flatMap((customer) =>
      Array.from({ length: faker.number.int({ min: 2, max: 10 }) }, () => {
        const bike = faker.helpers.arrayElement(bikes);
        return saleRepository.create({
          id: randomUUID(),
          customerId: customer.id,
          bikeId: bike.id,
          quantity: faker.helpers.arrayElement([1, 1, 1, 1, 2, 3]),
          soldAt: faker.date.past({ years: 2 }),
          unitPriceCents: bike.priceCents,
        });
      }),
    );
    // Keep batches below SQLite's parameter limit, including on older builds.
    for (let index = 0; index < sales.length; index += 100) {
      await saleRepository.insert(sales.slice(index, index + 100));
    }
    return {
      customers: customers.length,
      bikes: bikes.length,
      sales: sales.length,
    };
  });
}
