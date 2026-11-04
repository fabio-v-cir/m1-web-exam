import { Empty, Space } from "antd";
import Title from "antd/es/typography/Title";
import type { PurchaseModel } from "../models/PurchaseModel";
import { CustomerPurchaseListItem } from "./CustomerPurchaseListItem";

interface CustomerPurchasesListProps {
  purchases: PurchaseModel[];
  isLoading: boolean;
}

export const CustomerPurchasesList = ({
  purchases,
  isLoading,
}: CustomerPurchasesListProps) => {
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Title level={3} style={{ margin: 0 }}>
        Purchases
      </Title>
      {isLoading ? (
        [0, 1, 2].map((index) => <CustomerPurchaseListItem key={index} />)
      ) : purchases.length === 0 ? (
        <Empty description="No purchases yet" />
      ) : (
        purchases.map((purchase) => (
          <CustomerPurchaseListItem key={purchase.id} purchase={purchase} />
        ))
      )}
    </Space>
  );
};
