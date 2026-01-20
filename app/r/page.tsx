import { getRedis, KEY_UNUSED, KEY_USED } from "@/lib/redis";
import { getGoogleReviewUrl } from "@/lib/auth";

function pickOne<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 含中文字符就认为不是英文
function hasChinese(s: string) {
  return /[\u4e00-\u9fff]/.test(s);
}

export default async function RPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const lang = sp.lang ?? "en";

  const reviewUrl = getGoogleReviewUrl();

  // 只做英文模式；如果有人手动进 /r?lang=zh，直接给他跳Google即可（避免报错/逻辑混乱）
  if (lang !== "en") {
    return (
      <main style={{ maxWidth: 820, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Skina Review</h1>
        <p style={{ marginTop: 10 }}>请返回首页选择语言后继续。</p>
        {reviewUrl ? (
          <a href={reviewUrl} style={{ display: "inline-block", marginTop: 12, padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}>
            Open Google Review
          </a>
        ) : (
          <p style={{ marginTop: 12, color: "crimson" }}>GOOGLE_REVIEW_URL 没设置</p>
        )}
      </main>
    );
  }

  const redis = getRedis();

  const all = (await redis.smembers(KEY_UNUSED)) as string[] | null;
  const englishPool = (all ?? []).map((x) => x.trim()).filter(Boolean).filter((x) => !hasChinese(x));

  const line =
    englishPool.length > 0
      ? pickOne(englishPool)
      : "Great service and professional staff. Highly recommended!";

  // 标记已用（可选：如果你不想消耗池子，把这段注释掉）
  if (englishPool.length > 0) {
    await redis.srem(KEY_UNUSED, line);
    await redis.sadd(KEY_USED, line);
  }

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Skina Review (English)</h1>
      <p style={{ marginTop: 10 }}>Tap below to copy an English review template and go to Google Review.</p>

      <pre style={{ marginTop: 12, padding: 12, background: "#f6f6f6", borderRadius: 12, whiteSpace: "pre-wrap" }}>
        {line}
      </pre>

      {reviewUrl ? (
        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(line);
              window.location.href = reviewUrl;
            }}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
          >
            Copy & Go to Google Review
          </button>

          <a
            href={reviewUrl}
            style={{ display: "inline-block", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}
          >
            Open Google Review Only
          </a>
        </div>
      ) : (
        <p style={{ marginTop: 12, color: "crimson" }}>GOOGLE_REVIEW_URL 没设置</p>
      )}
    </main>
  );
}
