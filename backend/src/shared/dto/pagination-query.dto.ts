import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  // bigger numbers are not precise anymore and make the SQL query crash
  @Max(Number.MAX_SAFE_INTEGER)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
