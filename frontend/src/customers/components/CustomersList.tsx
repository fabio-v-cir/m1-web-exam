import { Pagination, Skeleton, Space } from "antd";
import { useEffect } from "react";
import { useCustomersProvider } from "../providers/useCustomersProvider";
import { AddCustomerButton } from "./AddCustomerButton";
import { CustomerListItem } from "./CustomerListItem";

export const CustomersList = () => {
  const {
    customers,
    totalCount,
    page,
    limit,
    changePage,
    deleteCustomer,
    createCustomer,
    isLoading,
    load,
  } = useCustomersProvider();

  useEffect(() => {
    load();
  }, [page, limit]);

  return (
    <Space orientation="vertical" style={{ padding: ".25rem .5rem" }}>
      <AddCustomerButton createCustomer={createCustomer} />
      {isLoading ? (
        <Skeleton />
      ) : (
        customers.map((customer) => (
          <CustomerListItem
            key={customer.id}
            customer={customer}
            deleteCustomer={deleteCustomer}
          />
        ))
      )}
      {totalCount > 0 && (
        <Pagination
          current={page}
          pageSize={limit}
          total={totalCount}
          pageSizeOptions={[10, 20, 50]}
          showSizeChanger
          showTotal={(total) => `${total} customers`}
          onChange={changePage}
        />
      )}
    </Space>
  );
};
