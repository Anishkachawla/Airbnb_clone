import { Header } from "@/components/layout/Header";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { BalloonIcon } from "@/components/ui/TabIcons";

export default function ExperiencesPage() {
  return (
    <>
      <Header variant="explore" />
      <ComingSoon art={<BalloonIcon size={72} />} title="Experiences" body="Food tours, workshops and outdoor adventures hosted by locals. Booking experiences isn't part of this demo yet." />
    </>
  );
}
