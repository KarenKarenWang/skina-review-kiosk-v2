// app/r/page.tsx
export const dynamic = "force-dynamic";

import ReviewClient from "./ReviewClient";
import {
  getRedis,
  KEY_UNUSED_EN,
  KEY_USED_EN,
  KEY_UNUSED_ZH,
  KEY_USED_ZH,
} from "@/lib/redis";
import { getGoogleReviewUrl } from "@/lib/auth";

function pickOne<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function withLang(url: string, lang: "zh" | "en") {
  const hl = lang === "zh" ? "zh-CN" : "en";
  return url.includes("?") ? `${url}&hl=${hl}` : `${url}?hl=${hl}`;
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang: "zh" | "en" = sp.lang === "en" ? "en" : "zh";

  // Google Review URL
  let reviewUrl: string | null = null;
  try {
    const base = getGoogleReviewUrl();
    reviewUrl = withLang(base, lang);
  } catch {
    reviewUrl = null;
  }

  // Redis 抽文案（按语言分 key）
  const redis = getRedis();
  const keyUnused = lang === "zh" ? KEY_UNUSED_ZH : KEY_UNUSED_EN;
  const keyUsed = lang === "zh" ? KEY_USED_ZH : KEY_USED_EN;

  const all = (await redis.smembers(keyUnused)) as string[] | null;
  const fallback =
    lang === "zh"
      ? "服务很专业，环境干净舒适，体验很好，推荐！"
      : "Great experience! Professional service and friendly staff. Highly recommend.";

  const line = all && all.length ? pickOne(all) : fallback;

  // 标记已使用（避免重复）
  if (all && all.length) {
    await redis.srem(keyUnused, line);
    await redis.sadd(keyUsed, line);
  }

  return <ReviewClient line={line} reviewUrl={reviewUrl} lang={lang} />;
}
