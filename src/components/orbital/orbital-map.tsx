"use client";

import * as React from "react";
import type { OrbitalBody, Transmission, MapSettings } from "./types";

interface OrbitalMapProps {
  bodies: OrbitalBody[];
  settings: MapSettings;
  transmissions: Transmission[];
  initialBodySlug?: string | null;
}

interface OrbitalMapState {
  hoverId: string | null;
  focusId: string | null;
  selectedId: string | null;
  showSpec: boolean;
  showWhy: boolean;
  reduced: boolean;
  intro: "pullback" | "push" | "resolve" | "done";
  catState: "super" | "alive" | "dead";
  observing: boolean;
  hoverRing: number | null;
  showComms: boolean;
  commsState: "idle" | "submitting" | "success" | "error" | "invalid";
  commsError: string | null;
}

const MONO = "var(--font-space-mono), 'Space Mono', monospace";
const SANS = "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif";
const CX = 500;
const CY = 500;
const RING_R: Record<number, number> = { 1: 150, 2: 255, 3: 360 };
const BELT_R = 435;

const KEYFRAMES = `
@keyframes omPulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.9;transform:scale(1.28)}}
@keyframes omCore{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes omScan{0%{transform:translateY(-140%)}100%{transform:translateY(140%)}}
@keyframes omSuperA{0%,100%{opacity:.72}50%{opacity:.18}}
@keyframes omSuperB{0%,100%{opacity:.18}50%{opacity:.72}}
@keyframes omFlick{0%{opacity:1}100%{opacity:.35}}
[data-orbital-map] a{color:#8b9adf;text-decoration:none}
[data-orbital-map] a:hover{color:#b7c2ff}
[data-orbital-map] ::selection{background:#3b3160;color:#fff}
`;

export default class OrbitalMap extends React.Component<OrbitalMapProps, OrbitalMapState> {
  private vbBeforeSelect: { x: number; y: number; w: number; h: number } | null = null;
  private _clk: Record<number, { base: number; since: number; running: boolean }> = {};
  private cometTheta = 0.6;
  private vb = { x: 0, y: 0, w: 1000, h: 1000 };
  private vbTarget = { x: 0, y: 0, w: 1000, h: 1000 };
  private drag: { px: number; py: number; vx: number; vy: number; rect: DOMRect } | null = null;
  private _svgRef: SVGSVGElement | null = null;
  private _last = 0;
  private _timer: ReturnType<typeof setInterval> | null = null;
  private _it1: ReturnType<typeof setTimeout> | null = null;
  private _it2: ReturnType<typeof setTimeout> | null = null;
  private _it3: ReturnType<typeof setTimeout> | null = null;
  private _obsT: ReturnType<typeof setTimeout> | null = null;
  private _loggedTick = false;
  private _mqHandler: ((e: MediaQueryListEvent) => void) | null = null;
  private _keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private _upHandler: (() => void) | null = null;
  private _moveHandler: ((e: PointerEvent) => void) | null = null;

  constructor(props: OrbitalMapProps) {
    super(props);
    const hasInitial = !!props.initialBodySlug && !!props.bodies.find(b => b.slug === props.initialBodySlug);
    this.state = {
      hoverId: null, focusId: null, selectedId: null,
      showSpec: false, showWhy: false, reduced: false,
      intro: hasInitial ? "done" : "pullback",
      catState: "super", observing: false,
      hoverRing: null, showComms: false,
      commsState: "idle", commsError: null,
    };
  }

  componentDidMount() {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) this.setState({ reduced: true, intro: "done" });
    this._mqHandler = (e: MediaQueryListEvent) => this.setState({ reduced: e.matches });
    mq.addEventListener("change", this._mqHandler);

    const skipIntro = mq.matches || this.state.intro === "done";
    if (!skipIntro) {
      this.vb = { x: -95, y: -95, w: 1190, h: 1190 };
      this.vbTarget = { x: -95, y: -95, w: 1190, h: 1190 };
      this._it1 = setTimeout(() => this.setState({ intro: "push" }), 350);
      this._it2 = setTimeout(() => { this.setState({ intro: "resolve" }); this.reset(); }, 1600);
      this._it3 = setTimeout(() => this.setState({ intro: "done" }), 2550);
    }

    if (this.props.initialBodySlug) {
      const dlBody = this.props.bodies.find(b => b.slug === this.props.initialBodySlug);
      if (dlBody) {
        this.vbBeforeSelect = { x: 0, y: 0, w: 1000, h: 1000 };
        this.setState({ selectedId: dlBody.id });
        this.zoomToBody(dlBody);
      }
    }

    this._last = performance.now();
    this._timer = setInterval(() => {
      try {
        const now = performance.now();
        const rawDt = (now - this._last) / 1000;
        this._last = now;
        const driftDt = Math.min(0.1, rawDt);
        if (!this.state.reduced && (!this._clk[100] || this._clk[100].running)) {
          const { r } = this.cometPolar(this.cometTheta);
          this.cometTheta += driftDt * 42000 / (r * r);
          if (this.cometTheta > Math.PI * 2) this.cometTheta -= Math.PI * 2;
        }
        const v = this.vb, tg = this.vbTarget;
        const k = 1 - Math.exp(-Math.min(rawDt, 1) / 0.10);
        v.x += (tg.x - v.x) * k; v.y += (tg.y - v.y) * k;
        v.w += (tg.w - v.w) * k; v.h += (tg.h - v.h) * k;
        if (Math.abs(tg.w - v.w) < 0.4) { v.x = tg.x; v.y = tg.y; v.w = tg.w; v.h = tg.h; }
        this.forceUpdate();
      } catch (err) {
        if (!this._loggedTick) { this._loggedTick = true; console.error("tick error", err); }
      }
    }, 1000 / 60);

