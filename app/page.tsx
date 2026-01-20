export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 600,
        margin: "80px auto",
        padding: 16,
        textAlign: "center",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        Skina Review Kiosk
      </h1>

      <p style={{ marginTop: 16, fontSize: 16 }}>
        谢谢您的到来 🙏  
        请点击下方按钮，系统将为您准备评价文案
      </p>

      <a
        href="/r"
        style={{
          display: "inline-block",
          marginTop: 32,
          padding: "16px 24px",
          borderRadius: 14,
          border: "1px solid #ddd",
          fontSize: 18,
          textDecoration: "none",
        }}
      >
        👉 去评价
      </a>
    </main>
  );
}
