import type {
  BikeSellModel,
  PurchasedBikeSellModel,
} from "../models/bike-sell.model";
import type { PurchasedBikeModel } from "../models/purchased-bike.model";

export class BikeSellResponseDto {
  id: string;
  customerId: string;
  bikeId: string;
  quantity: number;
  soldAt: string;
  unitPriceCents: number;

  static fromModel(model: BikeSellModel): BikeSellResponseDto {
    return Object.assign(new BikeSellResponseDto(), {
      id: model.id,
      customerId: model.customerId,
      bikeId: model.bikeId,
      quantity: model.quantity,
      soldAt: model.soldAt.toISOString(),
      unitPriceCents: model.unitPriceCents,
    });
  }
}

export class PurchasedBikeResponseDto {
  id: string;
  brand: string;
  model: string;
  description: string;
  category: string;
  frameMaterial: string;
  frameSizeCm: number;
  wheelSizeInches: number;
  gearCount: number;
  weightKg: number;
  electric: boolean;
  priceCents: number;

  static fromModel(model: PurchasedBikeModel): PurchasedBikeResponseDto {
    return Object.assign(new PurchasedBikeResponseDto(), model);
  }
}

export class PurchasedBikeSellResponseDto extends BikeSellResponseDto {
  bike: PurchasedBikeResponseDto;

  static override fromModel(
    model: PurchasedBikeSellModel,
  ): PurchasedBikeSellResponseDto {
    return Object.assign(
      new PurchasedBikeSellResponseDto(),
      super.fromModel(model),
      { bike: PurchasedBikeResponseDto.fromModel(model.bike) },
    );
  }
}
