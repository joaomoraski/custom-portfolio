"use client";

import { useState } from "react";

const monoFont = "var(--font-space-mono), 'Space Mono', monospace";
const sansFont = "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif";

const inputStyle: React.CSSProperties = {
  fontFamily: sansFont,
  fontSize: 15,
  color: "#e7ecff",
  background: "rgba(124,140,240,.06)",
  border: "1px solid rgba(124,140,240,.28)",
  padding: "11px 13px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontFamily: monoFont,
  fontSize: 10,
  letterSpacing: ".14em",
  color: "#6b7297",
};

export function ContactForm({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string || "").trim();
    const senderEmail = (fd.get("email") as string || "").trim();
    const message = (fd.get("message") as string || "").trim();

    if (!name || !senderEmail || !message) {
      setErrorMsg("All fields are required.");
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      setErrorMsg("Invalid email format.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: senderEmail, subject: `Message from ${name}`, message }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
    } catch {
      setErrorMsg("Transmission failed.");
      setStatus("error");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px 90px" }}>
      <div style={{ fontFamily: monoFont, fontSize: 11, letterSpacing: ".22em", color: "#ffb347", marginBottom: 14 }}>COMMS · UPLINK</div>
      <div style={{ fontSize: 30, fontWeight: 600, color: "#f2f4ff", marginBottom: 12 }}>Open a channel</div>
      <div style={{ fontSize: 15, lineHeight: 1.6, color: "#98a0c0", marginBottom: 26 }}>Fields are transmitted to the operator.</div>

      {status === "success" ? (
        <div style={{ border: "1px solid rgba(126,224,166,.4)", background: "rgba(126,224,166,.06)", padding: 26, textAlign: "center" }}>
          <div style={{ fontFamily: monoFont, fontSize: 13, letterSpacing: ".16em", color: "#7ee0a6", marginBottom: 8 }}>◍ SIGNAL RECEIVED</div>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: "#c6cbe0" }}>Your transmission reached the ground station. I'll reply from orbit shortly.</div>
        </div>
      ) : (
        <div>
          {status === "error" && errorMsg && (
            <div style={{ border: "1px solid rgba(255,158,109,.4)", background: "rgba(255,158,109,.07)", padding: "12px 14px", marginBottom: 18, fontSize: 13, color: "#ffb98f" }}>
              {errorMsg}
              {errorMsg === "Transmission failed." && email && (
                <div style={{ marginTop: 6, color: "#c6cbe0" }}>
                  Reach me directly: <a href={`mailto:${email}`} style={{ color: "#8b9adf" }}>{email}</a>
                </div>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={labelStyle}>
              CALLSIGN / NAME
              <input name="name" type="text" autoComplete="name" required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              RETURN FREQUENCY / EMAIL
              <input name="email" type="email" autoComplete="email" required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              MESSAGE
              <textarea name="message" rows={6} required style={{ ...inputStyle, resize: "vertical" as const }} />
            </label>
            <button type="submit" disabled={status === "loading"} style={{
              fontFamily: monoFont,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".16em",
              padding: "13px 16px",
              color: "#07070c",
              background: "#ffb347",
              border: "none",
              cursor: status === "loading" ? "wait" : "pointer",
              opacity: status === "loading" ? 0.7 : 1,
            }}>
              {status === "loading" ? "TRANSMITTING…" : "TRANSMIT"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
