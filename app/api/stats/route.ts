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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang: "zh" | "en" = (searchParams.get("lang") || "").toLowerCase() === "en" ? "en" : "zh";

  const r = getRedisSafe();
  if (!r.ok) {
    return NextResponse.json(
      { ok: false, error: r.error, lang, unused: 0, used: 0 },
      { status: 200 }
    );
  }

  try {
    const { UNUSED, USED } = keys(lang);
    const [unused, used] = await Promise.all([r.redis.scard(UNUSED), r.redis.scard(USED)]);
    return NextResponse.json({ ok: true, lang, unused, used });
  } catch (e) {
    console.error("stats error:", e);
    return NextResponse.json(
      { ok: false, error: "Redis error", lang, unused: 0, used: 0 },
      { status: 200 }
    );
  }
}
