import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginationModel } from "../shared/models/pagination.model";
import { BikesRepository } from "./bikes.repository";
import type {
  BikeModel,
  CreateBikeModel,
  GetBikesModel,
  UpdateBikeModel,
} from "./models/bike.model";
import {
  BikeAlreadySoldError,
  BikeNotFoundError,
} from "./models/persistence-error.model";

@Injectable()
export class BikesService {
  constructor(
    @Inject(BikesRepository) private readonly repository: BikesRepository,
  ) {}

  findAll(pagination: PaginationModel): Promise<GetBikesModel> {
    return this.repository.findAll(pagination);
  }

  async findById(id: string): Promise<BikeModel> {
    const bike = await this.repository.findById(id);
    if (!bike) throw new NotFoundException("Bike not found");
    return bike;
  }

  create(input: CreateBikeModel): Promise<BikeModel> {
    return this.repository.create(input);
  }

  async update(id: string, input: UpdateBikeModel): Promise<BikeModel> {
    if (!Object.values(input).some((value) => value !== undefined))
      throw new BadRequestException("At least one field must be supplied");
    try {
      return await this.repository.update(id, input);
    } catch (error) {
      this.translateError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      this.translateError(error);
    }
  }

  private translateError(error: unknown): never {
    if (error instanceof BikeNotFoundError)
      throw new NotFoundException("Bike not found");
    if (error instanceof BikeAlreadySoldError)
      throw new ConflictException("This bike has already been sold");
    throw error;
  }
}
