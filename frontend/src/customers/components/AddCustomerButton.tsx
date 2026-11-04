import { PlusOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Input, Modal, Row, Typography } from "antd";
import { isAxiosError } from "axios";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import type { CreateCustomerModel } from "../models/CustomerModel";

interface AddCustomerButtonProps {
  createCustomer: (input: CreateCustomerModel) => Promise<void>;
}

type TextField = Exclude<keyof CreateCustomerModel, "birthDate">;

type CustomerFormValues = Record<TextField, string> & {
  birthDate: Dayjs | null;
};

type CustomerFormErrors = Partial<Record<TextField, string>>;

const emptyValues: CustomerFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: null,
  address: "",
  postalCode: "",
  city: "",
  country: "",
};

const validate = (values: CustomerFormValues): CustomerFormErrors => {
  const errors: CustomerFormErrors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required";
  if (!values.lastName.trim()) errors.lastName = "Last name is required";
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Please enter a valid email";
  return errors;
};

const toCreateCustomerModel = (
  values: CustomerFormValues,
): CreateCustomerModel => {
  const optional = (value: string) => value.trim() || undefined;
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: optional(values.phone),
    birthDate: values.birthDate?.format("YYYY-MM-DD"),
    address: optional(values.address),
    postalCode: optional(values.postalCode),
    city: optional(values.city),
    country: optional(values.country),
  };
};

export const AddCustomerButton = ({
  createCustomer,
}: AddCustomerButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [values, setValues] = useState<CustomerFormValues>(emptyValues);
  const [errors, setErrors] = useState<CustomerFormErrors>({});

  const close = () => {
    setValues(emptyValues);
    setErrors({});
    setIsOpen(false);
  };

  const onConfirm = () => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    createCustomer(toCreateCustomerModel(values))
      .then(close)
      .catch((error) => {
        if (isAxiosError(error) && error.response?.status === 409) {
          setErrors({ email: "This email is already in use" });
        }
      })
      .finally(() => setIsSaving(false));
  };

  const textField = (name: TextField, label: string, type: string = "text") => (
    <>
      <label htmlFor={`customer-${name}`}>{label}</label>
      <Input
        id={`customer-${name}`}
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
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsOpen(true)}
      >
        Add customer
      </Button>
      <Modal
        open={isOpen}
        title="New customer"
        okText="Add customer"
        onCancel={close}
        onOk={onConfirm}
        confirmLoading={isSaving}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>{textField("firstName", "First name *")}</Col>
          <Col span={12}>{textField("lastName", "Last name *")}</Col>
          <Col span={12}>{textField("email", "Email *", "email")}</Col>
          <Col span={12}>{textField("phone", "Phone", "tel")}</Col>
          <Col span={24}>
            <label htmlFor="customer-birthDate">Birth date</label>
            <DatePicker
              id="customer-birthDate"
              style={{ width: "100%" }}
              value={values.birthDate}
              onChange={(date) => setValues({ ...values, birthDate: date })}
              disabledDate={(date) => date.isAfter(new Date(), "day")}
            />
          </Col>
          <Col span={24}>{textField("address", "Street")}</Col>
          <Col span={8}>{textField("postalCode", "Postal code")}</Col>
          <Col span={8}>{textField("city", "City")}</Col>
          <Col span={8}>{textField("country", "Country")}</Col>
        </Row>
      </Modal>
    </>
  );
};
