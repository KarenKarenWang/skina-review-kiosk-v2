// app/admin/page.tsx
export const dynamic = "force-dynamic";

import {
  getRedisSafe,
  KEY_UNUSED_EN,
  KEY_USED_EN,
  KEY_UNUSED_ZH,
  KEY_USED_ZH,
} from "@/lib/redis";
import { addOne, bulkAdd, clearUsed, resetAll } from "./actions";
import AdminClient from "./ui";

function getKeys(lang: "en" | "zh") {
  return lang === "en"
    ? { UNUSED: KEY_UNUSED_EN, USED: KEY_USED_EN }
    : { UNUSED: KEY_UNUSED_ZH, USED: KEY_USED_ZH };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { token?: string; lang?: string };
}) {
  const tokenFromUrl = searchParams?.token ?? "";
  const lang: "en" | "zh" =
    (searchParams?.lang || "").toLowerCase() === "en" ? "en" : "zh";

  const r = getRedisSafe();

  let unusedCount = 0;
  let usedCount = 0;
  let redisError: string | null = null;

  if (r.ok) {
    try {
      const redis = r.redis;
      const { UNUSED, USED } = getKeys(lang);
      [unusedCount, usedCount] = await Promise.all([
        redis.scard(UNUSED),
        redis.scard(USED),
      ]);
    } catch (e) {
      console.error("AdminPage count error:", e);
      redisError = "Redis error while reading counts.";
    }
  } else {
    redisError = r.error;
  }

  return (
    <AdminClient
      tokenFromUrl={tokenFromUrl}
      langFromUrl={lang}
      unusedCount={unusedCount}
      usedCount={usedCount}
      redisError={redisError}
      actions={{ addOne, bulkAdd, clearUsed, resetAll }}
    />
  );
}
