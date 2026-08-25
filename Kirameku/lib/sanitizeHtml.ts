import sanitizeHtmlLib, { type IOptions } from "sanitize-html";

// Markdown 渲染产物统一消毒，防止任意 HTML 注入导致 XSS（服务端/客户端均可运行）。
// 使用 parse5 实现的 sanitize-html，避免 isomorphic-dompurify 在模块加载时无条件实例化
// jsdom，从而规避 Vercel/Turbopack SSR 下 ERR_REQUIRE_ESM 导致的动态路由 500。

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "a", "ul", "ol", "li", "blockquote", "pre", "code",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "img", "strong", "em", "b", "i", "u", "s", "del", "sup", "sub",
  "hr", "br", "span", "div", "dl", "dt", "dd", "mark",
  "details", "summary", "figure", "figcaption", "input",
];

const ALLOWED_ATTRIBUTES: IOptions["allowedAttributes"] = {
  "*": ["class", "id", "title"],
  a: ["href", "name", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  input: ["type", "checked", "disabled"],
  th: ["align"],
  td: ["align"],
};

const SANITIZE_OPTIONS: IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtmlLib.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
};

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, SANITIZE_OPTIONS);
}
