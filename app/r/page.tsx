import { getRedis, KEY_UNUSED, KEY_USED } from "@/lib/redis";
import { getGoogleReviewUrl } from "@/lib/auth";

export const dynamic = "force-dynamic";

function pickOne<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function KioskPage() {
  const redis = getRedis();
  const reviewUrl = getGoogleReviewUrl();

  // 从 unused 随机拿一个
  const all = (await redis.smembers(KEY_UNUSED)) as string[] | null;
  const line = all && all.length ? pickOne(all) : "服务很好，环境干净，体验很专业！";

  // 标记使用（可选）
  if (all && all.length) {
    await redis.srem(KEY_UNUSED, line);
    await redis.sadd(KEY_USED, line);
  }

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Skina Review Helper</h1>
      <p style={{ marginTop: 10 }}>复制下面这段评价 → 打开 Google Review 粘贴提交：</p>

      <pre style={{ marginTop: 12, padding: 12, background: "#f6f6f6", borderRadius: 12, whiteSpace: "pre-wrap" }}>
        {line}
      </pre>

      {reviewUrl ? (
        <a
          href={reviewUrl}
          style={{ display: "inline-block", marginTop: 12, padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}
        >
          Open Google Review
        </a>
      ) : (
        <p style={{ marginTop: 12, color: "crimson" }}>
          GOOGLE_REVIEW_URL 没设置
        </p>
      )}
    </main>
  );
}
