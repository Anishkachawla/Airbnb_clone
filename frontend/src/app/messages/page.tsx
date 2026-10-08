import { Header } from "@/components/layout/Header";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Icon } from "@/components/ui/Icon";

export default function MessagesPage() {
  return (
    <>
      <Header variant="detail" />
      <ComingSoon art={<Icon name="message" size={40} strokeWidth={1.5} />} title="Messages" body="Chatting with hosts and guests isn't available in this demo yet. When it is, your conversations about upcoming trips will show up here." />
    </>
  );
}
