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
  unusedCount,
  usedCount,
  redisError,
  actions,
}: {
  tokenFromUrl: string;
  unusedCount: number;
  usedCount: number;
  redisError: string | null;
  actions: Actions;
}) {
  const [token, setToken] = React.useState(tokenFromUrl || "");
  const [status, setStatus] = React.useState<ActionResult | null>(null);

  async function runAction(
    action: (fd: FormData) => Promise<ActionResult>,
    fd: FormData
  ) {
    fd.set("token", token);
    setStatus(null);
    const res = await action(fd);
    setStatus(res);
  }

  const bannerStyle: React.CSSProperties = {
    marginTop: 14,
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 10,
    background: "#fafafa",
    fontSize: 14,
    lineHeight: 1.4,
    whiteSpace: "pre-wrap",
  };

  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Skina Review Kiosk Admin</h1>

      <p style={{ marginTop: 12 }}>
        Unused: <b>{unusedCount}</b> | Used: <b>{usedCount}</b>
      </p>

      {/* Redis 状态提示（不会炸页面） */}
      {redisError ? (
        <div style={bannerStyle}>❌ {redisError}</div>
      ) : (
        <div style={bannerStyle}>✅ Redis connected</div>
      )}

      {/* Token 输入 */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN"
          style={{
            width: 360,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 10,
          }}
        />
        <button
          type="button"
          onClick={() => setToken("")}
          style={{ padding: "10px 14px", borderRadius: 10 }}
        >
          Clear Token
        </button>
      </div>

      {/* 操作结果提示 */}
      {status && (
        <div style={bannerStyle}>
          {status.ok ? `✅ ${status.message || "Success"}` : `❌ ${status.error}`}
        </div>
      )}

      {/* Add One */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Add One</h2>

        <form
          action={async (fd) => runAction(actions.addOne, fd)}
          style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}
        >
          <input
            name="text"
            placeholder="one review text..."
            style={{
              flex: 1,
              minWidth: 320,
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 10,
            }}
          />
          <button type="submit" style={{ padding: "10px 14px", borderRadius: 10 }}>
            Add
          </button>
        </form>
      </section>

      {/* Bulk Add */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Bulk Add</h2>

        <form action={async (fd) => runAction(actions.bulkAdd, fd)} style={{ marginTop: 8 }}>
          <textarea
            name="bulk"
            placeholder="one per line..."
            rows={8}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 10,
            }}
          />
          <button
            type="submit"
            style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10 }}
          >
            Bulk Add
          </button>
        </form>
      </section>

      {/* Maintenance */}
      <section style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <form action={async (fd) => runAction(actions.clearUsed, fd)}>
          <button type="submit" style={{ padding: "10px 14px", borderRadius: 10 }}>
            Clear Used
          </button>
        </form>

        <form action={async (fd) => runAction(actions.resetAll, fd)}>
          <button type="submit" style={{ padding: "10px 14px", borderRadius: 10 }}>
            Reset All
          </button>
        </form>
      </section>

      <p style={{ marginTop: 24, opacity: 0.8 }}>
        Tip: You can still open <code>/admin?token=YOUR_ADMIN_TOKEN</code> to auto-fill.
      </p>
    </main>
  );
}
