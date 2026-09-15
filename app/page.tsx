export default function Home() {
  const deployedAt = "GitHub → Vercel 调试页";

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background px-6 py-16">
      <main className="w-full max-w-xl rounded-2xl border border-black/8 bg-white p-8 shadow-sm dark:border-white/12 dark:bg-zinc-950">
        <p className="text-sm font-medium tracking-wide text-zinc-500">
          {deployedAt}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Hello, MoneyWeb
        </h1>
        <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-400">
          这是个人博客的占位首页，用来验证 GitHub 推送后 Vercel
          会自动构建并发布。后面再换成正式内容即可。
        </p>
        <dl className="mt-8 grid gap-3 text-sm">
          <div className="flex justify-between gap-4 border-t border-black/6 pt-3 dark:border-white/10">
            <dt className="text-zinc-500">框架</dt>
            <dd>Next.js App Router</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-black/6 pt-3 dark:border-white/10">
            <dt className="text-zinc-500">托管</dt>
            <dd>Vercel 分配域名</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-black/6 pt-3 dark:border-white/10">
            <dt className="text-zinc-500">状态</dt>
            <dd>页面渲染正常</dd>
          </div>
        </dl>
      </main>
    </div>
  );
}
