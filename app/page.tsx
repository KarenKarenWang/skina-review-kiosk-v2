// app/page.tsx
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Skina Review</h1>

      <div style={{ lineHeight: 1.6 }}>
        <p style={{ margin: 0 }}>
          感谢您光临 Skina！如果您满意我们的服务，欢迎留下您的 Google 评价～
        </p>
        <p style={{ margin: "6px 0 0 0", color: "#555" }}>
          Thank you for visiting Skina! If you enjoyed your experience, please leave us a Google review.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
        <a
          href="/r?lang=zh"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #ddd",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          去评价（中文）
        </a>

        <a
          href="/r?lang=en"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #ddd",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Go to Review (English)
        </a>
      </div>

      <p style={{ marginTop: 16, color: "#777", fontSize: 13 }}>
        * 点击后会生成一段可复制的评价文案，并跳转到 Google Review 页面
      </p>
    </main>
  );
}
