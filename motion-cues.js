(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stage = document.querySelector("[data-knowledge-stage]");
  const stageNodes = stage ? [...stage.querySelectorAll("[data-stage-node]")] : [];
  let activeIndex = 0;
  let stageTimer = null;
  let pointerFrame = null;

  const setStageNode = (index) => {
    if (!stageNodes.length) return;
    activeIndex = (index + stageNodes.length) % stageNodes.length;
    stageNodes.forEach((node, nodeIndex) => {
      node.classList.toggle("is-active", nodeIndex === activeIndex);
    });
    stage?.style.setProperty("--stage-active", String(activeIndex));
  };

  const stopStageTimer = () => {
    if (!stageTimer) return;
    window.clearInterval(stageTimer);
    stageTimer = null;
  };

  const startStageTimer = () => {
    stopStageTimer();
    if (reduceMotion.matches || !stageNodes.length) return;
    stageTimer = window.setInterval(() => setStageNode(activeIndex + 1), 2400);
  };

  const setPointerPosition = (element, clientX, clientY) => {
    const bounds = element.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    element.style.setProperty("--pointer-x", `${((clientX - bounds.left) / bounds.width) * 100}%`);
    element.style.setProperty("--pointer-y", `${((clientY - bounds.top) / bounds.height) * 100}%`);
  };

  if (stage) {
    setStageNode(0);
    startStageTimer();

    stage.addEventListener("pointermove", (event) => {
      if (reduceMotion.matches) return;
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      pointerFrame = window.requestAnimationFrame(() => setPointerPosition(stage, event.clientX, event.clientY));
    });
    stage.addEventListener("pointerenter", stopStageTimer);
    stage.addEventListener("pointerleave", startStageTimer);
    stageNodes.forEach((node, index) => {
      node.addEventListener("pointerenter", () => setStageNode(index));
      node.addEventListener("focus", () => setStageNode(index));
    });
  }

  document.addEventListener("pointermove", (event) => {
    if (reduceMotion.matches) return;
    const card = event.target.closest(".card, .surface-card");
    if (!card) return;
    if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    pointerFrame = window.requestAnimationFrame(() => setPointerPosition(card, event.clientX, event.clientY));
  });

  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) stopStageTimer();
    else startStageTimer();
  });
})();
