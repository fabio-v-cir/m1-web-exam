import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";
import type { CreateBikeModel } from "../models/BikeModel";
import { BikeFormModal } from "./BikeFormModal";

interface AddBikeButtonProps {
  createBike: (input: CreateBikeModel) => Promise<void>;
}

export const AddBikeButton = ({ createBike }: AddBikeButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onSubmit = (input: CreateBikeModel) =>
    createBike(input).then(() => setIsOpen(false));

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsOpen(true)}
      >
        Add bike
      </Button>
      {isOpen && (
        <BikeFormModal
          title="New bike"
          okText="Add bike"
          onCancel={() => setIsOpen(false)}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};
