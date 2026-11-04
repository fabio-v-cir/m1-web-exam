import "reflect-metadata";
import { DataSource } from "typeorm";
import { databaseOptions } from "./database-options";
import { seedDatabase } from "./seed-data";

async function main() {
  const dataSource = await new DataSource(databaseOptions).initialize();
  try {
    const summary = await seedDatabase(dataSource);
    console.log(
      `Seed completed: ${summary.customers} customers, ${summary.bikes} bikes, ${summary.sales} sales added. Existing records preserved.`,
    );
  } finally {
    await dataSource.destroy();
  }
}

void main();
