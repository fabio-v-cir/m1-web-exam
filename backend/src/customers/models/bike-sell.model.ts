import type { PurchasedBikeModel } from "./purchased-bike.model";

export interface CreateBikeSellModel {
  bikeId: string;
  quantity: number;
}

export interface BikeSellModel {
  id: string;
  customerId: string;
  bikeId: string;
  quantity: number;
  soldAt: Date;
  unitPriceCents: number;
}

export interface PurchasedBikeSellModel extends BikeSellModel {
  bike: PurchasedBikeModel;
}
