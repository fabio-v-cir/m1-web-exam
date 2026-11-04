import type { GetBikesModel } from "../models/bike.model";
import { BikeResponseDto } from "./bike-response.dto";

export class GetBikesResponseDto {
  totalCount: number;
  bikes: BikeResponseDto[];

  static fromModel(model: GetBikesModel): GetBikesResponseDto {
    return Object.assign(new GetBikesResponseDto(), {
      totalCount: model.totalCount,
      bikes: model.bikes.map((bike) => BikeResponseDto.fromModel(bike)),
    });
  }
}
