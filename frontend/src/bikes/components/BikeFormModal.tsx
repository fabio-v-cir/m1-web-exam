import { Col, Input, InputNumber, Modal, Row, Switch, Typography } from "antd";
import { useState } from "react";
import type { BikeModel, CreateBikeModel } from "../models/BikeModel";

interface BikeFormModalProps {
  title: string;
  okText: string;
  // when a bike is given, the form starts with its values (edition)
  bike?: BikeModel;
  onCancel: () => void;
  onSubmit: (input: CreateBikeModel) => Promise<void>;
}

type TextField = "brand" | "model" | "category" | "frameMaterial";

type NumberField =
  "frameSizeCm" | "wheelSizeInches" | "gearCount" | "weightKg" | "price";

type BikeFormValues = Record<TextField, string> &
  Record<NumberField, number | null> & {
    description: string;
    electric: boolean;
  };

type BikeFormErrors = Partial<Record<TextField | NumberField, string>>;

const emptyValues: BikeFormValues = {
  brand: "",
  model: "",
  category: "",
  frameMaterial: "",
  description: "",
  frameSizeCm: null,
  wheelSizeInches: null,
  gearCount: null,
  weightKg: null,
  price: null,
  electric: false,
};

const toValues = (bike?: BikeModel): BikeFormValues => {
  if (!bike) return emptyValues;
  return {
    brand: bike.brand,
    model: bike.model,
    category: bike.category,
    frameMaterial: bike.frameMaterial,
    description: bike.description,
    frameSizeCm: bike.frameSizeCm,
    wheelSizeInches: bike.wheelSizeInches,
    gearCount: bike.gearCount,
    weightKg: bike.weightKg,
    price: bike.priceCents / 100,
    electric: bike.electric,
  };
};

const validate = (values: BikeFormValues): BikeFormErrors => {
  const errors: BikeFormErrors = {};
  if (!values.brand.trim()) errors.brand = "Brand is required";
  if (!values.model.trim()) errors.model = "Model is required";
  if (!values.category.trim()) errors.category = "Category is required";
  if (!values.frameMaterial.trim())
    errors.frameMaterial = "Frame material is required";
  if (!values.frameSizeCm || values.frameSizeCm <= 0)
    errors.frameSizeCm = "Must be greater than 0";
  if (!values.wheelSizeInches || values.wheelSizeInches <= 0)
    errors.wheelSizeInches = "Must be greater than 0";
  if (!values.weightKg || values.weightKg <= 0)
    errors.weightKg = "Must be greater than 0";
  if (!values.gearCount || !Number.isInteger(values.gearCount))
    errors.gearCount = "Must be a whole number greater than 0";
  if (values.price === null || values.price < 0)
    errors.price = "Price is required";
  return errors;
};

const toCreateBikeModel = (values: BikeFormValues): CreateBikeModel => ({
  brand: values.brand.trim(),
  model: values.model.trim(),
  category: values.category.trim(),
  frameMaterial: values.frameMaterial.trim(),
  description: values.description.trim(),
  frameSizeCm: values.frameSizeCm ?? 0,
  wheelSizeInches: values.wheelSizeInches ?? 0,
  gearCount: values.gearCount ?? 0,
  weightKg: values.weightKg ?? 0,
  // the API stores prices in cents
  priceCents: Math.round((values.price ?? 0) * 100),
  electric: values.electric,
});

export const BikeFormModal = ({
  title,
  okText,
  bike,
  onCancel,
  onSubmit,
}: BikeFormModalProps) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [values, setValues] = useState<BikeFormValues>(toValues(bike));
  const [errors, setErrors] = useState<BikeFormErrors>({});

  const onConfirm = () => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    onSubmit(toCreateBikeModel(values))
      // on failure the modal stays open so the values are not lost
      .catch(() => {})
      .finally(() => setIsSaving(false));
  };

  const errorText = (name: TextField | NumberField) =>
    errors[name] && (
      <Typography.Text type="danger">{errors[name]}</Typography.Text>
    );

  const textField = (name: TextField, label: string) => (
    <>
      <label htmlFor={`bike-${name}`}>{label}</label>
      <Input
        id={`bike-${name}`}
        value={values[name]}
        status={errors[name] && "error"}
        onChange={(event) => {
          setValues({ ...values, [name]: event.target.value });
          setErrors({ ...errors, [name]: undefined });
        }}
      />
      {errorText(name)}
    </>
  );

  const numberField = (name: NumberField, label: string, step: number = 1) => (
    <>
      <label htmlFor={`bike-${name}`}>{label}</label>
      <InputNumber
        id={`bike-${name}`}
        style={{ width: "100%" }}
        min={0}
        step={step}
        value={values[name]}
        status={errors[name] && "error"}
        onChange={(value) => {
          setValues({ ...values, [name]: value });
          setErrors({ ...errors, [name]: undefined });
        }}
      />
      {errorText(name)}
    </>
  );

  return (
    <Modal
      open
      title={title}
      okText={okText}
      onCancel={onCancel}
      onOk={onConfirm}
      confirmLoading={isSaving}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>{textField("brand", "Brand *")}</Col>
        <Col span={12}>{textField("model", "Model *")}</Col>
        <Col span={12}>{textField("category", "Category *")}</Col>
        <Col span={12}>{textField("frameMaterial", "Frame material *")}</Col>
        <Col span={24}>
          <label htmlFor="bike-description">Description</label>
          <Input.TextArea
            id="bike-description"
            rows={3}
            value={values.description}
            onChange={(event) =>
              setValues({ ...values, description: event.target.value })
            }
          />
        </Col>
        <Col span={12}>{numberField("frameSizeCm", "Frame size (cm) *")}</Col>
        <Col span={12}>
          {numberField("wheelSizeInches", "Wheel size (inches) *", 0.5)}
        </Col>
        <Col span={12}>{numberField("gearCount", "Gears *")}</Col>
        <Col span={12}>{numberField("weightKg", "Weight (kg) *", 0.1)}</Col>
        <Col span={12}>{numberField("price", "Price (€) *", 0.01)}</Col>
        <Col span={12}>
          <label htmlFor="bike-electric">Electric</label>
          <div>
            <Switch
              id="bike-electric"
              checked={values.electric}
              onChange={(checked) =>
                setValues({ ...values, electric: checked })
              }
            />
          </div>
        </Col>
      </Row>
    </Modal>
  );
};
