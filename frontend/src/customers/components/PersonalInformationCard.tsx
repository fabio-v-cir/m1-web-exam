import {
  CalendarOutlined,
  CloseOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import type { DescriptionsProps } from "antd";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Input,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { useState } from "react";
import type {
  CustomerModel,
  UpdateCustomerModel,
} from "../models/CustomerModel";

interface PersonalInformationCardProps {
  customer: CustomerModel | null;
  isLoading: boolean;
  updateCustomer: (input: UpdateCustomerModel) => Promise<void>;
}

type PersonalInformationValues = {
  firstName: string;
  lastName: string;
  birthDate: Dayjs | null;
};

type PersonalInformationErrors = Partial<
  Record<"firstName" | "lastName", string>
>;

const formatBirthDate = (birthDate: string) =>
  new Date(birthDate).toLocaleDateString(undefined, {
    dateStyle: "long",
    timeZone: "UTC",
  });

const toValues = (customer: CustomerModel): PersonalInformationValues => ({
  firstName: customer.firstName,
  lastName: customer.lastName,
  birthDate: customer.birthDate ? dayjs(customer.birthDate) : null,
});

const validate = (
  values: PersonalInformationValues,
): PersonalInformationErrors => {
  const errors: PersonalInformationErrors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required";
  if (!values.lastName.trim()) errors.lastName = "Last name is required";
  return errors;
};

export const PersonalInformationCard = ({
  customer,
  isLoading,
  updateCustomer,
}: PersonalInformationCardProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [values, setValues] = useState<PersonalInformationValues | null>(null);
  const [errors, setErrors] = useState<PersonalInformationErrors>({});

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
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      // null clears the birth date on the backend
      birthDate: values.birthDate?.format("YYYY-MM-DD") ?? null,
    })
      .then(cancel)
      // On failure, stay in edit mode so the changes are not lost
      .catch(() => {})
      .finally(() => setIsSaving(false));
  };

  const value = (content: ReactNode) =>
    isLoading ? <Skeleton.Input active size="small" /> : (content ?? "—");

  const items: DescriptionsProps["items"] = [
    {
      key: "firstName",
      label: "First name",
      children: value(customer?.firstName),
    },
    {
      key: "lastName",
      label: "Last name",
      children: value(customer?.lastName),
    },
    {
      key: "birthDate",
      label: (
        <Space>
          <CalendarOutlined />
          Birth date
        </Space>
      ),
      children: value(
        customer?.birthDate && formatBirthDate(customer.birthDate),
      ),
    },
  ];

  const textField = (name: "firstName" | "lastName", label: string) =>
    values && (
      <>
        <label htmlFor={`personal-${name}`}>{label}</label>
        <Input
          id={`personal-${name}`}
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
      title="Personal information"
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
            aria-label="Edit personal information"
            disabled={!customer}
            onClick={startEditing}
          />
        )
      }
    >
      {isEditing && values ? (
        <Row gutter={[16, 16]}>
          <Col span={12}>{textField("firstName", "First name *")}</Col>
          <Col span={12}>{textField("lastName", "Last name *")}</Col>
          <Col span={24}>
            <label htmlFor="personal-birthDate">Birth date</label>
            <DatePicker
              id="personal-birthDate"
              style={{ width: "100%" }}
              value={values.birthDate}
              onChange={(date) => setValues({ ...values, birthDate: date })}
              disabledDate={(date) => date.isAfter(new Date(), "day")}
            />
          </Col>
        </Row>
      ) : (
        <Descriptions column={1} items={items} />
      )}
    </Card>
  );
};
