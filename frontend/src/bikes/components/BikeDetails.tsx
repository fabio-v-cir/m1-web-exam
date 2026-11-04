import { AppstoreOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import type { DescriptionsProps } from "antd";
import { Card, Descriptions, Skeleton, Space, Tag } from "antd";
import Title from "antd/es/typography/Title";
import { useEffect } from "react";
import { ButtonLink } from "../../shared/components/ButtonLink";
import { formatPrice } from "../../shared/utils/formatPrice";
import { useBikeDetailsProvider } from "../providers/useBikeDetailsProvider";
import { DeleteBikeButton } from "./DeleteBikeButton";
import { EditBikeButton } from "./EditBikeButton";

interface BikeDetailsProps {
  bikeId: string;
}

export const BikeDetails = ({ bikeId }: BikeDetailsProps) => {
  const { bike, isLoading, load, updateBike, deleteBike } =
    useBikeDetailsProvider(bikeId);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [bikeId]);

  const deleteAndGoBack = (id: string) =>
    deleteBike(id).then(() => {
      navigate({ to: "/bikes" });
    });

  const items: DescriptionsProps["items"] = bike
    ? [
        { key: "brand", label: "Brand", children: bike.brand },
        { key: "model", label: "Model", children: bike.model },
        { key: "category", label: "Category", children: bike.category },
        {
          key: "frameMaterial",
          label: "Frame material",
          children: bike.frameMaterial,
        },
        {
          key: "frameSizeCm",
          label: "Frame size",
          children: `${bike.frameSizeCm} cm`,
        },
        {
          key: "wheelSizeInches",
          label: "Wheel size",
          children: `${bike.wheelSizeInches}"`,
        },
        { key: "gearCount", label: "Gears", children: bike.gearCount },
        { key: "weightKg", label: "Weight", children: `${bike.weightKg} kg` },
        {
          key: "electric",
          label: "Electric",
          children: bike.electric ? "Yes" : "No",
        },
        {
          key: "price",
          label: "Price",
          children: formatPrice(bike.priceCents),
        },
        {
          key: "description",
          label: "Description",
          span: "filled",
          children: bike.description || "—",
        },
      ]
    : [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 16,
        padding: ".25rem .5rem",
      }}
    >
      <ButtonLink to="/bikes" icon={<ArrowLeftOutlined />}>
        Back to bikes
      </ButtonLink>

      <Space align="center">
        <AppstoreOutlined style={{ fontSize: "1.5rem" }} />
        {isLoading ? (
          <Skeleton.Input active size="large" />
        ) : (
          <Title level={2} style={{ margin: 0 }}>
            {bike ? `${bike.brand} ${bike.model}` : "Bike not found"}
          </Title>
        )}
        {bike?.electric && <Tag color="gold">Electric</Tag>}
      </Space>

      {isLoading ? (
        <Skeleton active />
      ) : (
        bike && (
          <Card
            title="Information"
            style={{ alignSelf: "stretch" }}
            extra={
              <Space>
                <EditBikeButton bike={bike} updateBike={updateBike} />
                <DeleteBikeButton bike={bike} deleteBike={deleteAndGoBack} />
              </Space>
            }
          >
            <Descriptions column={{ xs: 1, md: 2 }} items={items} />
          </Card>
        )
      )}
    </div>
  );
};
