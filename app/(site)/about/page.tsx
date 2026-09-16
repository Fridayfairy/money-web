import type { Metadata } from "next";
import { PageHeader } from "@/components/content-list";

export const metadata: Metadata = {
  title: "关于",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <PageHeader
        title="关于"
        description="MoneyWeb 是我的个人投研站点：笔记、随笔，以及做过的个股研报。"
      />
      <div className="space-y-6 leading-7">
        <p>
          研报按股票和日期留档，方便过几个月还能对照当时的假设。笔记记方法，随笔记还没成形的观察。三者分开写，是为了以后能分清自己当时信的是哪一层。
        </p>
        <section>
          <h2 className="text-lg font-medium">免责声明</h2>
          <p className="mt-3 text-fd-muted-foreground">
            本站文字、图表与评分均为个人学习记录，不构成投资建议。市场有风险，据此操作的盈亏自行承担。
          </p>
        </section>
      </div>
    </main>
  );
}
