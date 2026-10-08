import { Header } from "@/components/layout/Header";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { BellIcon } from "@/components/ui/TabIcons";

export default function ServicesPage() {
  return (
    <>
      <Header variant="explore" />
      <ComingSoon art={<BellIcon size={72} />} title="Services" body="Private chefs, photographers and massages delivered to your stay. Booking services isn't part of this demo yet." />
    </>
  );
}
