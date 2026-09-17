import type { Metadata } from "next";
import { PageHeader } from "@/components/content-list";

export const metadata: Metadata = {
  title: "关于",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-6 py-12 sm:py-16">
      <PageHeader
        eyebrow="About"
        title="关于"
        description="MoneyWeb 是我的个人投研站点：笔记、随笔，以及做过的个股研报。"
      />
      <div className="mw-prose">
        <p>
          研报按股票和日期留档，方便过几个月还能对照当时的假设。笔记记方法，随笔记还没成形的观察。三者分开写，是为了以后能分清自己当时信的是哪一层。
        </p>
        <section className="mt-10">
          <h2 className="mw-heading-md">免责声明</h2>
          <p className="mt-3 text-[var(--mw-text-secondary)]">
            本站文字、图表与评分均为个人学习记录，不构成投资建议。市场有风险，据此操作的盈亏自行承担。
          </p>
        </section>
      </div>
    </main>
  );
}
