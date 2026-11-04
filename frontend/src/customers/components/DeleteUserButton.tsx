import { DeleteOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useState } from "react";
import type { CustomerModel } from "../models/CustomerModel";

interface DeleteCustomerButtonProps {
  customer: CustomerModel;
  deleteCustomer: (id: string) => void;
}
export const DeleteCustomerButton = ({
  customer,
  deleteCustomer,
}: DeleteCustomerButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onCancel = () => {
    setIsOpen(false);
  };

  const onConfirm = () => {
    deleteCustomer(customer.id);
    setIsOpen(false);
  };

  return (
    <>
      <Button danger onClick={() => setIsOpen(true)}>
        <DeleteOutlined />
      </Button>
      <Modal
        okButtonProps={{ danger: true }}
        open={isOpen}
        title={`Deleting ${customer.firstName}`}
        onCancel={onCancel}
        onOk={onConfirm}
        okText="Yes, delete"
      >
        You are about to delete the customer {customer.lastName}{" "}
        {customer.firstName}. This action cannot be undone, are you sure ?
      </Modal>
    </>
  );
};
