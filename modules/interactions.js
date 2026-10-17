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
          "[data-lenis-prevent], .detail-panel, .side-panel, .panel, [role='dialog'], .mode-tabs, .leaderboard-tabs, textarea, pre, .markdown-body",
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

  if (reduce) return;

  /* 2. Card tilt + spotlight */
  const TILT = ".card, .workflow-card, .task-entry, .brief-pick, .lab-card, .surface-card";
  let tiltTarget = null;
  let tiltFrame = 0;
  let lastEvent = null;
  function applyTilt() {
    tiltFrame = 0;
    if (!tiltTarget || !lastEvent) return;
    const rect = tiltTarget.getBoundingClientRect();
    const x = (lastEvent.clientX - rect.left) / rect.width;
    const y = (lastEvent.clientY - rect.top) / rect.height;
    tiltTarget.style.setProperty("--rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
    tiltTarget.style.setProperty("--ry", `${((x - 0.5) * 6).toFixed(2)}deg`);
    tiltTarget.style.setProperty("--pointer-x", `${(x * 100).toFixed(1)}%`);
    tiltTarget.style.setProperty("--pointer-y", `${(y * 100).toFixed(1)}%`);
  }
  function resetTilt(element) {
    if (!element) return;
    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
  }
  if (finePointer) {
    document.addEventListener("pointermove", (event) => {
      const target = event.target.closest?.(TILT) || null;
      if (target !== tiltTarget) { resetTilt(tiltTarget); tiltTarget = target; }
      if (!tiltTarget) return;
      lastEvent = event;
      if (!tiltFrame) tiltFrame = window.requestAnimationFrame(applyTilt);
    }, { passive: true });
    document.addEventListener("pointerleave", () => { resetTilt(tiltTarget); tiltTarget = null; });
  }

  /* 3. Magnetic buttons */
  const MAGNET = ".brief-cta b, .load-more-button, .secondary-button, .leaderboard-view-tab, .brief-guide-link, .topbar-actions .icon-button, .topbar-actions .icon-text-button, .header-search-toggle";
  if (finePointer) {
    document.addEventListener("pointermove", (event) => {
      const el = event.target.closest?.(MAGNET);
      document.querySelectorAll(".is-magnet").forEach((node) => {
        if (node !== el) { node.classList.remove("is-magnet"); node.style.removeProperty("--mx"); node.style.removeProperty("--my"); }
      });
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.classList.add("is-magnet");
      el.style.setProperty("--mx", `${((event.clientX - rect.left - rect.width / 2) * 0.22).toFixed(1)}px`);
      el.style.setProperty("--my", `${((event.clientY - rect.top - rect.height / 2) * 0.3).toFixed(1)}px`);
    }, { passive: true });
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

  const start = () => { setupNavIndicator(); watchBoards(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  root.classList.add("has-interactions");
})();
