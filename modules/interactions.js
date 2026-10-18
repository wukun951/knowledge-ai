/* 知识宇宙 · interaction layer (2026-10-17)
   Smooth inertial scroll (Lenis, MIT), card tilt + spotlight, magnetic buttons,
   sliding nav indicator, score count-up. Desktop pointer only; respects reduced motion. */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;

  /* 1. Smooth scroll */
  let lenis = null;
  if (!reduce && finePointer && typeof window.Lenis === "function") {
    try {
      lenis = new window.Lenis({
        lerp: 0.11,
        wheelMultiplier: 0.9,
        smoothWheel: true,
        prevent: (node) => Boolean(node.closest && node.closest(
          "#entryExperience, [data-lenis-prevent], .detail-panel, .side-panel, .panel, [role='dialog'], .mode-tabs, .leaderboard-tabs, textarea, pre, .markdown-body",
        )),
      });
      const raf = (time) => { lenis.raf(time); window.requestAnimationFrame(raf); };
      window.requestAnimationFrame(raf);
      window.KnowledgeCosmosLenis = lenis;
      // Panels and dialogs lock page scroll: pause inertia while they are open.
      const syncLock = () => {
        const locked = document.body.classList.contains("panel-open") || document.body.style.overflow === "hidden";
        if (locked) lenis.stop(); else lenis.start();
      };
      new MutationObserver(syncLock).observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });
    } catch (error) {
      console.warn("Smooth scroll disabled", error);
    }
  }

  if (reduce) {
    const lite = () => setupSidebarHandle();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", lite); else lite();
    return;
  }

  /* 2. Spring engine: every hover / press / magnet motion runs through one
     critically-damped spring loop instead of CSS transitions, so motion keeps
     its velocity when the pointer changes direction (no snapping, no stiffness). */
  const springs = new Map();
  let springFrame = 0;
  const STIFF = 170, DAMP = 22; // tuned to settle in ~380ms without overshoot wobble
  function spring(el) {
    let st = springs.get(el);
    if (!st) {
      st = { v: { rx: 0, ry: 0, lift: 0, s: 1, tx: 0, ty: 0 }, vel: { rx: 0, ry: 0, lift: 0, s: 0, tx: 0, ty: 0 }, t: { rx: 0, ry: 0, lift: 0, s: 1, tx: 0, ty: 0 }, kind: "card" };
      springs.set(el, st);
    }
    return st;
  }
  let lastTime = 0;
  function stepSprings(now) {
    springFrame = 0;
    const dt = Math.min(0.032, Math.max(0.001, ((now - (lastTime || now)) / 1000) || 0.016));
    lastTime = now;
    let moving = false;
    springs.forEach((st, el) => {
      let rest = true;
      for (const key in st.v) {
        const force = (st.t[key] - st.v[key]) * STIFF - st.vel[key] * DAMP;
        st.vel[key] += force * dt;
        st.v[key] += st.vel[key] * dt;
        if (Math.abs(st.t[key] - st.v[key]) > 0.002 || Math.abs(st.vel[key]) > 0.002) rest = false;
        else { st.v[key] = st.t[key]; st.vel[key] = 0; }
      }
      const { rx, ry, lift, s, tx, ty } = st.v;
      el.classList.add("is-springing");
      const value = st.kind === "magnet"
        ? `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(4)})`
        : `perspective(1000px) translate3d(0, ${(-lift).toFixed(2)}px, 0) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(${s.toFixed(4)})`;
      el.style.setProperty("transform", value, "important");
      if (rest && !st.hover) { springs.delete(el); el.classList.remove("is-springing"); el.style.removeProperty("transform"); }
      else moving = true;
    });
    if (moving) springFrame = window.requestAnimationFrame(stepSprings);
    else lastTime = 0;
  }
  const kick = () => { if (!springFrame) springFrame = window.requestAnimationFrame(stepSprings); };

  const TILT = ".card, .workflow-card, .task-entry, .brief-pick, .lab-card, .surface-card";
  const MAGNET = ".brief-cta b, .load-more-button, .secondary-button, .leaderboard-view-tab, .brief-guide-link, .topbar-actions .icon-button, .topbar-actions .icon-text-button, .header-search-toggle, .sidebar-edge-toggle, .entry-skip";
  let tiltTarget = null;
  let magnetTarget = null;
  function release(el) {
    const st = springs.get(el);
    if (!st) return;
    st.hover = false;
    Object.assign(st.t, { rx: 0, ry: 0, lift: 0, s: 1, tx: 0, ty: 0 });
    kick();
  }
  if (finePointer) {
    document.addEventListener("pointermove", (event) => {
      const card = event.target.closest?.(TILT) || null;
      if (card !== tiltTarget) { release(tiltTarget); tiltTarget = card; }
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const st = spring(card);
        st.kind = "card"; st.hover = true;
        card.classList.add("is-springing");
        // Bigger cards tilt less: keeps large panels calm, small chips lively.
        const k = Math.min(1, 320 / Math.max(rect.width, 1));
        st.t.rx = (0.5 - y) * 4.2 * k;
        st.t.ry = (x - 0.5) * 5.2 * k;
        st.t.lift = 5;
        card.style.setProperty("--pointer-x", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--pointer-y", `${(y * 100).toFixed(1)}%`);
        kick();
      }
      const mag = event.target.closest?.(MAGNET) || null;
      if (mag !== magnetTarget) { release(magnetTarget); magnetTarget = mag; }
      if (mag) {
        const rect = mag.getBoundingClientRect();
        const st = spring(mag);
        st.kind = "magnet"; st.hover = true;
        st.t.tx = (event.clientX - rect.left - rect.width / 2) * 0.2;
        st.t.ty = (event.clientY - rect.top - rect.height / 2) * 0.28;
        kick();
      }
    }, { passive: true });
    document.addEventListener("pointerdown", (event) => {
      const el = event.target.closest?.(`${TILT}, ${MAGNET}`);
      if (!el) return;
      const st = spring(el);
      st.t.s = 0.975; st.t.lift = Math.min(st.t.lift, 2);
      kick();
    }, { passive: true });
    const up = () => {
      springs.forEach((st) => { if (st.t.s !== 1) { st.t.s = 1; if (st.hover && st.kind === "card") st.t.lift = 5; } });
      kick();
    };
    document.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointercancel", up, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { release(tiltTarget); release(magnetTarget); tiltTarget = magnetTarget = null; });
  }

  /* 3. Staggered entrance for freshly rendered cards (filters, tabs, load more). */
  const ENTER = ".card, .workflow-card, .lab-card, .brief-pick, .surface-card";
  function enter(nodes) {
    let i = 0;
    nodes.forEach((node) => {
      if (!(node instanceof HTMLElement) || !node.matches(ENTER) || node.dataset.entered) return;
      node.dataset.entered = "1";
      const rect = node.getBoundingClientRect();
      if (rect.top > window.innerHeight * 1.2) return; // off-screen: no animation cost
      node.style.setProperty("--enter-delay", `${Math.min(i, 14) * 32}ms`);
      node.classList.add("kc-enter");
      node.addEventListener("animationend", () => node.classList.remove("kc-enter"), { once: true });
      i += 1;
    });
  }
  function watchGrids() {
    const mo = new MutationObserver((records) => {
      const added = [];
      records.forEach((r) => r.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.matches?.(ENTER)) added.push(n);
        else n.querySelectorAll?.(ENTER).forEach((c) => added.push(c));
      }));
      if (added.length) window.requestAnimationFrame(() => enter(added));
    });
    const main = document.getElementById("mainContent");
    if (main) mo.observe(main, { childList: true, subtree: true });
  }

  /* 3b. Sidebar: always-visible edge handle + Ctrl/⌘ + \ shortcut. */
  function setupSidebarHandle() {
    const nav = document.querySelector(".sidenav");
    const original = document.getElementById("sidebarToggle");
    if (!nav || !original) return;
    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "sidebar-edge-toggle";
    handle.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5L5.5 8l4.5 4.5"></path></svg>';
    const sync = () => {
      const collapsed = document.body.classList.contains("sidebar-collapsed");
      const label = collapsed ? "展开侧边栏（Ctrl/⌘ + \\）" : "收起侧边栏（Ctrl/⌘ + \\）";
      handle.setAttribute("aria-label", label);
      handle.title = label;
      handle.setAttribute("aria-expanded", String(!collapsed));
    };
    handle.addEventListener("click", (event) => { event.preventDefault(); original.click(); });
    (document.querySelector(".app-shell") || document.body).append(handle);
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    sync();
    window.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "\\") { event.preventDefault(); original.click(); }
    });
  }

  /* 4. Sliding nav indicator */
  function setupNavIndicator() {
    const nav = document.querySelector(".sidenav");
    const list = nav?.querySelector(".nav-item")?.parentElement;
    if (!list) return;
    list.classList.add("has-nav-indicator");
    const indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    list.prepend(indicator);
    const move = (instant) => {
      const active = list.querySelector(".nav-item.active");
      if (!active) { indicator.style.opacity = "0"; return; }
      if (instant) indicator.style.transition = "none";
      indicator.style.opacity = "1";
      indicator.style.transform = `translateY(${active.offsetTop}px)`;
      indicator.style.height = `${active.offsetHeight}px`;
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.left = `${active.offsetLeft}px`;
      if (instant) { void indicator.offsetWidth; indicator.style.transition = ""; }
    };
    new MutationObserver(() => move(false)).observe(list, { subtree: true, attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", () => move(true));
    document.body.addEventListener("transitionend", (event) => { if (event.target.classList?.contains("sidenav")) move(true); });
    move(true);
  }

  /* 5. Count-up for leaderboard scores */
  function countUp(container) {
    container.querySelectorAll(".brief-score b, .leaderboard-home-score b").forEach((node, index) => {
      if (node.dataset.counted) return;
      const text = node.textContent.trim();
      const target = Number(text.replace(/,/g, ""));
      if (!Number.isFinite(target) || target <= 0) return;
      node.dataset.counted = "1";
      const decimals = (text.split(".")[1] || "").length;
      const start = performance.now() + index * 35;
      const from = target * 0.82;
      const step = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / 820));
        const eased = 1 - Math.pow(1 - t, 4);
        node.textContent = (from + (target - from) * eased).toFixed(decimals);
        if (t < 1) window.requestAnimationFrame(step); else node.textContent = text;
      };
      window.requestAnimationFrame(step);
    });
  }
  function watchBoards() {
    ["modelRankBoard", "homeLeaderboardBoard"].forEach((id) => {
      const board = document.getElementById(id);
      if (!board) return;
      new MutationObserver(() => countUp(board)).observe(board, { childList: true });
      countUp(board);
    });
  }

  const start = () => { setupNavIndicator(); watchBoards(); watchGrids(); setupSidebarHandle(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  root.classList.add("has-interactions");
})();
