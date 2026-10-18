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
  let filmLoaded = false;

  const SEEN_KEY = "kc-entry-seen";
  const markSeen = () => { try { window.sessionStorage.setItem(SEEN_KEY, "1"); } catch {} };
  const hasSeen = () => { try { return window.sessionStorage.getItem(SEEN_KEY) === "1"; } catch { return false; } };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const jump = (top) => {
    const lenis = window.KnowledgeCosmosLenis;
    if (lenis) {
      lenis.stop();
      lenis.scrollTo(top, { immediate: true, force: true });
      window.setTimeout(() => { lenis.resize?.(); lenis.scrollTo(window.scrollY, { immediate: true, force: true }); lenis.start(); }, 520);
    }
    window.scrollTo({ top, behavior: "instant" });
  };

  // Scrubber: scroll sets a target; a rAF loop eases toward it and only issues
  // a new seek once the previous one has painted. Firing currentTime on every
  // scroll event makes Chrome/Safari cancel each seek before it paints, which
  // looks like a frozen film.
  let targetTime = 0;
  let shownTime = 0;
  let scrubFrame = 0;
  function scrubLoop() {
    scrubFrame = 0;
    if (!ready || !duration) return;
    shownTime += (targetTime - shownTime) * 0.16;
    if (Math.abs(targetTime - shownTime) < 0.004) shownTime = targetTime;
    if (!video.seeking && Math.abs(video.currentTime - shownTime) > 0.012) {
      try { video.currentTime = shownTime; } catch {}
    }
    if (shownTime !== targetTime || video.seeking) scrubFrame = window.requestAnimationFrame(scrubLoop);
    else if (wantsComplete) maybeComplete();
  }
  // Enter only after the film has actually painted its last frame, never just
  // because the scroll position reached the end of the runway.
  let wantsComplete = false;
  function filmAtEnd() {
    return !ready || !duration || (!video.seeking && video.currentTime >= duration - 0.12 && shownTime >= duration - 0.12);
  }
  function maybeComplete() {
    if (!wantsComplete || hasCompleted) return;
    if (filmAtEnd()) window.setTimeout(() => { if (wantsComplete && filmAtEnd()) completeEntry(); }, 380);
    else if (!scrubFrame) scrubFrame = window.requestAnimationFrame(scrubLoop);
  }
  function scrubTo(time) {
    targetTime = clamp(time, 0, Math.max(0, duration - 0.04));
    if (!scrubFrame) scrubFrame = window.requestAnimationFrame(scrubLoop);
  }
  function markReady() {
    const value = Number.isFinite(video.duration) ? video.duration : 0;
    if (!value) return;
    duration = value;
    if (ready) return;
    ready = true;
    if (!active) return;
    setProgress(getScrollProgress());
    status.textContent = "入场动效已就绪，向下滚动进入";
  }

  function setProgress(value) {
    const progress = clamp(value, 0, 1);
    if (duration && ready) scrubTo(duration * progress);
    progressBar.style.transform = `scaleX(${progress})`;
    entry.style.setProperty("--entry-progress", progress.toFixed(4));
    const fade = clamp((progress - 0.9) / 0.1, 0, 1) * 0.85;
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
    if (progress >= 0.995) { wantsComplete = true; maybeComplete(); }
    else { wantsComplete = false; if (hasCompleted) restoreEntry(); }
  }

  function requestSync() {
    if (active && !frame) frame = window.requestAnimationFrame(syncFromScroll);
  }

  function completeEntry() {
    if (hasCompleted) return;
    hasCompleted = true;
    entryState = "completed";
    markSeen();
    setProgress(1);
    entry.classList.add("is-complete");
    document.body.classList.add("entry-complete");
    status.textContent = "已进入知识宇宙";
    appShell.removeAttribute("aria-hidden");
    if (curtain) curtain.classList.add("is-visible");
    if (!handoffScheduled) {
      handoffScheduled = true;
      handoffTimer = window.setTimeout(() => {
        jump(entry.offsetTop + entry.offsetHeight);
        releaseTimer = window.setTimeout(() => {
          // Played once: take the film out of the flow so scrolling back up
          // lands on the workbench top instead of replaying the intro.
          dismissEntry();
          jump(0);
          if (curtain) curtain.classList.remove("is-visible");
          const mainContent = document.getElementById("mainContent");
          if (mainContent) mainContent.focus({ preventScroll: true });
        }, 360);
      }, 420);
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
    targetTime = 0; shownTime = 0;
    try { video.currentTime = 0; } catch {}
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
    if (!active || touchStartY === null || !filmLoaded) return;
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

    // Intro plays once per visit (browser tab session); refreshes and
    // in-site navigation go straight to the workbench.
    if (hasSeen()) {
      active = false;
      hasCompleted = true;
      entryState = "completed";
      entry.hidden = true;
      entry.classList.add("is-complete");
      document.body.classList.add("entry-complete");
      appShell.removeAttribute("aria-hidden");
      return;
    }

    // Bypass CSS smooth scrolling so the film starts at the top immediately.
    window.scrollTo({ top: 0, behavior: "instant" });
    appShell.setAttribute("aria-hidden", "true");
    video.pause();
    // The metadata can already be there (cached file) before this deferred
    // script runs, in which case loadedmetadata never fires again.
    ["loadedmetadata", "durationchange", "loadeddata", "canplay"].forEach((name) => video.addEventListener(name, markReady));
    video.addEventListener("seeked", () => { if (!scrubFrame && shownTime !== targetTime) scrubFrame = window.requestAnimationFrame(scrubLoop); });
    if (video.readyState >= 1) markReady();
    // Pull the whole film into memory so every frame is seekable at once,
    // independent of how the host answers range requests. Until it is in,
    // the page is held at the top with a loading meter: the intro only
    // starts once the film can actually follow the scroll.
    const loader = document.createElement("div");
    loader.className = "entry-loader";
    loader.innerHTML = '<span class="entry-loader-ring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17"></circle><circle class="entry-loader-arc" cx="20" cy="20" r="17"></circle></svg></span><span class="entry-loader-text">载入影片 <b>0%</b></span>';
    entry.querySelector(".entry-sticky-stage")?.append(loader);
    const loaderText = loader.querySelector("b");
    const loaderArc = loader.querySelector(".entry-loader-arc");
    const setLoad = (ratio) => {
      const r = clamp(ratio, 0, 1);
      loaderText.textContent = `${Math.round(r * 100)}%`;
      loaderArc.style.strokeDashoffset = String(106.8 * (1 - r));
    };
    const lockScroll = (event) => { if (!filmLoaded && active) { event.preventDefault(); } };
    const lockKeys = (event) => { if (!filmLoaded && active && [" ", "PageDown", "ArrowDown", "End"].includes(event.key)) event.preventDefault(); };
    window.addEventListener("wheel", lockScroll, { passive: false });
    window.addEventListener("touchmove", lockScroll, { passive: false });
    window.addEventListener("keydown", lockKeys);
    entry.classList.add("is-film-loading");
    const releaseFilm = () => {
      if (filmLoaded) return;
      filmLoaded = true;
      setLoad(1);
      entry.classList.remove("is-film-loading");
      entry.classList.add("is-film-ready");
      window.setTimeout(() => loader.remove(), 900);
      window.removeEventListener("wheel", lockScroll);
      window.removeEventListener("touchmove", lockScroll);
      window.removeEventListener("keydown", lockKeys);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    // Never trap anyone: after 15s fall back to streaming playback.
    const loadGuard = window.setTimeout(releaseFilm, 15000);
    try {
      const sources = [...video.querySelectorAll("source")];
      const pick = sources.find((source) => !source.media || window.matchMedia(source.media).matches);
      if (pick && window.fetch && window.URL?.createObjectURL) {
        fetch(pick.src).then(async (response) => {
          if (!response.ok) throw response.status;
          const total = Number(response.headers.get("content-length")) || 0;
          if (!response.body || !total) return response.blob();
          const reader = response.body.getReader();
          const chunks = [];
          let received = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            setLoad(received / total * 0.96);
          }
          return new Blob(chunks, { type: "video/mp4" });
        }).then((blob) => {
          if (!active) return;
          const resume = targetTime;
          ready = false;
          video.src = URL.createObjectURL(blob);
          video.load();
          video.addEventListener("loadeddata", () => {
            try { video.currentTime = resume; } catch {}
            shownTime = resume; markReady(); setProgress(getScrollProgress());
            window.clearTimeout(loadGuard); releaseFilm();
          }, { once: true });
        }).catch(() => { window.clearTimeout(loadGuard); releaseFilm(); });
      } else { window.clearTimeout(loadGuard); releaseFilm(); }
    } catch { window.clearTimeout(loadGuard); releaseFilm(); }
    // iOS/Safari only paints seeked frames after the element has played once.
    const unlock = video.play();
    if (unlock && typeof unlock.then === "function") unlock.then(() => { video.pause(); markReady(); try { video.currentTime = targetTime; } catch {} }).catch(() => {});
    video.addEventListener("error", () => { failEntry(); window.clearTimeout(loadGuard); releaseFilm(); }, { once: true });
    skipButton.addEventListener("click", skipEntry);
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync, { passive: true });
    // Safety net: if a wheel gesture over the film does not move the page
    // (scroll hijacked by an extension, smooth-scroll lib, or a focus trap),
    // advance it ourselves so the intro can never get stuck.
    entry.addEventListener("wheel", (event) => {
      if (!active || hasCompleted || !filmLoaded) return;
      const before = window.scrollY;
      const delta = clamp(event.deltaMode === 1 ? event.deltaY * 32 : event.deltaY, -240, 240);
      window.setTimeout(() => {
        if (active && Math.abs(window.scrollY - before) < 1 && delta > 0) {
          window.scrollTo({ top: before + delta, behavior: "instant" });
          requestSync();
        }
      }, 90);
    }, { passive: true });
    window.addEventListener("keydown", (event) => {
      if (active && !hasCompleted && (event.key === "Enter" || event.key === "Escape")) skipEntry();
    });
    entry.addEventListener("touchstart", handleTouchStart, { passive: true });
    entry.addEventListener("touchmove", handleTouchMove, { passive: true });
  }

  init();
})();
