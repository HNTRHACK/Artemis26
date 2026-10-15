import { AppShell } from "@/components/AppShell";

export default function Layout({ children }: LayoutProps<"/faq">) {
  return <AppShell>{children}</AppShell>;
}
