import {
  AppstoreOutlined,
  ContactsOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Space } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import { ButtonLink } from "../../shared/components/ButtonLink";

export const HomePage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: ".25rem .5rem",
      }}
    >
      <div>
        <Title level={2}>Welcome to Bikez.ai</Title>
        <Paragraph>
          Manage your bike shop's customers, your bike catalogue and keep track
          of every bike they bought.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <ContactsOutlined />
                Customers
              </Space>
            }
            style={{ height: "100%" }}
          >
            <Paragraph>
              Browse your customers, check their contact details and remove the
              ones you no longer need.
            </Paragraph>
            <ButtonLink to="/customers" type="primary">
              See customers
            </ButtonLink>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <AppstoreOutlined />
                Bikes
              </Space>
            }
            style={{ height: "100%" }}
          >
            <Paragraph>
              Browse the bike catalogue, add new models, update their details
              and remove the ones you no longer sell.
            </Paragraph>
            <ButtonLink to="/bikes" type="primary">
              See bikes
            </ButtonLink>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <ShoppingOutlined />
                Purchases
              </Space>
            }
            style={{ height: "100%" }}
          >
            <Paragraph>
              Open a customer's page to see the bikes they bought, when, and for
              how much.
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
