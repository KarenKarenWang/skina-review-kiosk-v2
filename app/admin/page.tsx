import { getRedis, KEY_UNUSED, KEY_USED } from "@/lib/redis";
import { getGoogleReviewUrl } from "@/lib/auth";
import { addOne, bulkAdd, clearUsed, resetAll } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const redis = getRedis();
  const unusedCount = (await redis.scard(KEY_UNUSED)) ?? 0;
  const usedCount = (await redis.scard(KEY_USED)) ?? 0;

  const reviewUrl = getGoogleReviewUrl();

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Skina Review Kiosk Admin</h1>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <div>Unused pool: <b>{unusedCount}</b></div>
        <div>Used pool: <b>{usedCount}</b></div>
        {reviewUrl ? (
          <div style={{ marginTop: 8 }}>
            Google Review URL: <a href={reviewUrl}>{reviewUrl}</a>
          </div>
        ) : null}
      </div>

      <section style={{ marginTop: 18, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 650 }}>Add One</h2>
        <form action={addOne} style={{ display: "grid", gap: 8, marginTop: 8 }}>
          <input name="token" placeholder="ADMIN_TOKEN" />
          <input name="text" placeholder="One review template line" />
          <button type="submit">Add</button>
        </form>
      </section>

      <section style={{ marginTop: 18, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 650 }}>Bulk Add</h2>
        <form action={bulkAdd} style={{ display: "grid", gap: 8, marginTop: 8 }}>
          <input name="token" placeholder="ADMIN_TOKEN" />
          <textarea name="bulk" rows={8} placeholder="Paste lines, one per line" />
          <button type="submit">Bulk Add</button>
        </form>
      </section>

      <section style={{ marginTop: 18, display: "flex", gap: 12 }}>
        <form action={clearUsed}>
          <input name="token" placeholder="ADMIN_TOKEN" />
          <button type="submit">Clear Used</button>
        </form>

        <form action={resetAll}>
          <input name="token" placeholder="ADMIN_TOKEN" />
          <button type="submit">Reset All</button>
        </form>
      </section>
    </main>
  );
}
