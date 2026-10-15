import { AppShell } from "@/components/AppShell";

export default function EmployerLayout({ children }: LayoutProps<"/employer">) {
  return <AppShell role="employer">{children}</AppShell>;
}