    this._keyHandler = (e: KeyboardEvent) => this.onKey(e);
    window.addEventListener("keydown", this._keyHandler);
    this._upHandler = () => { this.drag = null; };
    this._moveHandler = (e: PointerEvent) => this.onDragMove(e);
    window.addEventListener("pointerup", this._upHandler);
    window.addEventListener("pointermove", this._moveHandler);
  }

  componentWillUnmount() {
    if (this._timer) clearInterval(this._timer);
    if (this._it1) clearTimeout(this._it1);
    if (this._it2) clearTimeout(this._it2);
    if (this._it3) clearTimeout(this._it3);
    if (this._obsT) clearTimeout(this._obsT);
    if (this._keyHandler) window.removeEventListener("keydown", this._keyHandler);
    if (this._upHandler) window.removeEventListener("pointerup", this._upHandler);
    if (this._moveHandler) window.removeEventListener("pointermove", this._moveHandler);
    if (this._mqHandler) window.matchMedia("(prefers-reduced-motion: reduce)").removeEventListener("change", this._mqHandler);
    if (this._svgRef) this._svgRef.removeEventListener("wheel", this._wheelHandler);
  }

  ringGroups() {
    const g: Record<number, OrbitalBody[]> = {};
    for (const b of this.props.bodies) { (g[b.ring] = g[b.ring] || []).push(b); }
    for (const k in g) { g[k].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.id).localeCompare(String(b.id))); }
    return g;
  }

  hash(id: string) { let h = 0; for (let i = 0; i < id.length; i++) { h = (h * 31 + id.charCodeAt(i)) >>> 0; } return h; }

  posFor(b: OrbitalBody, groups: Record<number, OrbitalBody[]>) {
    const grp = groups[b.ring] || [b];
    const idx = grp.indexOf(b);
    const n = grp.length;
    if (b.ring === 0) return { x: CX, y: CY };
    if (b.ring === 100) return this.cometPoint(this.cometTheta);
    if (b.ring === 99) {
      const hs = this.hash(b.id);
      const baseR = BELT_R + ((hs % 40) - 20);
      const ang = (360 / n) * idx + (hs % 37) + 7 * this.clockT(99);
      const a = ang * Math.PI / 180;
      return { x: CX + baseR * Math.cos(a), y: CY + baseR * Math.sin(a) };
    }
    const baseR = RING_R[b.ring];
    const speed = b.ring === 1 ? 9 : b.ring === 2 ? 5 : 3.2;
    const ba = b as OrbitalBody & { angle?: number };
    let deg = ba.angle == null ? (360 / n) * idx - 90 : ba.angle;
    for (let j = 0; j < idx; j++) { const ga = grp[j] as OrbitalBody & { angle?: number }; if (ga.angle != null && ga.angle === ba.angle) deg += 6; }
    deg += speed * this.clockT(b.ring);
    const a = deg * Math.PI / 180;
    return { x: CX + baseR * Math.cos(a), y: CY + baseR * Math.sin(a) };
  }

  cometPolar(theta: number) {
    const a = 560, e = 0.74, p = a * (1 - e * e);
    const r = p / (1 + e * Math.cos(theta));
    return { r, a, e };
  }

  cometPoint(theta: number) {
    const { r } = this.cometPolar(theta);
    const phi = -0.6;
    return { x: CX + r * Math.cos(theta + phi), y: CY + r * Math.sin(theta + phi) };
  }

  cometPathD() {
    let d = ""; const phi = -0.6;
    for (let i = 0; i <= 120; i++) {
      const th = (i / 120) * Math.PI * 2; const { r } = this.cometPolar(th);
      const x = CX + r * Math.cos(th + phi), y = CY + r * Math.sin(th + phi);
      d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    return d + "Z";
  }

  ensureClk(r: number) { if (!this._clk[r]) this._clk[r] = { base: 0, since: performance.now(), running: true }; return this._clk[r]; }
  clockT(r: number) { const c = this.ensureClk(r); return c.running ? c.base + (performance.now() - c.since) / 1000 : c.base; }
  setRunning(r: number, on: boolean) { const c = this.ensureClk(r); if (on === c.running) return; if (on) { c.since = performance.now(); } else { c.base += (performance.now() - c.since) / 1000; } c.running = on; }
  kick() { if (typeof document !== "undefined" && document.hidden) { this.vb = { ...this.vbTarget }; this.forceUpdate(); } }

  clampVB(v: { x: number; y: number; w: number; h: number }) {
    const MIN = 220, MAX = 1700, LO = -260, HI = 1260;
    v.w = Math.max(MIN, Math.min(MAX, v.w)); v.h = v.w;
    v.x = Math.max(LO, Math.min(HI - v.w, v.x));
    v.y = Math.max(LO, Math.min(HI - v.h, v.y));
    return v;
  }

  zoomBy(f: number) {
    const v = this.vbTarget, cx = v.x + v.w / 2, cy = v.y + v.h / 2, w = v.w * f;
    this.vbTarget = this.clampVB({ x: cx - w / 2, y: cy - w / 2, w, h: w }); this.kick();
  }

  zoomIn = () => this.zoomBy(0.72);
  zoomOut = () => this.zoomBy(1 / 0.72);
  reset = () => { this.vbTarget = { x: 0, y: 0, w: 1000, h: 1000 }; this.kick(); };

  zoomToRing(r: number) { const R = RING_R[r]; const w = Math.max(300, R * 2.5); this.vbTarget = this.clampVB({ x: CX - w / 2, y: CY - w / 2, w, h: w }); this.kick(); }

  zoomToBody(b: OrbitalBody) {
    const groups = this.ringGroups(); const p = this.posFor(b, groups); const w = Math.max(320, RING_R[3] * 1.4);
    this.vbTarget = this.clampVB({ x: p.x - w / 2, y: p.y - w / 2, w, h: w }); this.kick();
  }

  onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const target = e.target as Element;
    if (target.closest && target.closest("[data-body]")) return;
    const svg = this._svgRef; if (!svg) return;
    this.drag = { px: e.clientX, py: e.clientY, vx: this.vbTarget.x, vy: this.vbTarget.y, rect: svg.getBoundingClientRect() };
  };

  onDragMove(e: PointerEvent) {
    if (!this.drag) return;
    const { rect } = this.drag; const scale = this.vbTarget.w / rect.width;
    const nx = this.drag.vx - (e.clientX - this.drag.px) * scale;
    const ny = this.drag.vy - (e.clientY - this.drag.py) * scale;
    this.vbTarget = this.clampVB({ ...this.vbTarget, x: nx, y: ny }); this.kick();
  }

  private _wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    const svg = this._svgRef; if (!svg) return;
    const rect = svg.getBoundingClientRect(); const v = this.vbTarget;
    const px = (e.clientX - rect.left) / rect.width, py = (e.clientY - rect.top) / rect.height;
    const ux = v.x + px * v.w, uy = v.y + py * v.h;
    const f = e.deltaY > 0 ? 1.12 : 0.89; let w = v.w * f; w = Math.max(220, Math.min(1700, w));
    this.vbTarget = this.clampVB({ x: ux - px * w, y: uy - py * w, w, h: w }); this.kick();
  };

  private _svgRefCallback = (el: SVGSVGElement | null) => {
    if (this._svgRef === el) return;
    if (this._svgRef) this._svgRef.removeEventListener("wheel", this._wheelHandler);
    this._svgRef = el;
    if (el) el.addEventListener("wheel", this._wheelHandler, { passive: false });
  };

  tabOrder() { return [...this.props.bodies].sort((a, b) => this.rank(a) - this.rank(b)); }
  rank(b: OrbitalBody) { return b.ring === 0 ? 0 : b.ring === 99 ? 4 : b.ring === 100 ? 5 : b.ring; }

  onKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      if (this.state.showSpec) this.setState({ showSpec: false });
      else if (this.state.showComms) this.setState({ showComms: false });
      else if (this.state.showWhy) this.setState({ showWhy: false });
      else if (this.state.selectedId) this.setState({ selectedId: null });
    }
  }

  onBodyKey = (b: OrbitalBody, e: React.KeyboardEvent<SVGGElement>) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.select(b); } };

  select(b: OrbitalBody) { if (!this.state.selectedId) { this.vbBeforeSelect = { ...this.vbTarget }; } this.setState({ selectedId: b.id, catState: "super", observing: false }); this.zoomToBody(b); }
  closeSelected = () => { if (this.vbBeforeSelect) { this.vbTarget = { ...this.vbBeforeSelect }; this.vbBeforeSelect = null; } else { this.reset(); } this.kick(); this.setState({ selectedId: null }); };
  toggleSpec = () => this.setState(s => ({ showSpec: !s.showSpec }));
  toggleWhy = () => this.setState(s => ({ showWhy: !s.showWhy }));
  toggleComms = () => this.setState(s => ({ showComms: !s.showComms, commsState: "idle", commsError: null }));

  submitComms = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();
    if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      this.setState({ commsState: "invalid", commsError: "Fill every field with a valid email." }); return;
    }
    this.setState({ commsState: "submitting", commsError: null });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject: "Contact from orbital map", message }),
      });
      if (res.ok) {
        this.setState({ commsState: "success" });
      } else {
        this.setState({ commsState: "error", commsError: "Transmission failed to reach the ground station." });
      }
    } catch {
      this.setState({ commsState: "error", commsError: "Transmission failed to reach the ground station." });
    }
  };

  skip = () => { if (this._it1) clearTimeout(this._it1); if (this._it2) clearTimeout(this._it2); if (this._it3) clearTimeout(this._it3); this.reset(); this.setState({ intro: "done" }); };
  observe = () => { if (this.state.observing) return; this.setState({ observing: true }); this._obsT = setTimeout(() => this.setState({ observing: false, catState: Math.random() < 0.5 ? "alive" : "dead" }), 1150); };
  reSuper = () => { if (this._obsT) clearTimeout(this._obsT); this.setState({ observing: false, catState: "super" }); };

  typeLabel(t: string) { return ({ star: "STAR", station: "STATION", satellite: "SATELLITE", probe: "PROBE", planet: "PLANET", comet: "COMET", asteroid: "ASTEROID" } as Record<string, string>)[t] || t.toUpperCase(); }
  ringTint(b: OrbitalBody) {
    if (b.ring === 0) return "#ffb347"; if (b.ring === 1) return "#ff9e6d"; if (b.ring === 2) return "#b48cf0";
    if (b.ring === 3) return "#6ea8ff"; if (b.ring === 99) return "#7c8bb5"; if (b.ring === 100) return "#22d3ee";
    return "#8891b3";
  }
  bodyRadius(b: OrbitalBody) { return 4 + b.size * 3; }

  glyph(b: OrbitalBody, R: number, color: string, active: boolean, indev: boolean, archived: boolean) {
    const h = React.createElement; const els: React.ReactNode[] = [];
    if (active && !this.state.reduced) {
      els.push(h("circle", { key: "halo", cx: 0, cy: 0, r: R * 2, fill: color, opacity: 0.3, style: { transformBox: "fill-box" as const, transformOrigin: "center", animation: "omPulse 2.4s ease-in-out infinite" } }));
    }
    const fill = archived ? "#4a5170" : color;
    switch (b.bodyType) {
      case "star":
        els.push(h("circle", { key: "corona", cx: 0, cy: 0, r: R * 2.6, fill: "url(#omStarGrad)", opacity: this.state.reduced ? 0.5 : undefined, style: this.state.reduced ? undefined : { animation: "omCore 3s ease-in-out infinite" } }));
        els.push(h("circle", { key: "core", cx: 0, cy: 0, r: R, fill: "#ffd9a0" }));
        els.push(h("circle", { key: "rim", cx: 0, cy: 0, r: R, fill: "none", stroke: "#ffb347", strokeWidth: 1 }));
        break;
      case "station":
        els.push(h("rect", { key: "g", x: -R, y: -R, width: R * 2, height: R * 2, fill: indev ? "rgba(20,22,34,.7)" : fill, ...(indev ? { stroke: color, strokeWidth: 1.4, strokeDasharray: "4 4" } : {}) }));
        els.push(h("line", { key: "p1", x1: -R * 1.7, y1: 0, x2: R * 1.7, y2: 0, stroke: color, strokeWidth: 0.6, opacity: 0.6 }));
        break;
      case "satellite":
        els.push(h("circle", { key: "g", cx: 0, cy: 0, r: R, fill: indev ? "rgba(20,22,34,.7)" : fill, ...(indev ? { stroke: color, strokeWidth: 1.4, strokeDasharray: "4 4" } : {}) }));
        els.push(h("rect", { key: "pl1", x: -R * 2, y: -R * 0.35, width: R * 0.9, height: R * 0.7, fill: color, opacity: 0.7 }));
        els.push(h("rect", { key: "pl2", x: R * 1.1, y: -R * 0.35, width: R * 0.9, height: R * 0.7, fill: color, opacity: 0.7 }));
        break;
      case "probe":
        els.push(h("polygon", { key: "g", points: `0,${-R * 1.3} ${R * 1.15},${R} ${-R * 1.15},${R}`, fill: indev ? "rgba(20,22,34,.7)" : fill, ...(indev ? { stroke: color, strokeWidth: 1.4, strokeDasharray: "4 4" } : {}) }));
        break;
      case "planet":
        els.push(h("ellipse", { key: "ring", cx: 0, cy: 0, rx: R * 1.9, ry: R * 0.6, fill: "none", stroke: color, strokeWidth: 0.8, opacity: 0.7 }));
        els.push(h("circle", { key: "g", cx: 0, cy: 0, r: R, fill: indev ? "rgba(20,22,34,.7)" : fill, ...(indev ? { stroke: color, strokeWidth: 1.4, strokeDasharray: "4 4" } : {}) }));
        break;
      case "comet":
        els.push(h("circle", { key: "g", cx: 0, cy: 0, r: R, fill: archived ? "#4a5170" : color }));
        els.push(h("circle", { key: "glow", cx: 0, cy: 0, r: R * 1.8, fill: "none", stroke: color, strokeWidth: 0.8, opacity: 0.5 }));
        break;
      default:
        els.push(h("circle", { key: "g", cx: 0, cy: 0, r: R, fill: archived ? "#4a5170" : color }));
    }
    return els;
  }

  buildSvg() {
    const h = React.createElement;
    const v = this.vb;
    const groups = this.ringGroups();
    const order = this.tabOrder();
    const children: React.ReactNode[] = [];

    children.push(h("defs", { key: "defs" },
      h("radialGradient", { id: "omStarGrad" },
        h("stop", { offset: "0%", stopColor: "#ffb347", stopOpacity: 0.9 }),
        h("stop", { offset: "55%", stopColor: "#ff8a3d", stopOpacity: 0.28 }),
        h("stop", { offset: "100%", stopColor: "#ff8a3d", stopOpacity: 0 }))));

    const grid: React.ReactNode[] = [];
    for (let i = 0; i <= 10; i++) { const p = i * 100;
      grid.push(h("line", { key: "gx" + i, x1: p, y1: 0, x2: p, y2: 1000, stroke: "#131624", strokeWidth: 0.5 }));
      grid.push(h("line", { key: "gy" + i, x1: 0, y1: p, x2: 1000, y2: p, stroke: "#131624", strokeWidth: 0.5 }));
    }
    children.push(h("g", { key: "grid", opacity: 0.6 }, grid));

    ([1, 2, 3] as number[]).forEach(r => {
      const grp = groups[r]; if (!grp || grp.length === 0) return;
      const R = RING_R[r]; const tint = ({ 1: "#ff9e6d", 2: "#b48cf0", 3: "#6ea8ff" } as Record<number, string>)[r];
      const paused = this.state.hoverRing === r;
      children.push(h("circle", { key: "hit" + r, cx: CX, cy: CY, r: R, fill: "none", stroke: "transparent", strokeWidth: 26, style: { cursor: "pointer", pointerEvents: "stroke" as const },
        onMouseEnter: () => this.setState({ hoverRing: r }), onMouseLeave: () => this.setState(s => s.hoverRing === r ? { hoverRing: null } : null) }));
      children.push(h("circle", { key: "ring" + r, cx: CX, cy: CY, r: R, fill: "none", stroke: tint, strokeWidth: paused ? 1.4 : 0.5, strokeDasharray: paused ? "none" : "2 6", opacity: paused ? 0.9 : 0.5, style: { pointerEvents: "none" as const, transition: "opacity .2s" } }));
      const ticks: React.ReactNode[] = [];
      for (let d = 0; d < 360; d += 30) { const a = d * Math.PI / 180; const x1 = CX + (R - 4) * Math.cos(a), y1 = CY + (R - 4) * Math.sin(a), x2 = CX + (R + 4) * Math.cos(a), y2 = CY + (R + 4) * Math.sin(a);
        ticks.push(h("line", { key: "t" + r + d, x1, y1, x2, y2, stroke: tint, strokeWidth: 0.5, opacity: paused ? 0.6 : 0.35 })); }
      children.push(h("g", { key: "ticks" + r, style: { pointerEvents: "none" as const } }, ticks));
      const lx = CX, ly = CY - R - 8;
      children.push(h("text", { key: "rl" + r, x: lx, y: ly, fill: tint, fontSize: 11, textAnchor: "middle", letterSpacing: "0.14em", opacity: paused ? 1 : 0.85, style: { cursor: "pointer", fontFamily: MONO }, onClick: () => this.zoomToRing(r) },
        paused ? `RING ${r} · HELD` : `RING ${r} · ${({ 1: "CURRENT", 2: "PAST", 3: "PROJECTS" } as Record<number, string>)[r]}`));
    });

    if (groups[99] && groups[99].length) {
      const bp = this.state.hoverRing === 99;
      children.push(h("circle", { key: "belthit", cx: CX, cy: CY, r: BELT_R, fill: "none", stroke: "transparent", strokeWidth: 30, style: { cursor: "pointer", pointerEvents: "stroke" as const },
        onMouseEnter: () => this.setState({ hoverRing: 99 }), onMouseLeave: () => this.setState(s => s.hoverRing === 99 ? { hoverRing: null } : null) }));
      children.push(h("circle", { key: "beltband", cx: CX, cy: CY, r: BELT_R, fill: "none", stroke: "#7c8bb5", strokeWidth: 22, opacity: bp ? 0.09 : 0.05, style: { pointerEvents: "none" as const } }));
      children.push(h("circle", { key: "beltline", cx: CX, cy: CY, r: BELT_R, fill: "none", stroke: "#7c8bb5", strokeWidth: 0.5, strokeDasharray: "1 5", opacity: bp ? 0.7 : 0.4, style: { pointerEvents: "none" as const } }));
    }

    if (groups[100] && groups[100].length) {
      const cp = this.state.hoverRing === 100;
      children.push(h("path", { key: "chit", d: this.cometPathD(), fill: "none", stroke: "transparent", strokeWidth: 24, style: { cursor: "pointer", pointerEvents: "stroke" as const },
        onMouseEnter: () => this.setState({ hoverRing: 100 }), onMouseLeave: () => this.setState(s => s.hoverRing === 100 ? { hoverRing: null } : null) }));
      children.push(h("path", { key: "cpath", d: this.cometPathD(), fill: "none", stroke: "#22d3ee", strokeWidth: cp ? 1.4 : 0.8, strokeDasharray: "6 5", opacity: cp ? 0.75 : 0.4, style: { pointerEvents: "none" as const } }));
    }

    const bodyEls: React.ReactNode[] = [];
    order.forEach(b => {
      const p = this.posFor(b, groups);
      const R = this.bodyRadius(b);
      const color = this.ringTint(b);
      const active = b.status === "ACTIVE", indev = b.status === "IN_DEV", archived = b.status === "ARCHIVED";
      const isHover = this.state.hoverId === b.id, isFocus = this.state.focusId === b.id, isSel = this.state.selectedId === b.id;
      const lift = (isHover || isFocus || isSel) ? 1.18 : 1;
      if (b.bodyType === "comet") {
        const { r } = this.cometPolar(this.cometTheta); const phi = -0.6;
        const dir = this.cometTheta + phi; const tail = Math.max(20, 16000 / r);
        const tx = p.x + Math.cos(dir) * tail, ty = p.y + Math.sin(dir) * tail;
        bodyEls.push(h("line", { key: "ctail", x1: p.x, y1: p.y, x2: tx, y2: ty, stroke: "#22d3ee", strokeWidth: 1.2, opacity: 0.35, strokeLinecap: "round" }));
      }
      const g = h("g", {
        key: b.id, "data-body": b.id, role: "button", tabIndex: 0,
        "aria-label": `${b.name}, ${this.typeLabel(b.bodyType)}, ${b.status}`,
        transform: `translate(${p.x},${p.y}) scale(${lift})`,
        style: { cursor: "pointer", transition: "transform .18s ease", outline: "none", opacity: archived ? 0.72 : 1 },
        onMouseEnter: () => this.setState({ hoverId: b.id }),
        onMouseLeave: () => this.setState(s => s.hoverId === b.id ? { hoverId: null } : null),
        onFocus: () => this.setState({ focusId: b.id }),
        onBlur: () => this.setState(s => s.focusId === b.id ? { focusId: null } : null),
        onClick: () => this.select(b),
        onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => this.onBodyKey(b, e),
      },
        isFocus ? h("circle", { key: "fr", cx: 0, cy: 0, r: R * 2.4, fill: "none", stroke: "#ffffff", strokeWidth: 1.2, strokeDasharray: "3 3" }) : null,
        h("circle", { key: "hit", cx: 0, cy: 0, r: Math.max(22, R * 2.4), fill: "transparent" }),
        ...this.glyph(b, R, color, active, indev, archived),
        isSel ? h("circle", { key: "sel", cx: 0, cy: 0, r: R * 2.2, fill: "none", stroke: color, strokeWidth: 1 }) : null
      );
      bodyEls.push(g);
    });

    const labelEls: React.ReactNode[] = [];
    order.forEach(b => {
      if (b.ring === 0) return;
      const grp = groups[b.ring] || []; const crowded = grp.length > 8;
      const isHover = this.state.hoverId === b.id, isFocus = this.state.focusId === b.id, isSel = this.state.selectedId === b.id;
      const show = crowded ? (isHover || isFocus || isSel) : true;
      if (!show) return;
      const p = this.posFor(b, groups); const R = this.bodyRadius(b);
      let name = b.name; if (name.length > 26) name = name.slice(0, 24) + "…";
      const bright = isHover || isFocus || isSel;
      labelEls.push(h("text", { key: "lb" + b.id, x: p.x + R + 8, y: p.y + 3, fontSize: 11, fill: bright ? "#e7ecff" : "#8891b3", letterSpacing: "0.02em", style: { pointerEvents: "none" as const, fontFamily: MONO } }, name));
    });

    const hb = this.props.bodies.find(b => b.id === this.state.hoverId);
    let leader: React.ReactNode = null;
    if (hb) { const p = this.posFor(hb, groups); leader = h("line", { key: "leader", x1: p.x, y1: p.y, x2: v.x + v.w * 0.97, y2: v.y + v.h * 0.06, stroke: "#8891b3", strokeWidth: 0.5, strokeDasharray: "3 4", opacity: 0.5 }); }

    const star = this.props.bodies.find(b => b.ring === 0);
    if (star) { const p = this.posFor(star, groups);
      children.push(h("text", { key: "starlbl", x: p.x, y: p.y + this.bodyRadius(star) * 3 + 6, fill: "#ffb347", fontSize: 11, textAnchor: "middle", letterSpacing: "0.16em", style: { fontFamily: MONO } }, `${star.designation} · ${(this.props.settings.name || "").toUpperCase()}`)); }

    children.push(h("g", { key: "labels" }, labelEls));
    children.push(leader);
    children.push(h("g", { key: "bodies" }, bodyEls));

    return h("svg", {
      ref: this._svgRefCallback,
      viewBox: `${v.x} ${v.y} ${v.w} ${v.h}`,
      width: "100%", height: "100%",
      preserveAspectRatio: "xMidYMid meet",
      style: { display: "block", cursor: this.drag ? "grabbing" : "grab", touchAction: "none" },
      onPointerDown: this.onDown,
    }, children);
  }

  mdInline(t: string): React.ReactNode[] {
    const h = React.createElement; const out: React.ReactNode[] = []; let key = 0, last = 0;
    const re = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(t))) {
      if (m.index > last) out.push(t.slice(last, m.index));
      if (m[2] != null) out.push(h("strong", { key: key++, style: { color: "#eef1ff", fontWeight: 600 } }, m[2]));
      else if (m[4] != null) out.push(h("code", { key: key++, style: { fontFamily: MONO, fontSize: ".86em", background: "rgba(124,140,240,.12)", padding: "1px 5px", borderRadius: 2, color: "#b7c2ff" } }, m[4]));
      else if (m[6] != null) out.push(h("em", { key: key++ }, m[6]));
      else if (m[8] != null) out.push(h("a", { key: key++, href: m[9] }, m[8]));
      last = re.lastIndex;
    }
    if (last < t.length) out.push(t.slice(last));
    return out;
  }

  parseMd(md: string) {
    const h = React.createElement; const lines = (md || "").replace(/\r/g, "").split("\n");
    const b: React.ReactNode[] = []; let i = 0, k = 0;
    while (i < lines.length) {
      const ln = lines[i];
      if (/^```/.test(ln)) { const buf: string[] = []; i++; while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; } i++;
        b.push(h("pre", { key: k++, style: { fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: "#c6cbe0", background: "rgba(10,12,20,.85)", border: "1px solid rgba(124,140,240,.18)", padding: "14px 16px", overflow: "auto", margin: "14px 0" } }, buf.join("\n"))); continue; }
      if (/^#{1,6}\s/.test(ln)) { const lvl = ln.match(/^#+/)![0].length; const sz: Record<number, number> = { 1: 26, 2: 20, 3: 16, 4: 15, 5: 14, 6: 13 };
        b.push(h("div", { key: k++, style: { fontFamily: SANS, fontWeight: 600, fontSize: sz[lvl], color: "#f2f4ff", margin: "22px 0 8px", lineHeight: 1.25 } }, this.mdInline(ln.replace(/^#+\s/, "")))); i++; continue; }
      if (/^>\s?/.test(ln)) { const buf: string[] = []; while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
        b.push(h("blockquote", { key: k++, style: { borderLeft: "2px solid #6ea8ff", paddingLeft: 14, margin: "16px 0", color: "#9aa2c2", fontStyle: "italic", fontFamily: SANS, fontSize: 15, lineHeight: 1.7 } }, this.mdInline(buf.join(" ")))); continue; }
      if (/^(-|\*)\s/.test(ln)) { const it: React.ReactNode[] = []; while (i < lines.length && /^(-|\*)\s/.test(lines[i])) { it.push(h("li", { key: k++, style: { margin: "5px 0" } }, this.mdInline(lines[i].replace(/^(-|\*)\s/, "")))); i++; }
        b.push(h("ul", { key: k++, style: { margin: "12px 0", paddingLeft: 20, lineHeight: 1.6, fontFamily: SANS, fontSize: 15, color: "#c6cbe0" } }, it)); continue; }
      if (/^\d+\.\s/.test(ln)) { const it: React.ReactNode[] = []; while (i < lines.length && /^\d+\.\s/.test(lines[i])) { it.push(h("li", { key: k++, style: { margin: "5px 0" } }, this.mdInline(lines[i].replace(/^\d+\.\s/, "")))); i++; }
        b.push(h("ol", { key: k++, style: { margin: "12px 0", paddingLeft: 22, lineHeight: 1.6, fontFamily: SANS, fontSize: 15, color: "#c6cbe0" } }, it)); continue; }
      if (/^!\[([^\]]*)\]\(([^)]+)\)/.test(ln)) { const mm = ln.match(/^!\[([^\]]*)\]\(([^)]+)\)/)!;
        b.push(h("div", { key: k++, style: { position: "relative", margin: "16px 0", border: "1px solid rgba(124,140,240,.18)" } },
          h("img", { src: mm[2], alt: mm[1], style: { display: "block", width: "100%" }, onError: (e: React.SyntheticEvent<HTMLImageElement>) => { (e.target as HTMLImageElement).style.display = "none"; const ns = (e.target as HTMLElement).nextSibling as HTMLElement; if (ns) ns.style.display = "grid"; } }),
          h("div", { style: { display: "none", placeItems: "center", padding: "40px 12px", fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: "#565d7c", background: "repeating-linear-gradient(45deg,#0c0e18,#0c0e18 10px,#0f1120 10px,#0f1120 20px)" } }, "IMAGE UNAVAILABLE · " + (mm[1] || "media")))); i++; continue; }
      if (/^(-{3,}|\*{3,})$/.test(ln.trim())) { b.push(h("hr", { key: k++, style: { border: "none", borderTop: "1px solid rgba(124,140,240,.18)", margin: "20px 0" } })); i++; continue; }
      if (ln.trim() === "") { i++; continue; }
      const buf = [ln]; i++;
      while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,6}\s|>|(-|\*)\s|\d+\.\s|```|!\[|-{3,}$)/.test(lines[i])) { buf.push(lines[i]); i++; }
      b.push(h("p", { key: k++, style: { fontFamily: SANS, fontSize: 15, lineHeight: 1.75, color: "#c6cbe0", margin: "0 0 14px" } }, this.mdInline(buf.join(" "))));
    }
    return h("div", { style: { maxWidth: "70ch" } }, b);
  }

  // §4.4 — the cat
  buildCatVisual() {
    const h = React.createElement; const cs = this.state.catState, obs = this.state.observing;
    const box = (kids: React.ReactNode[]) => h("div", { style: { position: "relative", width: 230, height: 150, border: "1px solid rgba(34,211,238,.35)", background: "radial-gradient(120% 100% at 50% 30%,#08161c,#040a0e)", display: "grid", placeItems: "center", overflow: "hidden" } }, kids);
    const alive = (sharp: boolean) => h("div", { key: "a", style: { position: sharp ? "relative" as const : "absolute" as const, textAlign: "center" as const, filter: sharp ? "none" : "blur(3px)", animation: sharp ? "none" : "omSuperA 1.7s ease-in-out infinite" } },
      h("div", { style: { width: 48, height: 48, borderRadius: "50%", background: "#7ee0a6", margin: "0 auto", boxShadow: "0 0 26px rgba(126,224,166,.6)" } }),
      h("div", { style: { marginTop: 9, fontFamily: MONO, fontSize: 11, letterSpacing: ".22em", color: "#7ee0a6" } }, "ALIVE"));
    const dead = (sharp: boolean) => h("div", { key: "d", style: { position: sharp ? "relative" as const : "absolute" as const, textAlign: "center" as const, filter: sharp ? "none" : "blur(3px)", animation: sharp ? "none" : "omSuperB 1.7s ease-in-out infinite" } },
      h("svg", { width: 48, height: 48, viewBox: "0 0 48 48", style: { display: "block", margin: "0 auto" } },
        h("circle", { cx: 24, cy: 24, r: 22, fill: "none", stroke: "#ff9e6d", strokeWidth: 2, opacity: 0.85 }),
        h("line", { x1: 9, y1: 9, x2: 39, y2: 39, stroke: "#ff9e6d", strokeWidth: 2 })),
      h("div", { style: { marginTop: 9, fontFamily: MONO, fontSize: 11, letterSpacing: ".22em", color: "#ff9e6d" } }, "DEAD"));
    if (obs) return box([
      h("div", { key: "sweep", style: { position: "absolute" as const, left: 0, right: 0, height: "60%", background: "linear-gradient(180deg,transparent,rgba(34,211,238,.3),transparent)", animation: "omScan .55s linear infinite" } }),
      h("div", { key: "q", style: { fontFamily: MONO, fontSize: 30, color: "#22d3ee", animation: "omFlick .1s steps(2) infinite alternate" } }, "ψ"),
      h("div", { key: "m", style: { position: "absolute" as const, bottom: 8, fontFamily: MONO, fontSize: 10, letterSpacing: ".2em", color: "#22d3ee" } }, "MEASURING…")
    ]);
    if (cs === "alive") return box([alive(true)]);
    if (cs === "dead") return box([dead(true)]);
    return box([alive(false), dead(false),
      h("div", { key: "psi", style: { position: "absolute" as const, bottom: 7, fontFamily: MONO, fontSize: 10.5, color: "#4d9cae" } }, "|ψ⟩ = α|alive⟩ + β|dead⟩")]);
  }

  buildIntro(): React.ReactNode {
    const h = React.createElement; const ph = this.state.intro; if (ph === "done") return null;
    const scale = ph === "pullback" ? 0.46 : ph === "push" ? 0.82 : 1;
    const fade = ph === "resolve" ? 0 : 1;
    return h("div", { onClick: this.skip, style: { position: "absolute" as const, inset: 0, cursor: "pointer", background: `rgba(3,4,8,${0.92 * fade})`, transition: "background .9s ease", display: "grid", placeItems: "center", overflow: "hidden" } },
      h("button", { key: "skip", onClick: this.skip, style: { position: "absolute" as const, top: 12, right: 14, zIndex: 2, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: ".16em", padding: "8px 16px", color: "#07070c", background: "#ffb347", border: "none", cursor: "pointer" } }, "SKIP ›"),
      h("div", { key: "con", style: { width: "86vw", height: "80vh", border: "1px solid rgba(124,140,240,.5)", borderRadius: 10, background: "radial-gradient(120% 90% at 50% 40%,#0c0d17,#050509)", boxShadow: "0 0 120px rgba(0,0,0,.85), inset 0 0 90px rgba(0,0,0,.75)", transform: `scale(${scale})`, transition: "transform 1.15s cubic-bezier(.4,0,.2,1), opacity .9s ease", opacity: fade, position: "relative" as const, display: "grid", placeItems: "center" } },
        h("div", { style: { position: "absolute" as const, top: 10, left: 14, fontFamily: MONO, fontSize: 10, letterSpacing: ".2em", color: "#5a6180" } }, "MISSION CONTROL // BOOT"),
        h("div", { style: { position: "absolute" as const, bottom: 10, left: 14, fontFamily: MONO, fontSize: 10, letterSpacing: ".2em", color: "#5a6180" } }, "SYS-01 · SINGLE-STAR"),
        h("div", { style: { position: "absolute" as const, top: 10, right: 14, width: 8, height: 8, borderRadius: "50%", background: "#ffb347", boxShadow: "0 0 10px #ffb347" } }),
        h("div", { style: { fontFamily: MONO, fontSize: 12, letterSpacing: ".32em", color: "#7d85a6" } }, ph === "pullback" ? "◍ POWERING UP" : "◍ ACQUIRING ORBIT")
      ));
  }

  render() {
    const bodies = this.props.bodies;
    const settings = this.props.settings;
    const transmissions = this.props.transmissions;

    const hb0 = this.state.hoverId ? bodies.find(b => b.id === this.state.hoverId) : null;
    const activeRing = this.state.hoverRing != null ? this.state.hoverRing : (hb0 ? hb0.ring : null);
    ([1, 2, 3, 99, 100] as number[]).forEach(r => this.setRunning(r, !this.state.reduced && activeRing !== r));

    const sel = bodies.find(b => b.id === this.state.selectedId) || null;
    const hb = bodies.find(b => b.id === this.state.hoverId) || null;
    const v = this.vb;

    const statusChipStyle = (status: string): React.CSSProperties => {
      if (status === "ACTIVE") return { border: "1px solid rgba(110,168,255,.5)", color: "#6ea8ff", background: "rgba(110,168,255,.06)" };
      if (status === "IN_DEV") return { border: "1px solid rgba(180,140,240,.5)", color: "#b48cf0", background: "rgba(180,140,240,.06)" };
      return { border: "1px solid rgba(90,97,128,.5)", color: "#7d85a6" };
    };

    return (
      <div data-orbital-map style={{ position: "fixed", inset: 0, background: "radial-gradient(120% 90% at 50% 38%, #0c0d17 0%, #07070c 60%, #050509 100%)", color: "#aeb6cf", fontFamily: MONO, overflow: "hidden", userSelect: "none" }}>
        <style>{KEYFRAMES}</style>

        <div style={{ position: "absolute", inset: 0 }}>{this.buildSvg()}</div>

        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 240px 40px rgba(0,0,0,.85)", mixBlendMode: "multiply" }} />

        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>

          {/* top status strip */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "0 16px", borderBottom: "1px solid rgba(124,140,240,.14)", background: "linear-gradient(180deg, rgba(9,10,20,.82), rgba(9,10,20,0))", pointerEvents: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, letterSpacing: ".12em", flexShrink: 0, whiteSpace: "nowrap" }}>
              <span style={{ color: "#ffb347" }}>{"◍"}</span>
              <span style={{ color: "#cbd2ea" }}>MISSION&nbsp;CONTROL</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 10, letterSpacing: ".06em", flexShrink: 0 }}>
              <a href="/" style={{ padding: "7px 9px", color: "#e7ecff", border: "1px solid rgba(124,140,240,.4)", background: "rgba(124,140,240,.08)" }}>MAP</a>
              <a href="/about" style={{ padding: "7px 9px" }}>ABOUT</a>
              <a href="/projects" style={{ padding: "7px 9px" }}>PROJECTS</a>
              <a href="/experiences" style={{ padding: "7px 9px" }}>EXPERIENCES</a>
              <a href="/blog" style={{ padding: "7px 9px" }}>BLOG</a>
              <a href="/achievements" style={{ padding: "7px 9px" }}>ACHIEVEMENTS</a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <button onClick={this.toggleComms} style={{ fontFamily: "inherit", fontSize: 10, letterSpacing: ".1em", padding: "7px 10px", color: "#aeb6cf", background: "transparent", border: "1px solid rgba(124,140,240,.28)", cursor: "pointer", whiteSpace: "nowrap" }}>OPEN&nbsp;COMMS</button>
              <button onClick={this.toggleSpec} style={{ fontFamily: "inherit", fontSize: 10, letterSpacing: ".1em", padding: "7px 10px", color: "#aeb6cf", background: "transparent", border: "1px solid rgba(124,140,240,.28)", cursor: "pointer", whiteSpace: "nowrap" }}>SPEC</button>
              {settings.resumeUrl && (
                <a href={settings.resumeUrl} download={settings.resumeFileName || true} target="_blank" rel="noopener" style={{ fontFamily: "inherit", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", padding: "7px 12px", color: "#07070c", background: "#ffb347", border: "1px solid #ffb347", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>{"⤓"}&nbsp;MISSION&nbsp;DOSSIER</a>
              )}
            </div>
          </div>

          {/* corner brackets */}
          <div style={{ position: "absolute", top: 60, left: 14, width: 26, height: 26, borderLeft: "1px solid rgba(124,140,240,.4)", borderTop: "1px solid rgba(124,140,240,.4)" }} />
          <div style={{ position: "absolute", bottom: 60, left: 14, width: 26, height: 26, borderLeft: "1px solid rgba(124,140,240,.4)", borderBottom: "1px solid rgba(124,140,240,.4)" }} />
          <div style={{ position: "absolute", bottom: 60, right: 14, width: 26, height: 26, borderRight: "1px solid rgba(124,140,240,.4)", borderBottom: "1px solid rgba(124,140,240,.4)" }} />

          {/* left rail */}
          <div style={{ position: "absolute", left: 14, top: 64, display: "flex", flexDirection: "column", gap: 14, pointerEvents: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 9, letterSpacing: ".12em" }}>
              <div style={{ color: "#5a6180", paddingLeft: 2 }}>ZOOM&nbsp;TO</div>
              <button onClick={() => this.zoomToRing(1)} style={{ fontFamily: "inherit", textAlign: "left", fontSize: 10, color: "#ff9e6d", background: "transparent", border: "none", borderLeft: "1px solid rgba(255,158,109,.5)", padding: "3px 8px", cursor: "pointer" }}>R1 {"·"} NOW</button>
              <button onClick={() => this.zoomToRing(2)} style={{ fontFamily: "inherit", textAlign: "left", fontSize: 10, color: "#b48cf0", background: "transparent", border: "none", borderLeft: "1px solid rgba(180,140,240,.5)", padding: "3px 8px", cursor: "pointer" }}>R2 {"·"} PAST</button>
              <button onClick={() => this.zoomToRing(3)} style={{ fontFamily: "inherit", textAlign: "left", fontSize: 10, color: "#6ea8ff", background: "transparent", border: "none", borderLeft: "1px solid rgba(110,168,255,.5)", padding: "3px 8px", cursor: "pointer" }}>R3 {"·"} WORK</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(124,140,240,.24)", background: "rgba(9,10,20,.55)" }}>
              <button onClick={this.zoomIn} title="zoom in" style={{ fontFamily: "inherit", width: 40, height: 40, fontSize: 18, color: "#cbd2ea", background: "transparent", border: "none", borderBottom: "1px solid rgba(124,140,240,.18)", cursor: "pointer" }}>+</button>
              <button onClick={this.zoomOut} title="zoom out" style={{ fontFamily: "inherit", width: 40, height: 40, fontSize: 18, color: "#cbd2ea", background: "transparent", border: "none", borderBottom: "1px solid rgba(124,140,240,.18)", cursor: "pointer" }}>{"−"}</button>
              <button onClick={this.reset} title="reset view" style={{ fontFamily: "inherit", width: 40, height: 40, fontSize: 9, letterSpacing: ".06em", color: "#8891b3", background: "transparent", border: "none", cursor: "pointer" }}>RST</button>
            </div>
          </div>

          {/* top-right telemetry */}
          <div style={{ position: "absolute", top: 60, right: 14, width: 230, border: "1px solid rgba(124,140,240,.28)", background: "rgba(9,10,20,.72)", backdropFilter: "blur(3px)", pointerEvents: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid rgba(124,140,240,.18)", fontSize: 9, letterSpacing: ".18em", color: "#5a6180" }}>
              <span>TELEMETRY</span><span>{hb ? hb.designation : "——"}</span>
            </div>
            {hb ? (
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 13, color: "#e7ecff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hb.name}</div>
                <div style={{ fontSize: 10, color: "#8891b3", letterSpacing: ".06em", marginBottom: 8 }}>{this.typeLabel(hb.bodyType)} {"·"} {hb.status}</div>
                <div style={{ display: "flex", gap: 6, fontSize: 9, letterSpacing: ".08em", marginBottom: 8 }}>
                  <span style={{ padding: "2px 6px", border: "1px solid rgba(124,140,240,.3)", color: "#aeb6cf" }}>RING {hb.ring === 99 ? "BELT" : hb.ring === 100 ? "CMT" : hb.ring}</span>
                  <span style={{ padding: "2px 6px", border: "1px solid rgba(124,140,240,.3)", color: "#aeb6cf" }}>SIZE {hb.size}</span>
                </div>
                <div style={{ fontSize: 11, lineHeight: 1.5, color: "#98a0c0", fontFamily: SANS }}>{hb.summary || "—"}</div>
              </div>
            ) : (
              <div style={{ padding: "14px 10px", fontSize: 10, letterSpacing: ".06em", color: "#565d7c", lineHeight: 1.6 }}>no body under cursor.<br />hover a body — or Tab to cycle.</div>
            )}
          </div>

          {/* bottom status strip */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", borderTop: "1px solid rgba(124,140,240,.14)", background: "linear-gradient(0deg, rgba(9,10,20,.82), rgba(9,10,20,0))", fontSize: 10, letterSpacing: ".1em", color: "#7d85a6", pointerEvents: "auto" }}>
            <div style={{ display: "flex", gap: 20 }}>
              <span>CTR&nbsp;<span style={{ color: "#aeb6cf" }}>{Math.round(v.x + v.w / 2)}{"·"}{Math.round(v.y + v.h / 2)}</span></span>
              <span>ZOOM&nbsp;<span style={{ color: "#aeb6cf" }}>{Math.round(1000 / v.w * 100)}%</span></span>
              <span>BODIES&nbsp;<span style={{ color: "#aeb6cf" }}>{bodies.length}</span></span>
              <span style={{ color: "#565d7c" }}>{this.state.reduced ? "REDUCED-MOTION · STATIC" : "DRIFT · NOMINAL"}</span>
            </div>
            <button onClick={this.toggleWhy} style={{ fontFamily: "inherit", fontSize: 10, letterSpacing: ".1em", color: "#ffb347", background: "transparent", border: "none", cursor: "pointer" }}>? why a solar system</button>
          </div>

          {/* dossier panel */}
          {sel && (
            <div style={{ position: "absolute", top: 48, bottom: 40, right: 0, width: "40%", maxWidth: 520, minWidth: 360, background: "rgba(8,9,16,.94)", backdropFilter: "blur(6px)", borderLeft: "1px solid rgba(124,140,240,.28)", display: "flex", flexDirection: "column", pointerEvents: "auto", boxShadow: "-30px 0 60px rgba(0,0,0,.5)", userSelect: "text" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(124,140,240,.16)" }}>
                <div style={{ fontSize: 10, letterSpacing: ".2em", color: "#5a6180" }}>DOSSIER {"·"} {sel.designation}</div>
                <button onClick={this.closeSelected} style={{ fontFamily: "inherit", fontSize: 11, letterSpacing: ".1em", color: "#aeb6cf", background: "transparent", border: "1px solid rgba(124,140,240,.3)", padding: "5px 10px", cursor: "pointer" }}>CLOSE&nbsp;esc</button>
              </div>
              <div style={{ padding: 18, overflow: "auto" }}>
                <div style={{ fontSize: 26, fontWeight: 600, color: "#f2f4ff", fontFamily: SANS, lineHeight: 1.15, marginBottom: 10 }}>{sel.name}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                  <span style={{ fontSize: 10, letterSpacing: ".08em", padding: "4px 9px", border: "1px solid rgba(124,140,240,.35)", color: "#cbd2ea" }}>{this.typeLabel(sel.bodyType)}</span>
                  <span style={{ fontSize: 10, letterSpacing: ".08em", padding: "4px 9px", ...statusChipStyle(sel.status) }}>{sel.status}</span>
                </div>

                {sel.chips.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 10, letterSpacing: ".18em", color: "#5a6180", marginBottom: 8 }}>PAYLOAD</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {sel.chips.map(c => <span key={c} style={{ fontSize: 11, letterSpacing: ".04em", padding: "3px 8px", border: "1px solid rgba(110,168,255,.3)", color: "#9fb6e6", background: "rgba(110,168,255,.06)", fontFamily: MONO }}>{c}</span>)}
                    </div>
                  </div>
                )}

                {sel.meta.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", padding: "14px 0", borderTop: "1px solid rgba(124,140,240,.14)", borderBottom: "1px solid rgba(124,140,240,.14)", marginBottom: 18 }}>
                    {sel.meta.map(m => (
                      <React.Fragment key={m.label}>
                        <div style={{ fontSize: 10, letterSpacing: ".08em", color: "#6b7297", textTransform: "uppercase", paddingTop: 2 }}>{m.label}</div>
                        <div style={{ fontSize: 13, color: "#d3d8ee", fontFamily: SANS }}>{m.value}</div>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {sel.markdown && sel.markdown.trim() ? this.parseMd(sel.markdown) : (
                  <div style={{ border: "1px dashed rgba(124,140,240,.28)", padding: 20, textAlign: "center", color: "#565d7c", fontSize: 12, letterSpacing: ".06em" }}>NO LOG ENTRY YET<br /><span style={{ color: "#454b68" }}>this body has no dossier text.</span></div>
                )}

                {sel.bodyType === "comet" && (
                  <div style={{ marginTop: 24, border: "1px solid rgba(34,211,238,.32)", background: "rgba(5,13,17,.6)", padding: 18 }}>
                    <div style={{ fontSize: 10, letterSpacing: ".2em", color: "#22d3ee", marginBottom: 14 }}>APPARATUS {"·"} SEALED BOX {"·"} CMT-01</div>
                    <div style={{ display: "grid", placeItems: "center", marginBottom: 16 }}>{this.buildCatVisual()}</div>
                    <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".03em", color: "#8891b3", marginBottom: 14 }}>
                      measurement result: <span style={{ color: this.state.observing ? "#22d3ee" : this.state.catState === "alive" ? "#7ee0a6" : this.state.catState === "dead" ? "#ff9e6d" : "#565d7c" }}>
                        {this.state.observing ? "measuring…" : this.state.catState === "super" ? "—— (superposed, undecided)" : this.state.catState}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={this.observe} style={{ fontFamily: MONO, flex: 1, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", padding: "10px 14px", color: "#04121a", background: "#22d3ee", border: "none", cursor: "pointer" }}>OBSERVE</button>
                      <button onClick={this.reSuper} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", padding: "10px 14px", color: "#8891b3", background: "transparent", border: "1px solid rgba(34,211,238,.3)", cursor: "pointer" }}>RESEAL</button>
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 11, lineHeight: 1.5, color: "#565d7c", marginTop: 12 }}>Superposed until observed. The outcome is genuinely random per observation — reseal and try again.</div>
                  </div>
                )}

                {sel.links.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(124,140,240,.14)" }}>
                    {sel.links.map(lk => (
                      <a key={lk.url} href={lk.url} target="_blank" rel="noopener" style={{ fontSize: 12, letterSpacing: ".04em", display: "flex", justifyContent: "space-between", padding: "8px 10px", border: "1px solid rgba(124,140,240,.2)" }}>
                        <span>{lk.label}</span><span style={{ color: "#5a6180" }}>{"↗"}</span>
                      </a>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 22, fontSize: 10, letterSpacing: ".08em", color: "#454b68" }}>/body/{sel.slug} {"·"} full markdown rendering lands in the dossier build</div>
              </div>
            </div>
          )}

          {/* why panel */}
          {this.state.showWhy && (
            <div style={{ position: "absolute", left: "50%", bottom: 56, transform: "translateX(-50%)", width: "min(560px,90vw)", background: "rgba(8,9,16,.95)", border: "1px solid rgba(255,179,71,.32)", padding: "18px 20px", pointerEvents: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 10, letterSpacing: ".2em", color: "#ffb347" }}>READOUT {"·"} WHY A SOLAR SYSTEM</span>
                <button onClick={this.toggleWhy} style={{ fontFamily: "inherit", fontSize: 11, color: "#aeb6cf", background: "transparent", border: "none", cursor: "pointer" }}>{"✕"}</button>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.7, color: "#c6cbe0" }}>
                {settings.whyContent.split("\n\n").map((para, i) => <p key={i} style={{ margin: "0 0 10px" }}>{para}</p>)}
              </div>
            </div>
          )}

          {/* transmissions feed */}
          {transmissions.length > 0 && (
            <div style={{ position: "absolute", left: 14, bottom: 58, width: 262, border: "1px solid rgba(124,140,240,.24)", background: "rgba(9,10,20,.72)", backdropFilter: "blur(3px)", pointerEvents: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderBottom: "1px solid rgba(124,140,240,.18)", fontSize: 9, letterSpacing: ".18em", color: "#5a6180" }}>
                <span>{"◈"} TRANSMISSIONS</span><a href="/blog" style={{ fontSize: 9, letterSpacing: ".1em" }}>ALL {"›"}</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {transmissions.map(t => (
                  <a key={t.slug} href={`/blog/${t.slug}`} style={{ display: "block", padding: 10, borderBottom: "1px solid rgba(124,140,240,.1)" }}>
                    <div style={{ fontSize: 12, color: "#e7ecff", fontFamily: SANS, lineHeight: 1.3, marginBottom: 3 }}>{t.title}</div>
                    <div style={{ fontSize: 10.5, color: "#7d85a6", fontFamily: SANS, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.excerpt}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* comms panel */}
          {this.state.showComms && (
            <div style={{ position: "absolute", top: 48, bottom: 40, right: 0, width: "40%", maxWidth: 460, minWidth: 340, background: "rgba(8,9,16,.96)", backdropFilter: "blur(6px)", borderLeft: "1px solid rgba(124,140,240,.28)", display: "flex", flexDirection: "column", pointerEvents: "auto", boxShadow: "-30px 0 60px rgba(0,0,0,.5)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(124,140,240,.16)" }}>
                <div style={{ fontSize: 10, letterSpacing: ".2em", color: "#5a6180" }}>COMMS {"·"} UPLINK</div>
                <button onClick={this.toggleComms} style={{ fontFamily: "inherit", fontSize: 11, letterSpacing: ".1em", color: "#aeb6cf", background: "transparent", border: "1px solid rgba(124,140,240,.3)", padding: "5px 10px", cursor: "pointer" }}>CLOSE&nbsp;esc</button>
              </div>
              <div style={{ padding: 18, overflow: "auto" }}>
                {this.state.commsState === "success" ? (
                  <div style={{ border: "1px solid rgba(126,224,166,.4)", background: "rgba(126,224,166,.06)", padding: 22, textAlign: "center" }}>
                    <div style={{ fontSize: 13, letterSpacing: ".16em", color: "#7ee0a6", marginBottom: 8 }}>{"◍"} SIGNAL RECEIVED</div>
                    <div style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: "#c6cbe0" }}>Your transmission reached the ground station. I{"'"}ll reply from orbit shortly.</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: "#98a0c0", marginBottom: 18 }}>Open a channel. Fields are transmitted to the operator; nothing is stored in this preview.</div>
                    {(this.state.commsState === "invalid" || this.state.commsState === "error") && (
                      <div style={{ border: "1px solid rgba(255,158,109,.4)", background: "rgba(255,158,109,.07)", padding: "12px 14px", marginBottom: 16, fontFamily: SANS, fontSize: 13, color: "#ffb98f" }}>
                        {this.state.commsError}
                        {this.state.commsState === "error" && (
                          <div style={{ marginTop: 6, color: "#c6cbe0" }}>Reach me directly: <a href={`mailto:${settings.email}`}>{settings.email}</a></div>
                        )}
                      </div>
                    )}
                    <form onSubmit={this.submitComms} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 10, letterSpacing: ".14em", color: "#6b7297" }}>CALLSIGN / NAME
                        <input name="name" type="text" autoComplete="name" style={{ fontFamily: SANS, fontSize: 14, color: "#e7ecff", background: "rgba(124,140,240,.06)", border: "1px solid rgba(124,140,240,.28)", padding: "10px 12px", outline: "none" }} />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 10, letterSpacing: ".14em", color: "#6b7297" }}>RETURN FREQUENCY / EMAIL
                        <input name="email" type="email" autoComplete="email" style={{ fontFamily: SANS, fontSize: 14, color: "#e7ecff", background: "rgba(124,140,240,.06)", border: "1px solid rgba(124,140,240,.28)", padding: "10px 12px", outline: "none" }} />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 10, letterSpacing: ".14em", color: "#6b7297" }}>MESSAGE
                        <textarea name="message" rows={5} style={{ fontFamily: SANS, fontSize: 14, color: "#e7ecff", background: "rgba(124,140,240,.06)", border: "1px solid rgba(124,140,240,.28)", padding: "10px 12px", outline: "none", resize: "vertical" }} />
                      </label>
                      <button type="submit" style={{ fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: ".16em", padding: "12px 16px", color: "#07070c", background: "#ffb347", border: "none", cursor: "pointer" }}>{this.state.commsState === "submitting" ? "TRANSMITTING…" : "TRANSMIT ›"}</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* spec overlay */}
          {this.state.showSpec && (
            <div style={{ position: "absolute", inset: "48px 0 40px 0", background: "rgba(6,7,13,.97)", pointerEvents: "auto", overflow: "auto" }}>
              <div style={{ maxWidth: 1080, margin: "0 auto", padding: "34px 40px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 30 }}>
                  <div>
                    <div style={{ fontSize: 22, color: "#f2f4ff", letterSpacing: ".02em" }}>VISUAL SYSTEM</div>
                    <div style={{ fontSize: 11, color: "#6b7297", letterSpacing: ".14em", marginTop: 4 }}>{"§"}5 {"·"} SCHEMATIC / BLUEPRINT / MISSION TELEMETRY</div>
                  </div>
                  <button onClick={this.toggleSpec} style={{ fontFamily: "inherit", fontSize: 11, letterSpacing: ".1em", color: "#aeb6cf", background: "transparent", border: "1px solid rgba(124,140,240,.3)", padding: "7px 12px", cursor: "pointer" }}>CLOSE&nbsp;{"›"}</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
                  <div style={{ border: "1px solid rgba(124,140,240,.18)", padding: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: ".2em", color: "#5a6180", marginBottom: 16 }}>TYPE {"·"} TWO FAMILIES</div>
                    <div style={{ fontFamily: MONO, fontSize: 24, color: "#e7ecff" }}>Space&nbsp;Mono</div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: "#7d85a6", letterSpacing: ".06em", margin: "4px 0 18px" }}>HUD {"·"} READOUTS {"·"} LABELS {"·"} DATA {"·"} 0123456789</div>
                    <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 600, color: "#e7ecff" }}>IBM Plex Sans</div>
                    <div style={{ fontFamily: SANS, fontSize: 13, color: "#98a0c0", lineHeight: 1.6, marginTop: 6 }}>Prose &amp; dossier body — comfortable measure, real line-height, passes AA on near-black.</div>
                  </div>

                  <div style={{ border: "1px solid rgba(124,140,240,.18)", padding: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: ".2em", color: "#5a6180", marginBottom: 16 }}>COLOR {"·"} EVOLVED, NOT DISCARDED</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, fontSize: 9, letterSpacing: ".04em" }}>
                      {[["#07070c", "VOID #07070c", "1px solid #23283a"], ["#ffb347", "STAR #ffb347", ""], ["#ff9e6d", "R1 #ff9e6d", ""], ["#b48cf0", "R2 #b48cf0", ""], ["#6ea8ff", "R3 #6ea8ff", ""], ["#22d3ee", "COMET #22d3ee", ""]].map(([bg, label, bdr]) => (
                        <div key={label}>
                          <div style={{ height: 44, background: bg, border: bdr || undefined }} />
                          <div style={{ marginTop: 5, color: "#8891b3" }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#98a0c0", lineHeight: 1.6, marginTop: 14, fontFamily: SANS }}>The old purple/blue neon becomes cool structure. The one warm point is the star — the person.</div>
                  </div>

                  <div style={{ border: "1px solid rgba(124,140,240,.18)", padding: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: ".2em", color: "#5a6180", marginBottom: 16 }}>LINE {"·"} HAIRLINE VOCABULARY</div>
                    <svg viewBox="0 0 320 120" style={{ width: "100%", height: "auto" }}>
                      <line x1={10} y1={20} x2={310} y2={20} stroke="#7c8cf0" strokeWidth={0.5} />
                      <text x={10} y={14} fill="#6b7297" fontSize={8} fontFamily="Space Mono">0.5 {"·"} orbit ring / structure</text>
                      <line x1={10} y1={48} x2={310} y2={48} stroke="#7c8cf0" strokeWidth={1} strokeDasharray="6 5" />
                      <text x={10} y={42} fill="#6b7297" fontSize={8} fontFamily="Space Mono">dashed {"·"} construction / IN_DEV</text>
                      <line x1={10} y1={76} x2={310} y2={76} stroke="#22d3ee" strokeWidth={1.4} />
                      <text x={10} y={70} fill="#6b7297" fontSize={8} fontFamily="Space Mono">1.4 {"·"} comet path / emphasis</text>
                      <g>
                        {[10, 40, 70, 100].map(x => <line key={x} x1={x} y1={104} x2={x} y2={112} stroke="#5a6180" strokeWidth={1} />)}
                        <text x={120} y={110} fill="#6b7297" fontSize={8} fontFamily="Space Mono">tick marks {"·"} degree scale</text>
                      </g>
                    </svg>
                  </div>

                  <div style={{ border: "1px solid rgba(124,140,240,.18)", padding: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: ".2em", color: "#5a6180", marginBottom: 16 }}>STATE {"·"} STATUS DRIVES VISUAL</div>
                    <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <svg viewBox="0 0 60 60" width={60} height={60}>
                          <circle cx={30} cy={30} r={22} fill="none" stroke="#6ea8ff" strokeWidth={0.6} opacity={0.5} />
                          <circle cx={30} cy={30} r={10} fill="#6ea8ff" />
                          <circle cx={30} cy={30} r={16} fill="none" stroke="#6ea8ff" strokeWidth={1}>
                            <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values=".8;0;.8" dur="2s" repeatCount="indefinite" />
                          </circle>
                        </svg>
                        <div style={{ fontSize: 9, color: "#8891b3", letterSpacing: ".06em" }}>ACTIVE {"·"} pulse</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <svg viewBox="0 0 60 60" width={60} height={60}>
                          <circle cx={30} cy={30} r={12} fill="none" stroke="#b48cf0" strokeWidth={1.4} strokeDasharray="4 4" />
                        </svg>
                        <div style={{ fontSize: 9, color: "#8891b3", letterSpacing: ".06em" }}>IN_DEV {"·"} dashed</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <svg viewBox="0 0 60 60" width={60} height={60}>
                          <circle cx={30} cy={30} r={10} fill="#4a5170" />
                        </svg>
                        <div style={{ fontSize: 9, color: "#8891b3", letterSpacing: ".06em" }}>ARCHIVED {"·"} dim</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#98a0c0", lineHeight: 1.6, marginTop: 16, fontFamily: SANS }}>bodyType picks the glyph {"·"} size scales it {"·"} status sets the state. Nothing hardcoded.</div>
                  </div>

                  <div style={{ border: "1px solid rgba(124,140,240,.18)", padding: 20, gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".2em", color: "#5a6180", marginBottom: 16 }}>HUD COMPONENTS</div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "stretch" }}>
                      <div style={{ border: "1px solid rgba(124,140,240,.28)", padding: "10px 12px", minWidth: 150 }}>
                        <div style={{ fontSize: 9, letterSpacing: ".18em", color: "#5a6180", borderBottom: "1px solid rgba(124,140,240,.16)", paddingBottom: 4, marginBottom: 6 }}>READOUT</div>
                        <div style={{ fontSize: 11, color: "#cbd2ea" }}>bracketed panel<br />mono, blur backing</div>
                      </div>
                      <span style={{ alignSelf: "center", fontSize: 10, letterSpacing: ".08em", padding: "4px 9px", border: "1px solid rgba(124,140,240,.35)", color: "#cbd2ea" }}>TYPE CHIP</span>
                      <span style={{ alignSelf: "center", fontSize: 10, letterSpacing: ".08em", padding: "4px 9px", border: "1px solid rgba(110,168,255,.5)", color: "#6ea8ff" }}>ACTIVE</span>
                      <button style={{ alignSelf: "center", fontFamily: "inherit", fontSize: 11, letterSpacing: ".12em", padding: "8px 14px", color: "#aeb6cf", background: "transparent", border: "1px solid rgba(124,140,240,.28)", cursor: "pointer" }}>GHOST BTN</button>
                      <button style={{ alignSelf: "center", fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", padding: "8px 16px", color: "#07070c", background: "#ffb347", border: "none", cursor: "pointer" }}>PRIMARY</button>
                      <div style={{ alignSelf: "center", display: "flex", border: "1px solid rgba(124,140,240,.24)" }}>
                        <span style={{ width: 34, height: 34, display: "grid", placeItems: "center", color: "#cbd2ea", borderRight: "1px solid rgba(124,140,240,.18)" }}>+</span>
                        <span style={{ width: 34, height: 34, display: "grid", placeItems: "center", color: "#cbd2ea", borderRight: "1px solid rgba(124,140,240,.18)" }}>{"−"}</span>
                        <span style={{ width: 34, height: 34, display: "grid", placeItems: "center", fontSize: 9, color: "#8891b3" }}>RST</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* intro overlay */}
        {this.state.intro !== "done" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 60 }}>{this.buildIntro()}</div>
        )}
      </div>
    );
  }
}
