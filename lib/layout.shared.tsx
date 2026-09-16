import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="font-medium tracking-tight">
          MoneyWeb
          <span className="ml-2 text-sm font-normal text-fd-muted-foreground">
            投研笔记
          </span>
        </span>
      ),
      transparentMode: "none",
    },
    githubUrl: "https://github.com/Fridayfairy/money-web",
    searchToggle: {
      enabled: false,
    },
    links: [
      { text: "研报", url: "/reports", active: "nested-url" },
      { text: "笔记", url: "/notes", active: "nested-url" },
      { text: "随笔", url: "/blog", active: "nested-url" },
      { text: "关于", url: "/about" },
    ],
  };
}
