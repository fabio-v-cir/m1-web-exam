import { Outlet } from "@tanstack/react-router";
import { Col, Row } from "antd";
import Title from "antd/es/typography/Title";
import { AppMenu } from "./AppMenu";

export const Layout = () => {
  return (
    <div
      style={{
        fontFamily: "arial",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          borderWidth: "0 0 1px 0",
          borderStyle: "none none solid none",
          borderColor: "#ddd",
          backgroundColor: "#E4B158",
          paddingTop: ".5rem",
        }}
      >
        <Row>
          <Col>
            <Title style={{ margin: 0 }}>Bikez.ai</Title>
          </Col>
          <Col>
            <AppMenu />
          </Col>
        </Row>
      </header>
      <Outlet />
    </div>
  );
};
