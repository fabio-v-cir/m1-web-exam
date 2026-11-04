import type { GetCustomersModel } from "../models/customer.model";
import { CustomerResponseDto } from "./customer-response.dto";

export class GetCustomersResponseDto {
  totalCount: number;
  customers: CustomerResponseDto[];

  static fromModel(model: GetCustomersModel): GetCustomersResponseDto {
    return Object.assign(new GetCustomersResponseDto(), {
      totalCount: model.totalCount,
      customers: model.customers.map((customer) =>
        CustomerResponseDto.fromModel(customer),
      ),
    });
  }
}
