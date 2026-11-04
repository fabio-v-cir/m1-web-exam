import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "customers" })
export class CustomerEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @Column({ name: "first_name", type: "text" })
  firstName: string;

  @Column({ name: "last_name", type: "text" })
  lastName: string;

  @Column({ name: "email", type: "text", unique: true })
  email: string;

  @Column({ name: "phone", type: "text", nullable: true })
  phone: string | null;

  @Column({ name: "birth_date", type: "date", nullable: true })
  birthDate: string | null;

  @Column({ name: "address", type: "text", nullable: true })
  address: string | null;

  @Column({ name: "postal_code", type: "text", nullable: true })
  postalCode: string | null;

  @Column({ name: "city", type: "text", nullable: true })
  city: string | null;

  @Column({ name: "country", type: "text", nullable: true })
  country: string | null;
}
