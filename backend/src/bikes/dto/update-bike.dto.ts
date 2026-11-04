import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from "class-validator";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const isDefined = (_object: unknown, value: unknown) => value !== undefined;

export class UpdateBikeDto {
  @ValidateIf(isDefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  brand?: string;

  @ValidateIf(isDefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  model?: string;

  @ValidateIf(isDefined)
  @Transform(trim)
  @IsString()
  description?: string;

  @ValidateIf(isDefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  category?: string;

  @ValidateIf(isDefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  frameMaterial?: string;

  @ValidateIf(isDefined)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  frameSizeCm?: number;

  @ValidateIf(isDefined)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  wheelSizeInches?: number;

  @ValidateIf(isDefined)
  @IsInt()
  @Min(1)
  gearCount?: number;

  @ValidateIf(isDefined)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  weightKg?: number;

  @ValidateIf(isDefined)
  @IsBoolean()
  electric?: boolean;

  @ValidateIf(isDefined)
  @IsInt()
  @Min(0)
  priceCents?: number;
}
