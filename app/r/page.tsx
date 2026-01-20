// app/r/page.tsx
export const dynamic = "force-dynamic";

import { getRedis, KEY_UNUSED, KEY_USED } from "@/lib/redis";
import { getGoogleReviewUrl } from "@/lib/auth";

function pickOne<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hasChinese(s: string) {
  return /[\u4e00-\u9fff]/.test(s);
}

export default async function KioskPage({
  searchParams,
}: {
  searchParams?: { lang?: string };
}) {
  const lang = (searchParams?.lang || "zh").toLowerCase(); // zh | en
  const redis = getRedis();
  const reviewUrl = getGoogleReviewUrl();

  const all = ((await redis.smembers(KEY_UNUSED)) as string[]) || [];

  // 1) 先按语言过滤
  let candidates =
    lang === "en" ? all.filter((x) => !hasChinese(x)) : all.filter((x) => hasChinese(x));

  // 2) 如果该语言池为空：兜底（避免空白）
  const fallbackZh = "服务很好，环境干净，体验很专业！";
  const fallbackEn = "Great service, clean environment, and very professional staff!";

  const line = candidates.length ? pickOne(candidates) : (lang === "en" ? fallbackEn : fallbackZh);

  // 3) 只有当这个 line 是从 Redis 抽出来的，才标记为 used
  if (candidates.length) {
    await redis.srem(KEY_UNUSED, line);
    await redis.sadd(KEY_USED, line);
  }

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Skina Review Helper</h1>

      <p style={{ marginTop: 10 }}>
        {lang === "en"
          ? "Tap to copy the review text, then open Google Review."
          : "点击复制评价文案，然后打开 Google Review 粘贴提交。"}
      </p>

      <pre
        style={{
          marginTop: 12,
          padding: 14,
          background: "#f6f6f6",
          borderRadius: 12,
          whiteSpace: "pre-wrap",
          fontSize: 16,
        }}
      >
        {line}
      </pre>

      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(line);
            alert(lang === "en" ? "Copied!" : "已复制！");
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {lang === "en" ? "Copy" : "复制"}
        </button>

        {reviewUrl ? (
          <a
            href={reviewUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            {lang === "en" ? "Open Google Review" : "打开 Google 评价"}
          </a>
        ) : (
          <span style={{ color: "crimson" }}>
            {lang === "en" ? "GOOGLE_REVIEW_URL not set" : "GOOGLE_REVIEW_URL 未设置"}
          </span>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <a href="/" style={{ color: "#555" }}>
          ← {lang === "en" ? "Back" : "返回"}
        </a>
      </div>
    </main>
  );
}
