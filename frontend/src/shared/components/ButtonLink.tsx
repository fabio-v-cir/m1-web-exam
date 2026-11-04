import { createLink, type LinkComponent } from "@tanstack/react-router";
import { Button, type ButtonProps } from "antd";
import type { Ref } from "react";

type AntdButtonLinkProps = Omit<ButtonProps, "href"> & {
  href?: string;
  ref?: Ref<HTMLAnchorElement>;
};

// antd renders <Button> as an <a> when it receives an href,
// so this produces a real link styled like a button.
const AntdButtonLink = (props: AntdButtonLinkProps) => <Button {...props} />;

const CreatedButtonLink = createLink(AntdButtonLink);

export const ButtonLink: LinkComponent<typeof AntdButtonLink> = (props) => (
  <CreatedButtonLink preload="intent" {...props} />
);
