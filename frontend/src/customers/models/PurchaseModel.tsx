export type PurchasedBikeModel = {
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
};

export type PurchaseModel = {
  id: string;
  customerId: string;
  bikeId: string;
  quantity: number;
  soldAt: string;
  unitPriceCents: number;
  bike: PurchasedBikeModel;
};
