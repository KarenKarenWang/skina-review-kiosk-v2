"use client";

import { useState } from "react";

export default function ReviewClient({
  line,
  reviewUrl,
  lang,
}: {
  line: string;
  reviewUrl: string | null;
  lang: "zh" | "en";
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // 兜底：剪贴板失败时，提示用户手动复制
      alert(lang === "zh" ? "复制失败，请手动复制文本。" : "Copy failed. Please copy manually.");
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Skina Review</h1>

      <p style={{ margin: 0, color: "#666" }}>
        {lang === "zh"
          ? "请复制下方文案，然后点击按钮打开 Google Review。"
          : "Copy the text below, then click the button to open Google Review."}
      </p>

      <pre
        style={{
          marginTop: 12,
          padding: 12,
          background: "#f6f6f6",
          borderRadius: 12,
          whiteSpace: "pre-wrap",
          border: "1px solid #eee",
          fontSize: 15,
          lineHeight: 1.5,
        }}
      >
        {line}
      </pre>

      <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
        <button
          onClick={onCopy}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {copied ? (lang === "zh" ? "已复制 ✅" : "Copied ✅") : lang === "zh" ? "复制文案" : "Copy text"}
        </button>

        {reviewUrl ? (
          <a
            href={reviewUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            {lang === "zh" ? "去评价（打开 Google）" : "Open Google Review"}
          </a>
        ) : (
          <span style={{ color: "crimson" }}>
            {lang === "zh" ? "GOOGLE_REVIEW_URL 未配置" : "GOOGLE_REVIEW_URL is not set"}
          </span>
        )}
      </div>
    </main>
  );
}
