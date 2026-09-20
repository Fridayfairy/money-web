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
  const {
    className: incoming,
    alt,
    src: rawSrc,
    title,
    // Sensible defaults that callers may override explicitly.
    loading = "lazy",
    decoding = "async",
    ...rest
  } = props;

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={resolveStaticSrc(rawSrc)}
      alt={alt ?? ""}
      loading={loading}
      decoding={decoding}
      className={incoming}
    />
  );

  // `title` becomes the visible caption; `alt` stays on the image as the
  // alternative text and is never duplicated as a caption.
  if (title) {
    return <figure>{img}<figcaption>{title}</figcaption></figure>;
  }

  return img;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    img: MdxImg,
    // Semantic pass-through only: visual styles live in `.mw-prose blockquote`.
    blockquote: (props) => {
      const { className: incoming, ...rest } = props;
      return <blockquote {...rest} className={incoming} />;
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
