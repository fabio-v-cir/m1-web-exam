import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomersController } from "./customers.controller";
import { CustomersRepository } from "./customers.repository";
import { CustomersService } from "./customers.service";
import { BikeSellEntity } from "./entities/bike-sell.entity";
import { CustomerEntity } from "./entities/customer.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity, BikeSellEntity])],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersRepository],
})
export class CustomersModule {}
