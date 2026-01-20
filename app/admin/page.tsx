import {
  getRedis,
  KEY_UNUSED_EN,
  KEY_USED_EN,
  KEY_UNUSED_ZH,
  KEY_USED_ZH,
} from "@/lib/redis";
import { getGoogleReviewUrl } from "@/lib/auth";
import { addOne, bulkAdd, clearUsed, resetAll } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang: "zh" | "en" = sp.lang === "en" ? "en" : "zh";

  const KEY_UNUSED = lang === "zh" ? KEY_UNUSED_ZH : KEY_UNUSED_EN;
  const KEY_USED = lang === "zh" ? KEY_USED_ZH : KEY_USED_EN;

  const redis = getRedis();
  const unusedCount = (await redis.scard(KEY_UNUSED)) ?? 0;
  const usedCount = (await redis.scard(KEY_USED)) ?? 0;

  const reviewUrl = getGoogleReviewUrl();

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Skina Review Kiosk Admin</h1>

      {/* Language switch */}
      <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontWeight: 650 }}>Language:</div>

        <a
          href="/admin?lang=zh"
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            textDecoration: "none",
            fontWeight: 700,
            background: lang === "zh" ? "#f5f5f5" : "transparent",
          }}
        >
          中文 (ZH)
        </a>

        <a
          href="/admin?lang=en"
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            textDecoration: "none",
            fontWeight: 700,
            background: lang === "en" ? "#f5f5f5" : "transparent",
          }}
        >
          English (EN)
        </a>

        <span style={{ color: "#777" }}>
          当前库：<b>{lang === "zh" ? "中文池" : "英文池"}</b>
        </span>
      </div>

      {/* Tip */}
      <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
        提示：<b>英文文案不要包含中文字符</b>；<b>中文文案要含中文字符</b>（避免导入混乱）
      </div>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <div>
          Unused pool: <b>{unusedCount}</b>
        </div>
        <div>
          Used pool: <b>{usedCount}</b>
        </div>
        {reviewUrl ? (
          <div style={{ marginTop: 8 }}>
            Google Review URL: <a href={reviewUrl}>{reviewUrl}</a>
          </div>
        ) : null}
      </div>

      <section style={{ marginTop: 18, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 650 }}>Add One</h2>

        <form action={addOne} style={{ display: "grid", gap: 8, marginTop: 8 }}>
          <input type="hidden" name="lang" value={lang} />
          <input name="token" placeholder="ADMIN_TOKEN" />
          <input name="text" placeholder={lang === "zh" ? "输入一条中文评价模板" : "Enter one English review template"} />
          <button type="submit">Add</button>
        </form>
      </section>

      <section style={{ marginTop: 18, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 650 }}>Bulk Add</h2>

        <form action={bulkAdd} style={{ display: "grid", gap: 8, marginTop: 8 }}>
          <input type="hidden" name="lang" value={lang} />
          <input name="token" placeholder="ADMIN_TOKEN" />
          <textarea
            name="bulk"
            rows={8}
            placeholder={lang === "zh" ? "每行一条中文文案（回车分行）" : "One line per English review (newline separated)"}
          />
          <button type="submit">Bulk Add</button>
        </form>
      </section>

      <section style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <form action={clearUsed} style={{ display: "flex", gap: 8 }}>
          <input type="hidden" name="lang" value={lang} />
          <input name="token" placeholder="ADMIN_TOKEN" />
          <button type="submit">Clear Used</button>
        </form>

        <form action={resetAll} style={{ display: "flex", gap: 8 }}>
          <input type="hidden" name="lang" value={lang} />
          <input name="token" placeholder="ADMIN_TOKEN" />
          <button type="submit">Reset All</button>
        </form>
      </section>
    </main>
  );
}
