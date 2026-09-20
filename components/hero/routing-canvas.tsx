"use client";

import { useEffect, useRef } from "react";

import { poissonDisc, seededRandom, type Point } from "@/lib/poisson";

type Node = Point & {
  /** Rest position — nodes lerp back to this after a cursor nudge. */
  hx: number;
  hy: number;
  r: number;
  /** 1 → 0 envelope, set to 1 on packet arrival. */
  pulse: number;
};

type Edge = { a: number; b: number; len: number };
type Packet = { edge: number; t: number; speed: number; dir: 1 | -1 };

const PINK = "242, 107, 164";
const LINE = "52, 49, 61";
const CURSOR_RADIUS = 140;
const NUDGE = 4;
const LERP = 0.08;

/**
 * The hero graph, alive: packets traversing a routing topology.
 *
 * It takes the same shape as the static `NodeGraph` it fades in over —
 * neutral edges and nodes, pink only for a packet in flight and the node it
 * arrives at. Budget is 4ms/frame; node count is the dial to turn, not
 * render quality.
 */
export function RoutingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let packets: Packet[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let spawnAccumulator = 0;
    let running = false;

    const cursor = { x: -9999, y: -9999, active: false };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = width < 768;
      const target = mobile ? 8 : 13;
      const minDist = width * (mobile ? 0.24 : 0.19);

      const rng = seededRandom(0x5e7);
      const points = poissonDisc(width, height, minDist, target, rng);

      nodes = points.map((p) => ({
        x: p.x,
        y: p.y,
        hx: p.x,
        hy: p.y,
        r: 2.4 + rng() * 1.4,
        pulse: 0,
      }));

      // Connect each node to its 2–3 nearest neighbours, deduped.
      const seen = new Set<string>();
      edges = [];
      nodes.forEach((node, i) => {
        const neighbours = nodes
          .map((other, j) => ({
            j,
            d: Math.hypot(other.x - node.x, other.y - node.y),
          }))
          .filter((n) => n.j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, 2 + Math.floor(rng() * 2));

        for (const n of neighbours) {
          const key = i < n.j ? i + "-" + n.j : n.j + "-" + i;
          if (seen.has(key)) continue;
          seen.add(key);
          edges.push({ a: i, b: n.j, len: n.d });
        }
      });

      packets = [];
    };

    const spawnPacket = () => {
      if (edges.length === 0) return;
      const edge = Math.floor(Math.random() * edges.length);
      const e = edges[edge];
      if (!e) return;
      packets.push({
        edge,
        t: 0,
        // Normalised by edge length, so packets hold a constant pixel speed.
        speed: (110 + Math.random() * 70) / Math.max(e.len, 1),
        dir: Math.random() < 0.5 ? 1 : -1,
      });
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, width, height);

      // Cursor attraction — nodes lean toward the pointer, then settle back.
      for (const node of nodes) {
        let tx = node.hx;
        let ty = node.hy;
        if (cursor.active) {
          const dx = cursor.x - node.hx;
          const dy = cursor.y - node.hy;
          const dist = Math.hypot(dx, dy);
          if (dist < CURSOR_RADIUS && dist > 0.001) {
            const pull = (1 - dist / CURSOR_RADIUS) * NUDGE;
            tx += (dx / dist) * pull;
            ty += (dy / dist) * pull;
          }
        }
        node.x += (tx - node.x) * LERP;
        node.y += (ty - node.y) * LERP;
        if (node.pulse > 0) node.pulse = Math.max(0, node.pulse - dt / 0.5);
      }

      // Edges.
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(" + LINE + ", 0.85)";
      ctx.beginPath();
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        if (!a || !b) continue;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();

      // Arrival pulses.
      for (const node of nodes) {
        if (node.pulse <= 0) continue;
        const p = 1 - node.pulse;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + node.r * 3 * p, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(" + PINK + ", " + 0.45 * node.pulse + ")";
        ctx.stroke();
      }

      // Nodes.
      for (const node of nodes) {
        const near =
          cursor.active &&
          Math.hypot(cursor.x - node.x, cursor.y - node.y) < CURSOR_RADIUS;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = near
          ? "rgba(" + PINK + ", 0.95)"
          : "rgba(" + LINE + ", 1)";
        ctx.fill();
      }

      // Packets, each with a short trailing gradient.
      for (const packet of packets) {
        const e = edges[packet.edge];
        if (!e) continue;
        const a = nodes[e.a];
        const b = nodes[e.b];
        if (!a || !b) continue;

        const from = packet.dir === 1 ? a : b;
        const to = packet.dir === 1 ? b : a;
        const x = from.x + (to.x - from.x) * packet.t;
        const y = from.y + (to.y - from.y) * packet.t;

        const trail = Math.max(0, packet.t - 14 / Math.max(e.len, 1));
        const tx = from.x + (to.x - from.x) * trail;
        const ty = from.y + (to.y - from.y) * trail;

        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, "rgba(" + PINK + ", 0)");
        grad.addColorStop(1, "rgba(" + PINK + ", 0.95)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };

    const frame = (now: number) => {
      // Delta-time driven, so 60/90/120Hz all look identical. Clamped to
      // absorb the first frame and any tab-restore spike.
      const dt = last === 0 ? 0.016 : Math.min((now - last) / 1000, 0.05);
      last = now;

      const mobile = width < 768;
      spawnAccumulator += dt;
      const interval = mobile ? 0.36 : 0.18;
      while (spawnAccumulator >= interval) {
        spawnAccumulator -= interval;
        spawnPacket();
      }

      for (let i = packets.length - 1; i >= 0; i--) {
        const packet = packets[i];
        if (!packet) continue;
        packet.t += packet.speed * dt;
        if (packet.t >= 1) {
          const e = edges[packet.edge];
          const dest = e ? nodes[packet.dir === 1 ? e.b : e.a] : undefined;
          if (dest) dest.pulse = 1;
          packets.splice(i, 1);
        }
      }

      draw(dt);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursor.x = e.clientX - rect.left;
      cursor.y = e.clientY - rect.top;
      cursor.active = true;
    };
    const onPointerLeave = () => {
      cursor.active = false;
    };

    build();

    if (reduceMotion) {
      // One static frame. Still a topology, zero motion.
      draw(0);
    } else {
      start();
      if (!window.matchMedia("(pointer: coarse)").matches) {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerleave", onPointerLeave);
      }
    }

    // Offscreen means no frames. This section scrolls away early.
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!reduceMotion) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        if (reduceMotion) draw(0);
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      style={{
        maskImage:
          "radial-gradient(85% 75% at 62% 45%, #000 35%, transparent 82%)",
        WebkitMaskImage:
          "radial-gradient(85% 75% at 62% 45%, #000 35%, transparent 82%)",
      }}
    />
  );
}
