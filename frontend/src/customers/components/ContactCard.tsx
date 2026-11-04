import {
  CloseOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
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
  Typography,
} from "antd";
import { isAxiosError } from "axios";
import type { ReactNode } from "react";
import { useState } from "react";
import type {
  CustomerModel,
  UpdateCustomerModel,
} from "../models/CustomerModel";

interface ContactCardProps {
  customer: CustomerModel | null;
  isLoading: boolean;
  updateCustomer: (input: UpdateCustomerModel) => Promise<void>;
}

type ContactValues = {
  email: string;
  phone: string;
};

type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const toValues = (customer: CustomerModel): ContactValues => ({
  email: customer.email,
  phone: customer.phone ?? "",
});

const validate = (values: ContactValues): ContactErrors => {
  const errors: ContactErrors = {};
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Please enter a valid email";
  return errors;
};

export const ContactCard = ({
  customer,
  isLoading,
  updateCustomer,
}: ContactCardProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [values, setValues] = useState<ContactValues | null>(null);
  const [errors, setErrors] = useState<ContactErrors>({});

  const startEditing = () => {
    if (!customer) return;
    setValues(toValues(customer));
    setErrors({});
    setIsEditing(true);
  };

  const cancel = () => {
    setValues(null);
    setErrors({});
    setIsEditing(false);
  };

  const save = () => {
    if (!values) return;
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    updateCustomer({
      email: values.email.trim(),
      // null clears the phone on the backend
      phone: values.phone.trim() || null,
    })
      .then(cancel)
      .catch((error) => {
        // On failure, stay in edit mode so the changes are not lost
        if (isAxiosError(error) && error.response?.status === 409) {
          setErrors({ email: "This email is already in use" });
        }
      })
      .finally(() => setIsSaving(false));
  };

  const value = (content: ReactNode) =>
    isLoading ? <Skeleton.Input active size="small" /> : (content ?? "—");

  const items: DescriptionsProps["items"] = [
    {
      key: "email",
      label: (
        <Space>
          <MailOutlined />
          Email
        </Space>
      ),
      children: value(
        customer && <a href={`mailto:${customer.email}`}>{customer.email}</a>,
      ),
    },
    {
      key: "phone",
      label: (
        <Space>
          <PhoneOutlined />
          Phone
        </Space>
      ),
      children: value(
        customer?.phone && (
          <a href={`tel:${customer.phone}`}>{customer.phone}</a>
        ),
      ),
    },
  ];

  const textField = (
    name: keyof ContactValues,
    label: string,
    type: string = "text",
  ) =>
    values && (
      <>
        <label htmlFor={`contact-${name}`}>{label}</label>
        <Input
          id={`contact-${name}`}
          type={type}
          value={values[name]}
          status={errors[name] && "error"}
          onChange={(event) => {
            setValues({ ...values, [name]: event.target.value });
            setErrors({ ...errors, [name]: undefined });
          }}
        />
        {errors[name] && (
          <Typography.Text type="danger">{errors[name]}</Typography.Text>
        )}
      </>
    );

  return (
    <Card
      title="Contact"
      style={{ height: "100%" }}
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
            aria-label="Edit contact"
            disabled={!customer}
            onClick={startEditing}
          />
        )
      }
    >
      {isEditing && values ? (
        <Row gutter={[16, 16]}>
          <Col span={24}>{textField("email", "Email *", "email")}</Col>
          <Col span={24}>{textField("phone", "Phone", "tel")}</Col>
        </Row>
      ) : (
        <Descriptions column={1} items={items} />
      )}
    </Card>
  );
};
