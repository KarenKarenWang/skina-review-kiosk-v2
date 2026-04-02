export const dynamic = "force-dynamic";

import ReviewClient from "./ReviewClient";
import {
  getRedisSafe,
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

export default async function ReviewPage(props: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const sp = await props.searchParams;
  const rawLang = Array.isArray(sp?.lang) ? sp.lang[0] : sp?.lang;

  // 默认英文
  const lang: "zh" | "en" = rawLang === "zh" ? "zh" : "en";

  let reviewUrl: string | null = null;
  try {
    const base = getGoogleReviewUrl();
    reviewUrl = withLang(base, lang);
  } catch {
    reviewUrl = null;
  }

  const fallback =
    lang === "zh"
      ? "环境很好，服务很专业，整体体验很舒服。"
      : "Great environment, very professional service, and a very comfortable overall experience.";

  const keyUnused = lang === "zh" ? KEY_UNUSED_ZH : KEY_UNUSED_EN;
  const keyUsed = lang === "zh" ? KEY_USED_ZH : KEY_USED_EN;

  const r = getRedisSafe();

  if (!r.ok) {
    return <ReviewClient line={fallback} reviewUrl={reviewUrl} lang={lang} />;
  }

  const redis = r.redis;

  try {
    const all = (await redis.smembers(keyUnused)) as string[] | null;
    const line = all && all.length > 0 ? pickOne(all) : fallback;

    if (all && all.length > 0) {
      await redis.srem(keyUnused, line);
      await redis.sadd(keyUsed, line);
    }

    return <ReviewClient line={line} reviewUrl={reviewUrl} lang={lang} />;
  } catch (e) {
    console.error("ReviewPage redis error:", e);
    return <ReviewClient line={fallback} reviewUrl={reviewUrl} lang={lang} />;
  }
}