import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--mw-border)]">
      <div className="mx-auto max-w-4xl px-6 py-12 text-center sm:text-left">
        <p className="text-sm leading-relaxed text-[var(--mw-text-secondary)]">
          本站内容仅供个人学习与研究记录，不构成任何投资建议。股市有风险，决策请独立判断。
        </p>
        <p className="mt-4">
          <Link
            href="/about"
            className="mw-link text-sm font-medium text-[var(--mw-text-secondary)]"
          >
            关于与免责声明
          </Link>
        </p>
      </div>
    </footer>
  );
}
