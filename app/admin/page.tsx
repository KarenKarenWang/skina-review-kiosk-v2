// app/admin/page.tsx
export const dynamic = "force-dynamic";

import { getRedisSafe, KEY_UNUSED, KEY_USED } from "@/lib/redis";
import { addOne, bulkAdd, clearUsed, resetAll } from "./actions";
import AdminClient from "./ui";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const tokenFromUrl = searchParams?.token ?? "";

  // ✅ 不让 Redis env/连接问题把页面炸掉
  const r = getRedisSafe();

  let unusedCount = 0;
  let usedCount = 0;
  let redisError: string | null = null;

  if (r.ok) {
    try {
      const redis = r.redis;
      [unusedCount, usedCount] = await Promise.all([
        redis.scard(KEY_UNUSED),
        redis.scard(KEY_USED),
      ]);
    } catch (e) {
      console.error("AdminPage scard error:", e);
      redisError = "Redis error while reading counts.";
    }
  } else {
    redisError = r.error;
  }

  return (
    <AdminClient
      tokenFromUrl={tokenFromUrl}
      unusedCount={unusedCount}
      usedCount={usedCount}
      redisError={redisError}
      actions={{ addOne, bulkAdd, clearUsed, resetAll }}
    />
  );
}
