import { AppShell } from "@/components/AppShell";

export default function Layout({ children }: LayoutProps<"/install">) {
  return <AppShell>{children}</AppShell>;
}
