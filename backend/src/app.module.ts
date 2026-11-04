import { Module } from "@nestjs/common";
import { BikesModule } from "./bikes/bikes.module";
import { CustomersModule } from "./customers/customers.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [DatabaseModule, CustomersModule, BikesModule],
})
export class AppModule {}
