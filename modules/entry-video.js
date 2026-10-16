(function () {
  "use strict";

  const entry = document.getElementById("entryExperience");
  const video = document.getElementById("entryVideo");
  const skipButton = document.getElementById("entrySkip");
  const progressBar = document.getElementById("entryProgressBar");
  const scrollHint = document.getElementById("entryScrollHint");
  const status = document.getElementById("entryStatus");
  const appShell = document.querySelector(".app-shell");
  const blackout = entry?.querySelector(".entry-blackout");
  const curtain = document.getElementById("entryCurtain");

  if (!entry || !video || !skipButton || !appShell) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let duration = 0;
  let frame = 0;
  let active = true;
  let ready = false;
  let entryState = "idle";
  let touchStartY = null;
  let hasCompleted = false;
  let handoffScheduled = false;
  let handoffTimer = 0;
  let releaseTimer = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function setProgress(value) {
    const progress = clamp(value, 0, 1);
    if (duration && ready) video.currentTime = duration * progress;
    progressBar.style.transform = `scaleX(${progress})`;
    entry.style.setProperty("--entry-progress", progress.toFixed(4));
    const fade = clamp((progress - 0.78) / 0.22, 0, 1);
    entry.style.setProperty("--entry-fade", fade.toFixed(4));
    if (blackout) blackout.style.opacity = String(fade);
    if (progress > 0.02) scrollHint.classList.add("is-hidden");
  }

  function getScrollProgress() {
    const range = Math.max(1, entry.offsetHeight - window.innerHeight);
    return clamp(window.scrollY / range, 0, 1);
  }

  function syncFromScroll() {
    frame = 0;
    if (!active) return;
    const progress = getScrollProgress();
    setProgress(progress);
    if (progress >= 0.995) completeEntry();
    else if (hasCompleted) restoreEntry();
  }

  function requestSync() {
    if (active && !frame) frame = window.requestAnimationFrame(syncFromScroll);
  }

  function completeEntry() {
    if (hasCompleted) return;
    hasCompleted = true;
    entryState = "completed";
    setProgress(1);
    entry.classList.add("is-complete");
    document.body.classList.add("entry-complete");
    status.textContent = "已进入知识宇宙";
    appShell.removeAttribute("aria-hidden");
    if (curtain) curtain.classList.add("is-visible");
    if (!handoffScheduled) {
      handoffScheduled = true;
      handoffTimer = window.setTimeout(() => {
        window.scrollTo({ top: entry.offsetTop + entry.offsetHeight, behavior: "auto" });
        releaseTimer = window.setTimeout(() => {
          if (curtain) curtain.classList.remove("is-visible");
          const mainContent = document.getElementById("mainContent");
          if (mainContent) mainContent.focus({ preventScroll: true });
        }, 360);
      }, 140);
    }
  }

  function restoreEntry() {
    window.clearTimeout(handoffTimer);
    window.clearTimeout(releaseTimer);
    hasCompleted = false;
    entryState = "idle";
    handoffScheduled = false;
    entry.classList.remove("is-complete");
    document.body.classList.remove("entry-complete");
    appShell.setAttribute("aria-hidden", "true");
    if (curtain) curtain.classList.remove("is-visible");
    status.textContent = "入场动效播放中";
  }

  function skipEntry() {
    completeEntry();
    window.scrollTo({ top: entry.offsetTop + entry.offsetHeight - window.innerHeight, behavior: "smooth" });
  }

  function failEntry() {
    entry.classList.add("is-fallback");
    status.textContent = "视频加载失败，可直接进入知识宇宙";
    skipButton.textContent = "进入知识宇宙";
    scrollHint.textContent = "视频不可用";
    progressBar.style.transform = "scaleX(0)";
  }

  // Once the user starts navigating the workbench, remove the completed film
  // from the document flow so route changes cannot scroll back into it.
  // The guard is explicit: an in-progress or not-yet-started film must never be
  // dismissed by a route change, otherwise a deep link can swallow the intro.
  // `force` is reserved for explicit user navigation: clicking a nav item or a
  // surface target should leave the film, while automatic route restoration
  // must never dismiss a film that has not finished playing.
  function dismissEntry({ force = false } = {}) {
    const mayDismiss = entryState === "completed" || (force && entryState !== "skipped");
    if (!mayDismiss) return false;
    // Hidden entry dimensions must never drive scrolling inside the workbench.
    active = false;
    window.cancelAnimationFrame(frame);
    frame = 0;
    window.clearTimeout(handoffTimer);
    window.clearTimeout(releaseTimer);
    hasCompleted = true;
    entryState = "completed";
    document.body.classList.add("entry-complete");
    entry.classList.add("is-complete");
    setProgress(1);
    entry.hidden = true;
    if (curtain) curtain.classList.remove("is-visible");
    appShell.removeAttribute("aria-hidden");
    return true;
  }

  function replayEntry() {
    if (entryState === "idle") return false;
    window.clearTimeout(handoffTimer);
    window.clearTimeout(releaseTimer);
    active = true;
    entry.hidden = false;
    document.body.classList.remove("entry-complete");
    appShell.setAttribute("aria-hidden", "true");
    entryState = "idle";
    hasCompleted = false;
    handoffScheduled = false;
    window.scrollTo({ top: 0, behavior: "auto" });
    video.currentTime = 0;
    setProgress(0);
    status.textContent = "入场动效播放中";
    return true;
  }

  window.KnowledgeCosmosEntry = {
    dismiss: dismissEntry,
    replay: replayEntry,
    getState: () => entryState,
  };

  function handleTouchStart(event) {
    touchStartY = event.touches[0]?.clientY ?? null;
  }

  function handleTouchMove(event) {
    if (!active || touchStartY === null) return;
    const currentY = event.touches[0]?.clientY ?? touchStartY;
    const delta = touchStartY - currentY;
    const range = Math.max(1, entry.offsetHeight - window.innerHeight);
    setProgress(getScrollProgress() + delta / range);
    touchStartY = currentY;
  }

  function init() {
    // The film is scrubbed by the user's own scroll, never autoplayed, so it
    // stays on even when the OS asks for reduced motion (macOS/Windows setting
    // "reduce motion" previously skipped the intro entirely).
    if (prefersReducedMotion) entry.classList.add("is-reduced-motion");

    // Bypass CSS smooth scrolling so the film starts at the top immediately.
    window.scrollTo({ top: 0, behavior: "instant" });
    appShell.setAttribute("aria-hidden", "true");
    video.pause();
    video.addEventListener("loadedmetadata", () => {
      duration = Number.isFinite(video.duration) ? video.duration : 0;
      ready = duration > 0;
      if (!active) return;
      setProgress(getScrollProgress());
      status.textContent = "入场动效已就绪，向下滚动进入";
    }, { once: true });
    video.addEventListener("error", failEntry, { once: true });
    skipButton.addEventListener("click", skipEntry);
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync, { passive: true });
    entry.addEventListener("touchstart", handleTouchStart, { passive: true });
    entry.addEventListener("touchmove", handleTouchMove, { passive: true });
  }

  init();
})();
