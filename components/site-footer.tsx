import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-fd-border">
      <div className="mx-auto max-w-3xl px-6 py-8 text-sm leading-6 text-fd-muted-foreground">
        <p>
          本站内容仅供个人学习与研究记录，不构成任何投资建议。股市有风险，决策请独立判断。
        </p>
        <p className="mt-2">
          <Link href="/about" className="underline-offset-4 hover:underline">
            关于与免责声明
          </Link>
        </p>
      </div>
    </footer>
  );
}
