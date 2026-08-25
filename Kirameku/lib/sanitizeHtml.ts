import DOMPurify from "isomorphic-dompurify";

// Markdown 渲染产物统一消毒，防止任意 HTML 注入导致 XSS（服务端/客户端均可运行）
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}
