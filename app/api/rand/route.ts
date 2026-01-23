import { NextResponse } from "next/server";
import {
  getRedisSafe,
  KEY_UNUSED_EN,
  KEY_USED_EN,
  KEY_UNUSED_ZH,
  KEY_USED_ZH,
} from "@/lib/redis";

function keys(lang: "zh" | "en") {
  return lang === "en"
    ? { UNUSED: KEY_UNUSED_EN, USED: KEY_USED_EN }
    : { UNUSED: KEY_UNUSED_ZH, USED: KEY_USED_ZH };
}

function pickOne<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang: "zh" | "en" = (searchParams.get("lang") || "").toLowerCase() === "en" ? "en" : "zh";

  const fallback =
    lang === "zh"
      ? "服务很专业，环境干净舒适，体验很好，推荐！"
      : "Great experience! Professional service and friendly staff. Highly recommend.";

  const r = getRedisSafe();
  if (!r.ok) {
    return NextResponse.json({ ok: true, lang, line: fallback, source: "fallback", note: r.error });
  }

  try {
    const { UNUSED, USED } = keys(lang);
    const all = (await r.redis.smembers(UNUSED)) as string[] | null;

    if (!all || all.length === 0) {
      return NextResponse.json({ ok: true, lang, line: fallback, source: "fallback" });
    }

    const line = pickOne(all);

    // move unused -> used
    await r.redis.srem(UNUSED, line);
    await r.redis.sadd(USED, line);

    return NextResponse.json({ ok: true, lang, line, source: "redis" });
  } catch (e) {
    console.error("rand error:", e);
    return NextResponse.json({ ok: true, lang, line: fallback, source: "fallback", note: "redis error" });
  }
}

