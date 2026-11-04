import { DeleteOutlined } from "@ant-design/icons";
import { Button, Modal, Typography } from "antd";
import { isAxiosError } from "axios";
import { useState } from "react";
import type { BikeModel } from "../models/BikeModel";

interface DeleteBikeButtonProps {
  bike: BikeModel;
  deleteBike: (id: string) => Promise<void>;
}

export const DeleteBikeButton = ({
  bike,
  deleteBike,
}: DeleteBikeButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onCancel = () => {
    setError(null);
    setIsOpen(false);
  };

  const onConfirm = () => {
    setIsDeleting(true);
    deleteBike(bike.id)
      .then(onCancel)
      .catch((err) => {
        if (isAxiosError(err) && err.response?.status === 409) {
          setError("This bike has already been sold, it cannot be deleted.");
        } else {
          setError("Something went wrong, please try again.");
        }
      })
      .finally(() => setIsDeleting(false));
  };

  return (
    <>
      <Button danger onClick={() => setIsOpen(true)}>
        <DeleteOutlined />
      </Button>
      <Modal
        okButtonProps={{ danger: true }}
        open={isOpen}
        title={`Deleting ${bike.brand} ${bike.model}`}
        onCancel={onCancel}
        onOk={onConfirm}
        okText="Yes, delete"
        confirmLoading={isDeleting}
      >
        <p>
          You are about to delete the bike {bike.brand} {bike.model} from the
          catalogue. This action cannot be undone, are you sure ?
        </p>
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </Modal>
    </>
  );
};
