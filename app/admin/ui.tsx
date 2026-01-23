// app/admin/ui.tsx
"use client";

import * as React from "react";
import type { ActionResult } from "./actions";

type Actions = {
  addOne: (fd: FormData) => Promise<ActionResult>;
  bulkAdd: (fd: FormData) => Promise<ActionResult>;
  clearUsed: (fd: FormData) => Promise<ActionResult>;
  resetAll: (fd: FormData) => Promise<ActionResult>;
};

export default function AdminClient({
  tokenFromUrl,
  langFromUrl,
  unusedCount,
  usedCount,
  redisError,
  actions,
}: {
  tokenFromUrl: string;
  langFromUrl: "en" | "zh";
  unusedCount: number;
  usedCount: number;
  redisError: string | null;
  actions: Actions;
}) {
  const [token, setToken] = React.useState(tokenFromUrl || "");
  const [lang, setLang] = React.useState<"en" | "zh">(langFromUrl);
  const [status, setStatus] = React.useState<ActionResult | null>(null);

  async function runAction(
    action: (fd: FormData) => Promise<ActionResult>,
    fd: FormData
  ) {
    fd.set("token", token);
    fd.set("lang", lang);
    setStatus(null);
    const res = await action(fd);
    setStatus(res);
  }

  const box: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 14,
    background: "#fff",
  };

  const input: React.CSSProperties = {
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 10,
  };

  const btn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fafafa",
    cursor: "pointer",
  };

  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Skina Review Kiosk Admin</h1>

      {/* Language toggle */}
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ opacity: 0.8 }}>Language:</div>
        <button
          type="button"
          style={{ ...btn, background: lang === "zh" ? "#eaeaea" : "#fafafa" }}
          onClick={() => setLang("zh")}
        >
          中文 (ZH)
        </button>
        <button
          type="button"
          style={{ ...btn, background: lang === "en" ? "#eaeaea" : "#fafafa" }}
          onClick={() => setLang("en")}
        >
          English (EN)
        </button>
        <div style={{ marginLeft: 8, opacity: 0.8 }}>
          当前库: {lang === "zh" ? "中文池" : "英文池"}
        </div>
      </div>

      {/* Counts + redis status */}
      <div style={{ marginTop: 14, ...box }}>
        <div>
          Unused pool: <b>{unusedCount}</b>
        </div>
        <div>
          Used pool: <b>{usedCount}</b>
        </div>
        <div style={{ marginTop: 8, opacity: 0.85 }}>
          {redisError ? `❌ ${redisError}` : "✅ Redis connected"}
        </div>
      </div>

      {/* Token */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN"
          style={{ ...input, width: 360 }}
        />
        <button type="button" style={btn} onClick={() => setToken("")}>
          Clear Token
        </button>
      </div>

      {/* status */}
      {status && (
        <div style={{ marginTop: 12, ...box, background: "#fafafa" }}>
          {status.ok ? `✅ ${status.message || "Success"}` : `❌ ${status.error}`}
        </div>
      )}

      {/* Add One */}
      <section style={{ marginTop: 24, ...box }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Add One</h2>
        <form
          action={async (fd) => runAction(actions.addOne, fd)}
          style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}
        >
          <input
            name="text"
            placeholder={lang === "zh" ? "输入一条中文评价模板" : "Enter one English review template"}
            style={{ ...input, flex: 1, minWidth: 320 }}
          />
          <button type="submit" style={btn}>
            Add
          </button>
        </form>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
          Tip: {lang === "en" ? "Do not mix Chinese characters in English pool." : "中文池建议不要混入英文（避免误导）"}
        </div>
      </section>

      {/* Bulk Add */}
      <section style={{ marginTop: 16, ...box }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Bulk Add</h2>
        <form action={async (fd) => runAction(actions.bulkAdd, fd)} style={{ marginTop: 10 }}>
          <textarea
            name="bulk"
            rows={8}
            placeholder={lang === "zh" ? "每行一条中文文案（回车分行）" : "One per line (press Enter)"}
            style={{ ...input, width: "100%", borderRadius: 12 }}
          />
          <button type="submit" style={{ ...btn, marginTop: 10 }}>
            Bulk Add
          </button>
        </form>
      </section>

      {/* Maintenance */}
      <section style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <form action={async (fd) => runAction(actions.clearUsed, fd)}>
          <button type="submit" style={btn}>
            Clear Used
          </button>
        </form>

        <form action={async (fd) => runAction(actions.resetAll, fd)}>
          <button type="submit" style={btn}>
            Reset All
          </button>
        </form>
      </section>

      <p style={{ marginTop: 18, opacity: 0.8 }}>
        Tip: open <code>/admin?lang=zh&amp;token=YOUR_ADMIN_TOKEN</code> or{" "}
        <code>/admin?lang=en&amp;token=YOUR_ADMIN_TOKEN</code>
      </p>
    </main>
  );
}
