import {
  ContactsOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Col, Row, Space } from "antd";
import { ButtonLink } from "../../shared/components/ButtonLink";
import { ListItem } from "../../shared/components/ListItem";
import type { CustomerModel } from "../models/CustomerModel";
import { DeleteCustomerButton } from "./DeleteUserButton";

interface CustomerListItemProps {
  customer: CustomerModel;
  deleteCustomer: (id: string) => void;
}

export const CustomerListItem = ({
  customer,
  deleteCustomer,
}: CustomerListItemProps) => {
  return (
    <ListItem>
      <Col span={8}>
        <Space orientation="horizontal" style={{ width: "100%" }}>
          <ContactsOutlined />
          {`${customer.lastName} ${customer.firstName}`}
        </Space>
      </Col>
      <Col span={10}>
        <Space orientation="horizontal" style={{ width: "100%" }}>
          <MailOutlined />
          {customer.email}
        </Space>
      </Col>
      <Col span={4}>
        <Space orientation="horizontal" style={{ width: "100%" }}>
          <PhoneOutlined />
          {customer.phone}
        </Space>
      </Col>
      <Col span={2}>
        <Row gutter={[4, 4]}>
          <Col>
            <ButtonLink
              to={`/customers/$customerId`}
              params={{ customerId: customer.id }}
            >
              <EyeOutlined />
            </ButtonLink>
          </Col>
          <Col>
            <DeleteCustomerButton
              customer={customer}
              deleteCustomer={deleteCustomer}
            />
          </Col>
        </Row>
      </Col>
    </ListItem>
  );
};
