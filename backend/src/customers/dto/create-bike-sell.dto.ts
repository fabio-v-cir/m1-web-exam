import { IsInt, IsUUID, Min } from "class-validator";

export class CreateBikeSellDto {
  @IsUUID()
  bikeId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
