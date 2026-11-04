import type { BikeModel } from "../models/bike.model";

export class BikeResponseDto {
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

  static fromModel(model: BikeModel): BikeResponseDto {
    return Object.assign(new BikeResponseDto(), model);
  }
}
