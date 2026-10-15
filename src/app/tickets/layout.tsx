import { AppShell } from "@/components/AppShell";

export default function TicketsLayout({ children }: LayoutProps<"/tickets">) {
  return <AppShell>{children}</AppShell>;
}
