import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BikesController } from "./bikes.controller";
import { BikesRepository } from "./bikes.repository";
import { BikesService } from "./bikes.service";
import { BikeEntity } from "./entities/bike.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BikeEntity])],
  controllers: [BikesController],
  providers: [BikesService, BikesRepository],
})
export class BikesModule {}
