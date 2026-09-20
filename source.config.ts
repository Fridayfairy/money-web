import { defineConfig } from "fumadocs-mdx/config";
import remarkMath from "remark-math";
import remarkUnwrapImages from "remark-unwrap-images";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  mdxOptions: {
    // Function form (required here): the array form appends user plugins AFTER
    // fumadocs' built-in remarkImage, which by then has rewritten standalone
    // markdown images into `<img>` JSX flow nodes — too late for
    // remark-unwrap-images to still see a raw mdast `image` node. The default
    // chain is passed in and prepended with remark-unwrap-images, so an
    // image-only paragraph is lifted out of its `<p>` BEFORE remarkImage
    // rewrites the node. Without this, the `<img>` stays inside a paragraph
    // and MdxImg's `<figure>` renders as illegal `<p><figure>`, breaking
    // hydration (#418) on pages using titled images.
    // remark-math registers micromark extensions only (order-independent).
    remarkPlugins: (defaultPlugins) => [
      remarkUnwrapImages,
      remarkMath,
      ...defaultPlugins,
    ],
    // Function form: math nodes compile to `<code class="language-math">`, and
    // fumadocs' rehypeCode (Shiki) would fail on the unknown `math` language,
    // so rehype-katex must run BEFORE it. The default chain is passed in and
    // its original order is preserved.
    rehypePlugins: (defaultPlugins) => [rehypeKatex, ...defaultPlugins],
  },
});
