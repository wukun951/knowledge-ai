(function initializeBrandParticleLogo() {
  "use strict";

  const trigger = document.getElementById("brandParticleTrigger");
  const canvas = document.getElementById("brandParticleCanvas");
  const fallbackImage = trigger?.querySelector(".brand-glyph-media");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const smallScreenQuery = window.matchMedia("(max-width: 520px)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  function createSeededRandom(seed) {
    let value = seed >>> 0;
    return function random() {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  const logo = {
    scene: null,
    camera: null,
    renderer: null,
    geometry: null,
    material: null,
    points: null,
    resizeObserver: null,
    animationFrame: null,
    activeAnimation: null,
    entityRevealTimer: null,
    running: false,
    ready: false,
    isAssembled: false,
    contextLost: false,
    startTime: 0,
    lastFrame: 0,
    pointCount: 0,
    state: {
      assembleProgress: 0,
      scatterProgress: 0,
      opacity: 0.22,
    },

    useStaticFallback() {
      if (!trigger) return;
      this.isAssembled = false;
      trigger.classList.remove("is-particle-ready", "is-animating", "is-assembled");
      trigger.setAttribute("aria-busy", "false");
      trigger.setAttribute("aria-disabled", "true");
      trigger.setAttribute("aria-label", "品牌标志");
      trigger.removeAttribute("title");
      trigger.setAttribute("tabindex", "-1");
    },

    useInteractiveLogo() {
      this.isAssembled = false;
      trigger.classList.remove("is-assembled");
      trigger.removeAttribute("aria-disabled");
      trigger.removeAttribute("tabindex");
      trigger.setAttribute("aria-label", "播放品牌粒子动画");
      trigger.setAttribute("title", "播放品牌粒子动画");
      trigger.setAttribute("aria-busy", "false");
      trigger.classList.add("is-particle-ready");
    },

    init() {
      const animeApi = window.anime;
      if (!trigger || !canvas || !fallbackImage) return;
      if (!window.THREE || !animeApi?.animate) {
        this.useStaticFallback();
        return;
      }
      if (motionQuery.matches || smallScreenQuery.matches || connection?.saveData) {
        this.useStaticFallback();
        return;
      }

      if (fallbackImage.complete && fallbackImage.naturalWidth > 0) {
        this.buildFromImage(fallbackImage);
        return;
      }

      this.handleImageLoad = () => this.buildFromImage(fallbackImage);
      fallbackImage.addEventListener("load", this.handleImageLoad, { once: true });
    },

    sampleImage(image) {
      const sampleSize = 120;
      const step = 2;
      const sampleCanvas = document.createElement("canvas");
      const context = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!context) return [];

      sampleCanvas.width = sampleSize;
      sampleCanvas.height = sampleSize;
      context.clearRect(0, 0, sampleSize, sampleSize);

      const imageAspect = image.naturalWidth / image.naturalHeight;
      const drawWidth = imageAspect >= 1 ? sampleSize : sampleSize * imageAspect;
      const drawHeight = imageAspect >= 1 ? sampleSize / imageAspect : sampleSize;
      const drawX = (sampleSize - drawWidth) * 0.5;
      const drawY = (sampleSize - drawHeight) * 0.5;
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      let imageData;
      try {
        imageData = context.getImageData(0, 0, sampleSize, sampleSize);
      } catch (error) {
        console.warn("Particle logo sampling failed; using the image fallback.", error);
        return [];
      }

      const data = imageData.data;
      const readPixel = (x, y) => {
        const safeX = clamp(Math.round(x), 0, sampleSize - 1);
        const safeY = clamp(Math.round(y), 0, sampleSize - 1);
        const offset = (safeX + safeY * sampleSize) * 4;
        return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
      };
      const cornerInset = 2;
      const backgroundSamples = [
        readPixel(drawX + cornerInset, drawY + cornerInset),
        readPixel(drawX + drawWidth - cornerInset, drawY + cornerInset),
        readPixel(drawX + cornerInset, drawY + drawHeight - cornerInset),
        readPixel(drawX + drawWidth - cornerInset, drawY + drawHeight - cornerInset),
      ];
      const transparentBackground = backgroundSamples.find((pixel) => pixel[3] < 64);
      const background = transparentBackground || backgroundSamples.reduce((brightest, pixel) => {
        const brightness = pixel[0] + pixel[1] + pixel[2];
        const brightestValue = brightest[0] + brightest[1] + brightest[2];
        return brightness > brightestValue ? pixel : brightest;
      }, backgroundSamples[0]);
      const hasOpaqueBackground = background[3] > 180;
      const samples = [];
      const minX = Math.max(0, Math.floor(drawX));
      const maxX = Math.min(sampleSize, Math.ceil(drawX + drawWidth));
      const minY = Math.max(0, Math.floor(drawY));
      const maxY = Math.min(sampleSize, Math.ceil(drawY + drawHeight));

      for (let y = minY; y < maxY; y += step) {
        for (let x = minX; x < maxX; x += step) {
          const offset = (x + y * sampleSize) * 4;
          const red = data[offset];
          const green = data[offset + 1];
          const blue = data[offset + 2];
          const alpha = data[offset + 3];
          if (alpha < 32) continue;

          const backgroundDistance = Math.hypot(
            red - background[0],
            green - background[1],
            blue - background[2],
          );
          if (hasOpaqueBackground && backgroundDistance < 72) continue;

          samples.push({
            x: ((x - sampleSize * 0.5) / (sampleSize * 0.5)) * 0.82,
            y: (-(y - sampleSize * 0.5) / (sampleSize * 0.5)) * 0.82,
            tone: clamp(backgroundDistance / 360, 0.25, 1),
          });
        }
      }

      if (samples.length <= 760) return samples;
      return Array.from({ length: 760 }, (_, index) => {
        const sourceIndex = Math.floor((index * samples.length) / 760);
        return samples[sourceIndex];
      });
    },

    buildFromImage(image) {
      if (this.ready) return;
      const samples = this.sampleImage(image);
      if (samples.length < 80) {
        this.useStaticFallback();
        return;
      }

      const random = createSeededRandom(0x4c4f474f);
      const count = samples.length;
      const targets = new Float32Array(count * 3);
      const introScatter = new Float32Array(count * 3);
      const clickScatter = new Float32Array(count * 3);
      const phases = new Float32Array(count);
      const sizes = new Float32Array(count);
      const tones = new Float32Array(count);

      samples.forEach((sample, index) => {
        const offset = index * 3;
        const introAngle = random() * Math.PI * 2;
        const introRadius = 0.55 + random() * 1.25;
        const clickAngle = introAngle + Math.PI * (0.45 + random() * 0.35);
        const clickRadius = 0.62 + random() * 1.1;

        targets[offset] = sample.x;
        targets[offset + 1] = sample.y;
        targets[offset + 2] = (random() - 0.5) * 0.08;
        introScatter[offset] = sample.x * 0.25 + Math.cos(introAngle) * introRadius;
        introScatter[offset + 1] = sample.y * 0.25 + Math.sin(introAngle) * introRadius;
        introScatter[offset + 2] = (random() - 0.5) * 0.8;
        clickScatter[offset] = sample.x * 0.18 + Math.cos(clickAngle) * clickRadius;
        clickScatter[offset + 1] = sample.y * 0.18 + Math.sin(clickAngle) * clickRadius;
        clickScatter[offset + 2] = (random() - 0.5) * 1.1;
        phases[index] = random() * Math.PI * 2;
        sizes[index] = 0.82 + random() * 0.86;
        tones[index] = sample.tone;
      });

      try {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera.position.z = 2;
        this.renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: true,
        });
        this.renderer.setClearColor(0x000000, 0);

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute("position", new THREE.BufferAttribute(targets, 3));
        this.geometry.setAttribute("aIntroScatter", new THREE.BufferAttribute(introScatter, 3));
        this.geometry.setAttribute("aClickScatter", new THREE.BufferAttribute(clickScatter, 3));
        this.geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
        this.geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute("aTone", new THREE.BufferAttribute(tones, 1));

        this.material = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          depthTest: false,
          blending: THREE.NormalBlending,
          uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: 1 },
            uAssemble: { value: 0 },
            uScatter: { value: 0 },
            uOpacity: { value: this.state.opacity },
          },
          vertexShader: `
            uniform float uTime;
            uniform float uPixelRatio;
            uniform float uAssemble;
            uniform float uScatter;

            attribute vec3 aIntroScatter;
            attribute vec3 aClickScatter;
            attribute float aPhase;
            attribute float aSize;
            attribute float aTone;

            varying float vTone;
            varying float vAlpha;

            void main() {
              vec3 assembledPoint = mix(aIntroScatter, position, uAssemble);
              vec3 point = mix(assembledPoint, aClickScatter, uScatter);
              float idleStrength = smoothstep(0.92, 1.0, uAssemble) * (1.0 - uScatter);
              float breath = sin(uTime * 1.1) * 0.018;
              float radialWave = sin(uTime * 1.42 - length(position.xy) * 6.0 + aPhase * 0.12);
              vec2 radialDirection = normalize(position.xy + vec2(0.001));
              point.xy *= 1.0 + breath * idleStrength;
              point.xy += radialDirection * radialWave * 0.007 * idleStrength;
              point.x += sin(uTime * 1.2 + aPhase) * 0.010 * idleStrength;
              point.y += cos(uTime * 1.0 + aPhase * 1.17) * 0.008 * idleStrength;

              vTone = aTone;
              float globalPulse = 0.90 + 0.10 * (0.5 + 0.5 * sin(uTime * 1.1));
              float localPulse = 0.92 + 0.08 * (0.5 + 0.5 * sin(uTime * 1.45 + aPhase * 0.55));
              vAlpha = mix(0.96, globalPulse * localPulse, idleStrength);
              float idleSize = idleStrength * (0.12 + sin(uTime * 1.1 + aPhase * 0.22) * 0.08);
              gl_PointSize = aSize * uPixelRatio * (1.0 + uScatter * 0.32 + idleSize);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
            }
          `,
          fragmentShader: `
            uniform float uOpacity;
            varying float vTone;
            varying float vAlpha;

            void main() {
              float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
              float particle = 1.0 - smoothstep(0.16, 0.50, distanceToCenter);
              if (particle < 0.01) discard;
              vec3 charcoal = vec3(0.035, 0.055, 0.047);
              vec3 knowledgeGreen = vec3(0.13, 0.42, 0.32);
              vec3 color = mix(charcoal, knowledgeGreen, vTone * 0.28);
              gl_FragColor = vec4(color, particle * vAlpha * uOpacity);
            }
          `,
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.points.frustumCulled = false;
        this.scene.add(this.points);
        this.pointCount = count;
        this.bindEvents();
        this.handleResize();
        this.ready = true;
        this.useInteractiveLogo();
        this.start();
        this.playIntro();
      } catch (error) {
        console.warn("Particle logo disabled; using the image fallback.", error);
        this.destroy();
        this.useStaticFallback();
      }
    },

    bindEvents() {
      this.handleClick = () => this.playScatter();
      this.handleVisibility = () => {
        if (document.hidden) this.stop();
        else this.start();
      };
      this.handleContextLost = (event) => {
        event.preventDefault();
        this.contextLost = true;
        this.stop();
        this.useStaticFallback();
      };
      this.handleContextRestored = () => {
        this.contextLost = false;
        this.useInteractiveLogo();
        this.handleResize();
        this.start();
      };
      this.handlePageHide = () => this.destroy();

      trigger.addEventListener("click", this.handleClick);
      document.addEventListener("visibilitychange", this.handleVisibility);
      canvas.addEventListener("webglcontextlost", this.handleContextLost, false);
      canvas.addEventListener("webglcontextrestored", this.handleContextRestored, false);
      window.addEventListener("pagehide", this.handlePageHide, { once: true });
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(trigger);
    },

    handleResize() {
      if (!this.renderer || !this.camera || !this.material) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const aspect = width / height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      this.camera.left = -aspect;
      this.camera.right = aspect;
      this.camera.top = 1;
      this.camera.bottom = -1;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.setSize(width, height, false);
      this.material.uniforms.uPixelRatio.value = pixelRatio;
    },

    playIntro() {
      this.cancelActiveAnimation();
      this.isAssembled = false;
      trigger.classList.remove("is-assembled");
      this.state.assembleProgress = 0;
      this.state.scatterProgress = 0;
      this.state.opacity = 0.22;
      trigger.classList.add("is-animating");
      this.scheduleEntityReveal(1260);
      this.activeAnimation = window.anime.animate(this.state, {
        assembleProgress: 1,
        opacity: 1,
        duration: 1500,
        ease: "out(4)",
        onComplete: () => {
          this.activeAnimation = null;
          this.finishAssembly();
        },
      });
    },

    playScatter() {
      if (!this.ready) return;
      this.cancelActiveAnimation();
      this.isAssembled = false;
      trigger.classList.remove("is-assembled");
      this.start();
      this.state.assembleProgress = 1;
      this.state.scatterProgress = 0;
      this.state.opacity = 1;
      trigger.classList.add("is-animating");
      this.activeAnimation = window.anime.animate(this.state, {
        scatterProgress: 1,
        opacity: 0.72,
        duration: 540,
        ease: "out(4)",
        onComplete: () => {
          this.scheduleEntityReveal(680);
          this.activeAnimation = window.anime.animate(this.state, {
            scatterProgress: 0,
            opacity: 1,
            duration: 920,
            ease: "inOut(3)",
            onComplete: () => {
              this.activeAnimation = null;
              this.finishAssembly();
            },
          });
        },
      });
    },

    scheduleEntityReveal(delay) {
      if (this.entityRevealTimer) window.clearTimeout(this.entityRevealTimer);
      this.entityRevealTimer = window.setTimeout(() => {
        this.entityRevealTimer = null;
        trigger.classList.add("is-assembled");
      }, delay);
    },

    finishAssembly() {
      if (this.entityRevealTimer) window.clearTimeout(this.entityRevealTimer);
      this.entityRevealTimer = null;
      this.isAssembled = true;
      trigger.classList.add("is-assembled");
      trigger.classList.remove("is-animating");
      this.stop();
    },

    cancelActiveAnimation() {
      this.activeAnimation?.cancel?.();
      this.activeAnimation = null;
      if (this.entityRevealTimer) window.clearTimeout(this.entityRevealTimer);
      this.entityRevealTimer = null;
    },

    start() {
      if (this.running || this.isAssembled || !this.renderer || this.contextLost || document.hidden) return;
      this.running = true;
      const now = performance.now();
      if (!this.startTime) this.startTime = now;
      this.lastFrame = now - 16;
      this.animationFrame = window.requestAnimationFrame((time) => this.animate(time));
    },

    stop() {
      this.running = false;
      if (this.animationFrame) window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    },

    animate(now) {
      if (!this.running) return;
      this.animationFrame = window.requestAnimationFrame((time) => this.animate(time));
      if (now - this.lastFrame < 16) return;
      this.lastFrame = now;
      this.renderFrame((now - this.startTime) * 0.001);
    },

    renderFrame(time) {
      if (!this.renderer || !this.scene || !this.camera || !this.material || this.contextLost) return;
      this.material.uniforms.uTime.value = time;
      this.material.uniforms.uAssemble.value = this.state.assembleProgress;
      this.material.uniforms.uScatter.value = this.state.scatterProgress;
      this.material.uniforms.uOpacity.value = this.state.opacity;
      this.renderer.render(this.scene, this.camera);
    },

    destroy() {
      this.cancelActiveAnimation();
      this.stop();
      trigger?.removeEventListener("click", this.handleClick);
      document.removeEventListener("visibilitychange", this.handleVisibility);
      fallbackImage?.removeEventListener("load", this.handleImageLoad);
      canvas?.removeEventListener("webglcontextlost", this.handleContextLost);
      canvas?.removeEventListener("webglcontextrestored", this.handleContextRestored);
      window.removeEventListener("pagehide", this.handlePageHide);
      this.resizeObserver?.disconnect();
      if (this.points && this.scene) this.scene.remove(this.points);
      this.geometry?.dispose();
      this.material?.dispose();
      this.renderer?.dispose();
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.geometry = null;
      this.material = null;
      this.points = null;
      this.ready = false;
      this.isAssembled = false;
      trigger?.classList.remove("is-particle-ready", "is-animating", "is-assembled");
    },
  };

  function syncEnvironmentFallback() {
    const shouldUseFallback = motionQuery.matches || smallScreenQuery.matches || connection?.saveData;
    if (shouldUseFallback) {
      if (logo.renderer || logo.ready) logo.destroy();
      logo.useStaticFallback();
      return;
    }
    if (!logo.renderer && !logo.ready) logo.init();
  }

  motionQuery.addEventListener("change", syncEnvironmentFallback);
  smallScreenQuery.addEventListener("change", syncEnvironmentFallback);

  window.BrandParticleLogo = logo;
  logo.init();
})();
