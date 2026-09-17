import { HomeLayout } from "fumadocs-ui/layouts/home";
import { SiteFooter } from "@/components/site-footer";
import { baseOptions } from "@/lib/layout.shared";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <HomeLayout
      {...baseOptions()}
      className="mw-page-bg flex min-h-screen flex-col"
    >
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </HomeLayout>
  );
}
