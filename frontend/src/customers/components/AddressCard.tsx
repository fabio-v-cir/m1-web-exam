import {
  CloseOutlined,
  EditOutlined,
  EnvironmentOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import type { DescriptionsProps } from "antd";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  Row,
  Skeleton,
  Space,
} from "antd";
import type { ReactNode } from "react";
import { useState } from "react";
import type {
  CustomerModel,
  UpdateCustomerModel,
} from "../models/CustomerModel";

interface AddressCardProps {
  customer: CustomerModel | null;
  isLoading: boolean;
  updateCustomer: (input: UpdateCustomerModel) => Promise<void>;
}

type AddressValues = {
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

const toValues = (customer: CustomerModel): AddressValues => ({
  address: customer.address ?? "",
  postalCode: customer.postalCode ?? "",
  city: customer.city ?? "",
  country: customer.country ?? "",
});

export const AddressCard = ({
  customer,
  isLoading,
  updateCustomer,
}: AddressCardProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [values, setValues] = useState<AddressValues | null>(null);

  const startEditing = () => {
    if (!customer) return;
    setValues(toValues(customer));
    setIsEditing(true);
  };

  const cancel = () => {
    setValues(null);
    setIsEditing(false);
  };

  // Every field is optional, so there is nothing to validate
  const save = () => {
    if (!values) return;
    setIsSaving(true);
    // null clears a field on the backend
    updateCustomer({
      address: values.address.trim() || null,
      postalCode: values.postalCode.trim() || null,
      city: values.city.trim() || null,
      country: values.country.trim() || null,
    })
      .then(cancel)
      // On failure, stay in edit mode so the changes are not lost
      .catch(() => {})
      .finally(() => setIsSaving(false));
  };

  const value = (content: ReactNode) =>
    isLoading ? <Skeleton.Input active size="small" /> : (content ?? "—");

  const items: DescriptionsProps["items"] = [
    { key: "address", label: "Street", children: value(customer?.address) },
    {
      key: "postalCode",
      label: "Postal code",
      children: value(customer?.postalCode),
    },
    { key: "city", label: "City", children: value(customer?.city) },
    { key: "country", label: "Country", children: value(customer?.country) },
  ];

  const textField = (name: keyof AddressValues, label: string) =>
    values && (
      <>
        <label htmlFor={`address-${name}`}>{label}</label>
        <Input
          id={`address-${name}`}
          value={values[name]}
          onChange={(event) =>
            setValues({ ...values, [name]: event.target.value })
          }
        />
      </>
    );

  return (
    <Card
      title={
        <Space>
          <EnvironmentOutlined />
          Address
        </Space>
      }
      extra={
        isEditing ? (
          <Space>
            <Button icon={<CloseOutlined />} onClick={cancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={isSaving}
              onClick={save}
            >
              Save
            </Button>
          </Space>
        ) : (
          <Button
            icon={<EditOutlined />}
            aria-label="Edit address"
            disabled={!customer}
            onClick={startEditing}
          />
        )
      }
    >
      {isEditing && values ? (
        <Row gutter={[16, 16]}>
          <Col span={24}>{textField("address", "Street")}</Col>
          <Col span={8}>{textField("postalCode", "Postal code")}</Col>
          <Col span={8}>{textField("city", "City")}</Col>
          <Col span={8}>{textField("country", "Country")}</Col>
        </Row>
      ) : (
        <Descriptions column={{ xs: 1, md: 2 }} items={items} />
      )}
    </Card>
  );
};
