import type { Relation } from "typeorm";
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BikeEntity } from "../../bikes/entities/bike.entity";
import { CustomerEntity } from "./customer.entity";

@Entity({ name: "bike_sells" })
@Check("bike_sells_valid_numbers", "quantity > 0 AND unit_price_cents >= 0")
export class BikeSellEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @Column({ name: "customer_id", type: "text" })
  customerId: string;

  @Column({ name: "bike_id", type: "text" })
  bikeId: string;

  @Column({ name: "quantity", type: "integer" })
  quantity: number;

  @Column({ name: "sold_at", type: "datetime" })
  soldAt: Date;

  @Column({ name: "unit_price_cents", type: "integer" })
  unitPriceCents: number;

  @ManyToOne(() => CustomerEntity, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "customer_id", referencedColumnName: "id" })
  customer: Relation<CustomerEntity>;

  @ManyToOne(() => BikeEntity, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "bike_id", referencedColumnName: "id" })
  bike: Relation<BikeEntity>;
}
