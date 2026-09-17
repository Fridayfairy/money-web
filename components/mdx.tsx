import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

/** fumadocs remarkImage may pass a StaticImageData object instead of a plain string. */
function resolveStaticSrc(rawSrc: unknown): string | undefined {
  if (
    typeof rawSrc === "object" &&
    rawSrc !== null &&
    "src" in rawSrc &&
    typeof (rawSrc as { src: unknown }).src === "string"
  ) {
    return (rawSrc as { src: string }).src;
  }
  return rawSrc as string | undefined;
}

function MdxImg(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { className: incoming, alt, src: rawSrc, ...rest } = props;
  const base = "my-6 h-auto max-w-full rounded-xl border border-[var(--mw-border)] shadow-sm";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={resolveStaticSrc(rawSrc)}
      alt={alt ?? ""}
      className={[base, incoming].filter(Boolean).join(" ")}
    />
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    img: MdxImg,
    blockquote: (props) => {
      const { className: incoming, ...rest } = props;
      const base = "my-6 border-l-[3px] border-[var(--mw-accent)] pl-5 text-[var(--mw-text-secondary)] italic";
      return (
        <blockquote
          {...rest}
          className={[base, incoming].filter(Boolean).join(" ")}
        />
      );
    },
    code: (props) => {
      // If it's a block-level code (has className with language), let fumadocs handle it
      if (props.className?.includes("language-")) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Fallback = (defaultMdxComponents as any).code;
        if (Fallback) {
          return <Fallback {...props} />;
        }
        return <code {...props} />;
      }
      const base = "rounded bg-[var(--mw-border)] px-1.5 py-0.5 font-mono text-[0.875em]";
      return (
        <code
          {...props}
          className={[base, props.className].filter(Boolean).join(" ")}
        />
      );
    },
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
