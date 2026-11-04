import axios from "axios";
import { useState } from "react";
import type {
  CreateCustomerModel,
  CustomerModel,
  GetCustomersModel,
} from "../models/CustomerModel";

export const useCustomersProvider = () => {
  const [customers, setCustomers] = useState<CustomerModel[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const load = () => {
    setIsLoading(true);
    axios
      .get<GetCustomersModel>("http://localhost:3000/customers", {
        params: { page, limit },
      })
      .then((result) => {
        // the last page can become empty after a deletion
        if (result.data.customers.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setCustomers(result.data.customers);
        setTotalCount(result.data.totalCount);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const changePage = (newPage: number, newLimit: number) => {
    setPage(newPage);
    setLimit(newLimit);
  };

  const deleteCustomer = (id: string) => {
    axios.delete(`http://localhost:3000/customers/${id}`).then(() => {
      load();
    });
  };

  // Returns the request so the caller can react to errors (e.g. email already in use)
  const createCustomer = (input: CreateCustomerModel) =>
    axios
      .post<CustomerModel>("http://localhost:3000/customers", input)
      .then(() => load());

  return {
    customers,
    totalCount,
    page,
    limit,
    changePage,
    load,
    isLoading,
    deleteCustomer,
    createCustomer,
  };
};
