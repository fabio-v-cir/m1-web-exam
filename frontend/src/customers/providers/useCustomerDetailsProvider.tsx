import axios from "axios";
import { useState } from "react";
import type {
  CustomerModel,
  UpdateCustomerModel,
} from "../models/CustomerModel";
import type { PurchaseModel } from "../models/PurchaseModel";

export const useCustomerDetailsProvider = (customerId: string) => {
  const [customer, setCustomer] = useState<CustomerModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [purchases, setPurchases] = useState<PurchaseModel[]>([]);
  const [isPurchasesLoading, setIsPurchasesLoading] = useState<boolean>(true);

  const load = () => {
    setIsLoading(true);
    axios
      .get(`http://localhost:3000/customers/${customerId}`)
      .then((result) => setCustomer(result.data))
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loadPurchases = () => {
    setIsPurchasesLoading(true);
    axios
      .get(`http://localhost:3000/customers/${customerId}/bikes`)
      .then((result) => setPurchases(result.data))
      .finally(() => {
        setIsPurchasesLoading(false);
      });
  };

  // Returns the request so the caller can react to errors
  const updateCustomer = (input: UpdateCustomerModel) =>
    axios
      .patch<CustomerModel>(
        `http://localhost:3000/customers/${customerId}`,
        input,
      )
      .then((result) => setCustomer(result.data));

  return {
    customer,
    load,
    isLoading,
    updateCustomer,
    purchases,
    loadPurchases,
    isPurchasesLoading,
  };
};
