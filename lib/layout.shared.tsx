import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="text-base font-semibold tracking-tight text-[var(--mw-text)]">
          MoneyWeb
          <span className="ml-2 text-sm font-normal text-[var(--mw-text-secondary)]">
            投研笔记
          </span>
        </span>
      ),
      transparentMode: "top",
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
