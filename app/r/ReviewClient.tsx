"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Props = {
  line: string;
  reviewUrl: string | null;
  lang: "zh" | "en";
  bannerSrc?: string;
  logoSrc?: string;
};

export default function ReviewClient({
  line,
  reviewUrl,
  lang,
  bannerSrc = "/banner.png",
  logoSrc = "/logo.png",
}: Props) {
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => {
    return {
      zh: {
        title: "感谢您的支持",
        subtitle: "如果您今天的体验不错，欢迎复制推荐语并前往 Google 留下评价。",
        copy: "复制推荐语",
        copied: "已复制",
        go: "前往 Google 评价",
        tip: "建议先复制文案，再点击下方按钮去 Google，会更方便。",
        reviewTitle: "推荐评价参考",
        note: "温馨提示：您也可以根据自己的真实体验自由修改。",
      },
      en: {
        title: "Thank you for visiting",
        subtitle:
          "If you had a great experience today, feel free to copy the suggested review and leave your feedback on Google.",
        copy: "Copy review",
        copied: "Copied",
        go: "Leave a Google review",
        tip: "Copy the review first, then tap the button below to open Google.",
        reviewTitle: "Suggested review",
        note: "You are welcome to edit the wording based on your real experience.",
      },
    }[lang];
  }, [lang]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert(lang === "zh" ? "复制失败，请手动复制。" : "Copy failed. Please copy manually.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8f6f2 0%, #f4f1eb 45%, #efe9df 100%)",
        padding: "24px 16px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          <Image
            src={logoSrc}
            alt="Skina logo"
            width={120}
            height={120}
            priority
            style={{
              width: 88,
              height: 88,
              objectFit: "contain",
              borderRadius: 20,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              background: "#fff",
              padding: 10,
            }}
          />
        </div>

        
        <section
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: 28,
            padding: "28px 20px",
            boxShadow: "0 14px 40px rgba(0,0,0,0.08)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 30,
                lineHeight: 1.2,
                fontWeight: 700,
                margin: 0,
                color: "#1f1f1f",
                letterSpacing: "-0.02em",
              }}
            >
              {text.title}
            </h1>
            <p
              style={{
                margin: "12px auto 0",
                maxWidth: 560,
                fontSize: 16,
                lineHeight: 1.7,
                color: "#5b5b5b",
              }}
            >
              {text.subtitle}
            </p>
          </div>

          <div
            style={{
              marginBottom: 18,
              borderRadius: 22,
              background: "#f8f5ef",
              border: "1px solid #ece4d8",
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#7b6647",
                marginBottom: 12,
              }}
            >
              {text.reviewTitle}
            </div>

            <div
              style={{
                fontSize: 18,
                lineHeight: 1.9,
                color: "#2b2b2b",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "#fff",
                borderRadius: 18,
                padding: "18px 16px",
                border: "1px solid #eee6db",
              }}
            >
              {line}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            <button
              onClick={handleCopy}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 18,
                padding: "16px 18px",
                fontSize: 17,
                fontWeight: 600,
                cursor: "pointer",
                background: copied ? "#2f7d4d" : "#1f1f1f",
                color: "#fff",
                boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
                transition: "all 0.2s ease",
              }}
            >
              {copied ? text.copied : text.copy}
            </button>

            {reviewUrl ? (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  textDecoration: "none",
                  borderRadius: 18,
                  padding: "16px 18px",
                  fontSize: 17,
                  fontWeight: 600,
                  background: "#d8b77b",
                  color: "#1f1f1f",
                  boxShadow: "0 10px 24px rgba(216,183,123,0.28)",
                }}
              >
                {text.go}
              </a>
            ) : (
              <div
                style={{
                  borderRadius: 18,
                  padding: "16px 18px",
                  fontSize: 15,
                  textAlign: "center",
                  background: "#f2f2f2",
                  color: "#666",
                }}
              >
                {lang === "zh"
                  ? "Google 评价链接暂未配置。"
                  : "Google review link is not configured."}
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: 18,
              textAlign: "center",
              fontSize: 14,
              lineHeight: 1.7,
              color: "#7a7a7a",
            }}
          >
            <div>{text.tip}</div>
            <div style={{ marginTop: 6 }}>{text.note}</div>
          </div>
        </section>
      </div>
    </main>
  );
}