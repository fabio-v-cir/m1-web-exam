import { Column, Entity, PrimaryGeneratedColumn, Check } from "typeorm";

@Entity({ name: "bikes" })
@Check(
  "bikes_valid_numbers",
  "price_cents >= 0 AND frame_size_cm > 0 AND wheel_size_inches > 0 AND gear_count > 0 AND weight_kg > 0",
)
export class BikeEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @Column({ name: "brand", type: "text" })
  brand: string;

  @Column({ name: "model", type: "text" })
  model: string;

  @Column({ name: "description", type: "text" })
  description: string;

  @Column({ name: "category", type: "text" })
  category: string;

  @Column({ name: "frame_material", type: "text" })
  frameMaterial: string;

  @Column({ name: "frame_size_cm", type: "real" })
  frameSizeCm: number;

  @Column({ name: "wheel_size_inches", type: "real" })
  wheelSizeInches: number;

  @Column({ name: "gear_count", type: "integer" })
  gearCount: number;

  @Column({ name: "weight_kg", type: "real" })
  weightKg: number;

  @Column({ name: "electric", type: "boolean" })
  electric: boolean;

  @Column({ name: "price_cents", type: "integer" })
  priceCents: number;
}
