import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "../home/pages/HomePage";

export const Route = createFileRoute("/")({
  component: HomePage,
});
