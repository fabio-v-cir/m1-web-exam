import { Row } from "antd";
import type { ReactNode } from "react";

interface ListItemProps {
  children: ReactNode | ReactNode[];
}

export const ListItem = ({ children }: ListItemProps) => {
  return (
    <Row
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#ddd",
        borderRadius: ".25rem",
        padding: ".25rem .5rem",
      }}
    >
      {children}
    </Row>
  );
};
