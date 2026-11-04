import { CustomerDetails } from "../components/CustomerDetails";

interface CustomerDetailsPageProps {
  customerId: string;
}

export const CustomerDetailsPage = ({
  customerId,
}: CustomerDetailsPageProps) => {
  return <CustomerDetails customerId={customerId} />;
};
