import { createFileRoute } from "@tanstack/react-router";
import { CustomerDetailsPage } from "../../customers/pages/CustomerDetailsPage";

export const Route = createFileRoute("/customers/$customerId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { customerId } = Route.useParams();
  return <CustomerDetailsPage customerId={customerId} />;
}
