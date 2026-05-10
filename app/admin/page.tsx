// app/admin/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function AdminPage(props: {
  searchParams: Promise<{
    token?: string | string[];
    lang?: string | string[];
  }>;
}) {
  const sp = await props.searchParams;

  const rawToken = Array.isArray(sp?.token) ? sp.token[0] : sp?.token;
  const rawLang = Array.isArray(sp?.lang) ? sp.lang[0] : sp?.lang;

  const tokenFromUrl = rawToken ?? "";
  const lang: "en" | "zh" = rawLang === "en" ? "en" : "zh";

  const r = getRedisSafe();

  let unusedCount = 0;
  let usedCount = 0;
  let redisError: string | null = null;

  if (r.ok) {
    try {
      const redis = r.redis;
      const { UNUSED, USED } = getKeys(lang);

      const [unused, used] = await Promise.all([
        redis.scard(UNUSED),
        redis.scard(USED),
      ]);

      unusedCount = Number(unused || 0);
      usedCount = Number(used || 0);
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