(function initializeOrganicBackground() {
  "use strict";

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compactQuery = window.matchMedia("(max-width: 840px)");
  const staticQuery = window.matchMedia("(max-width: 520px)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const body = document.body;
  const SURFACE_ACCENTS = {
    home: 0x2f7a60,
    knowledge: 0x2f7a60,
    models: 0x5665a8,
    agents: 0x2f7187,
    prompts: 0xa65b4f,
    aitools: 0x727a35,
    lab: 0x795f9b,
  };

  function getQualityProfile() {
    if (compactQuery.matches) {
      return {
        name: "compact",
        particleCount: 620,
        maxPixelRatio: 1,
        frameInterval: 1000 / 24,
        canvasOpacity: 0.48,
      };
    }

    return {
      name: window.innerWidth >= 1440 ? "large" : "standard",
      particleCount: window.innerWidth >= 1440 ? 1400 : 1120,
      maxPixelRatio: 1.35,
      frameInterval: 1000 / 30,
      canvasOpacity: 0.56,
    };
  }

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

  function getCurrentSurface() {
    const surface = window.location.hash.slice(1).split("?")[0];
    return Object.hasOwn(SURFACE_ACCENTS, surface) ? surface : "home";
  }

  const background = {
    scene: null,
    camera: null,
    renderer: null,
    points: null,
    geometry: null,
    material: null,
    animationId: null,
    lastFrame: 0,
    startTime: 0,
    running: false,
    contextLost: false,
    initialized: false,
    currentSurface: "home",
    accentColor: null,
    targetAccentColor: null,
    sectionEnergy: 0,
    pointer: { x: 0, y: 0, strength: 0 },
    targetPointer: { x: 0, y: 0, strength: 0 },
    config: getQualityProfile(),

    useFallback(reason) {
      body.classList.remove("organic-bg-ready", "organic-bg-context-lost");
      body.classList.add("organic-bg-fallback");
      body.dataset.organicBackground = reason;
    },

    init() {
      if (this.initialized || this.renderer) return;

      if (!window.THREE) {
        this.useFallback("three-unavailable");
        return;
      }

      if (motionQuery.matches) {
        this.useFallback("reduced-motion");
        return;
      }

      if (connection?.saveData) {
        this.useFallback("save-data");
        return;
      }

      if (staticQuery.matches) {
        this.useFallback("small-screen");
        return;
      }

      this.config = getQualityProfile();

      try {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera.position.z = 2;
        this.renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: true,
        });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.domElement.className = "organic-background";
        this.renderer.domElement.setAttribute("aria-hidden", "true");
        this.renderer.domElement.style.setProperty("--organic-bg-opacity", this.config.canvasOpacity);
        document.body.prepend(this.renderer.domElement);

        this.createKnowledgeField();
        this.handleResize();
        this.bindEvents();
        this.initialized = true;
        this.renderFrame(0);
        this.start();
      } catch (error) {
        console.warn("Knowledge field disabled; using the static background.", error);
        this.destroy({ keepFallback: true, reason: "webgl-unavailable" });
      }
    },

    createKnowledgeField() {
      const count = this.config.particleCount;
      const random = createSeededRandom(0x4b495357);
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const phases = new Float32Array(count);
      const sizes = new Float32Array(count);
      const alphas = new Float32Array(count);
      const palette = [
        [0.12, 0.38, 0.28],
        [0.24, 0.46, 0.37],
        [0.30, 0.43, 0.57],
        [0.38, 0.39, 0.61],
        [0.55, 0.34, 0.30],
        [0.48, 0.55, 0.50],
      ];

      for (let index = 0; index < count; index += 1) {
        const positionOffset = index * 3;
        const colorOffset = index * 3;
        const color = palette[Math.floor(random() * palette.length)];
        const bandBias = random();

        positions[positionOffset] = random() * 2.34 - 1.17;
        positions[positionOffset + 1] = bandBias < 0.28
          ? (random() - 0.5) * 0.42 + (random() > 0.5 ? 0.5 : -0.5)
          : random() * 2.16 - 1.08;
        positions[positionOffset + 2] = random() * 0.36 - 0.18;

        colors[colorOffset] = color[0];
        colors[colorOffset + 1] = color[1];
        colors[colorOffset + 2] = color[2];
        phases[index] = random() * Math.PI * 2;
        sizes[index] = 1.75 + Math.pow(random(), 2) * 3.5;
        alphas[index] = 0.14 + random() * 0.30;
      }

      this.geometry = new THREE.BufferGeometry();
      this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      this.geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
      this.geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      this.geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));

      this.material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        blending: THREE.NormalBlending,
        uniforms: {
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uPixelRatio: { value: 1 },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uPointerStrength: { value: 0 },
          uAccent: { value: new THREE.Color(SURFACE_ACCENTS.home) },
          uSectionEnergy: { value: 0 },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uAspect;
          uniform float uPixelRatio;
          uniform vec2 uPointer;
          uniform float uPointerStrength;
          uniform vec3 uAccent;
          uniform float uSectionEnergy;

          attribute float aPhase;
          attribute float aSize;
          attribute float aAlpha;

          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            vec3 point = position;
            point.x *= uAspect * 1.08;
            point.x += sin(uTime * 0.14 + aPhase * 1.63) * 0.018;
            point.y += cos(uTime * 0.17 + aPhase) * 0.014;
            point.z += sin(uTime * 0.11 + aPhase * 0.71) * 0.025;

            vec2 pointerPosition = vec2(uPointer.x * uAspect, uPointer.y);
            vec2 pointerDelta = point.xy - pointerPosition;
            float pointerDistance = length(pointerDelta);
            float pointerInfluence = (1.0 - smoothstep(0.0, 0.42, pointerDistance)) * uPointerStrength;
            point.xy += normalize(pointerDelta + vec2(0.0001)) * pointerInfluence * 0.05;

            float breathing = 0.88 + sin(uTime * 0.31 + aPhase) * 0.12;
            float sectionPulse = uSectionEnergy * (0.5 + 0.5 * sin(length(point.xy) * 9.0 - uTime * 7.0));
            vColor = mix(color, uAccent, 0.40 + uSectionEnergy * 0.18);
            vAlpha = aAlpha * breathing + pointerInfluence * 0.18 + sectionPulse * 0.10;

            gl_PointSize = aSize * uPixelRatio * (1.0 + pointerInfluence * 0.5 + sectionPulse * 0.32);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
            float core = 1.0 - smoothstep(0.10, 0.46, distanceToCenter);
            float halo = 1.0 - smoothstep(0.20, 0.50, distanceToCenter);
            float alpha = (core * 0.72 + halo * 0.28) * vAlpha;
            if (alpha < 0.008) discard;
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
      });

      this.points = new THREE.Points(this.geometry, this.material);
      this.points.frustumCulled = false;
      this.scene.add(this.points);
      this.accentColor = new THREE.Color(SURFACE_ACCENTS.home);
      this.targetAccentColor = new THREE.Color(SURFACE_ACCENTS.home);
      this.updateSectionAccent({ instant: true });
    },

    updateSectionAccent(options = {}) {
      if (!this.material || !this.accentColor || !this.targetAccentColor) return;
      const { instant = false } = options;
      const nextSurface = getCurrentSurface();
      this.currentSurface = nextSurface;
      this.targetAccentColor.setHex(SURFACE_ACCENTS[nextSurface]);
      body.dataset.motionSurface = nextSurface;

      if (instant) {
        this.accentColor.copy(this.targetAccentColor);
        this.sectionEnergy = 0;
        this.material.uniforms.uAccent.value.copy(this.accentColor);
        this.material.uniforms.uSectionEnergy.value = 0;
        return;
      }

      this.sectionEnergy = 1;
    },

    bindEvents() {
      this.handlePointerMove = (event) => {
        if (event.pointerType === "touch") return;
        this.targetPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.targetPointer.strength = 1;
      };
      this.handlePointerLeave = () => {
        this.targetPointer.strength = 0;
      };
      this.handleResizeBound = () => this.handleResize();
      this.handleHashChange = () => this.updateSectionAccent();
      this.handleVisibility = () => {
        if (document.hidden) this.stop();
        else this.start();
      };
      this.handleMotionChange = (event) => {
        if (event.matches) this.destroy({ keepFallback: true, reason: "reduced-motion" });
      };
      this.handleContextLost = (event) => {
        event.preventDefault();
        this.contextLost = true;
        this.stop();
        body.classList.add("organic-bg-context-lost", "organic-bg-fallback");
        body.classList.remove("organic-bg-ready");
        body.dataset.organicBackground = "context-lost";
      };
      this.handleContextRestored = () => {
        this.contextLost = false;
        body.classList.remove("organic-bg-context-lost", "organic-bg-fallback");
        body.classList.add("organic-bg-ready");
        body.dataset.organicBackground = this.config.name;
        this.handleResize();
        this.start();
      };
      this.handlePageHide = () => this.destroy();

      document.addEventListener("pointermove", this.handlePointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", this.handlePointerLeave, { passive: true });
      window.addEventListener("resize", this.handleResizeBound, { passive: true });
      window.addEventListener("hashchange", this.handleHashChange);
      document.addEventListener("visibilitychange", this.handleVisibility);
      motionQuery.addEventListener("change", this.handleMotionChange);
      this.renderer.domElement.addEventListener("webglcontextlost", this.handleContextLost, false);
      this.renderer.domElement.addEventListener("webglcontextrestored", this.handleContextRestored, false);
      window.addEventListener("pagehide", this.handlePageHide, { once: true });
    },

    handleResize() {
      if (!this.camera || !this.renderer || !this.material) return;
      const width = Math.max(window.innerWidth, 1);
      const height = Math.max(window.innerHeight, 1);
      const aspect = width / height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, this.config.maxPixelRatio);

      this.camera.left = -aspect;
      this.camera.right = aspect;
      this.camera.top = 1;
      this.camera.bottom = -1;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.setSize(width, height, false);
      this.material.uniforms.uAspect.value = aspect;
      this.material.uniforms.uPixelRatio.value = pixelRatio;
    },

    start() {
      if (this.running || !this.renderer || this.contextLost || document.hidden) return;
      this.running = true;
      const now = performance.now();
      if (!this.startTime) this.startTime = now;
      this.lastFrame = now - this.config.frameInterval;
      body.classList.remove("organic-bg-fallback", "organic-bg-context-lost");
      body.classList.add("organic-bg-ready");
      body.dataset.organicBackground = this.config.name;
      this.animationId = window.requestAnimationFrame((time) => this.animate(time));
    },

    stop() {
      this.running = false;
      if (this.animationId) window.cancelAnimationFrame(this.animationId);
      this.animationId = null;
    },

    animate(now) {
      if (!this.running) return;
      this.animationId = window.requestAnimationFrame((time) => this.animate(time));
      if (now - this.lastFrame < this.config.frameInterval) return;
      this.lastFrame = now;
      this.pointer.x += (this.targetPointer.x - this.pointer.x) * 0.08;
      this.pointer.y += (this.targetPointer.y - this.pointer.y) * 0.08;
      this.pointer.strength += (this.targetPointer.strength - this.pointer.strength) * 0.07;
      this.accentColor.lerp(this.targetAccentColor, 0.12);
      this.sectionEnergy += (0 - this.sectionEnergy) * 0.16;
      this.renderFrame((now - this.startTime) * 0.001);
    },

    renderFrame(time) {
      if (!this.renderer || !this.scene || !this.camera || !this.material || this.contextLost) return;
      this.material.uniforms.uTime.value = time;
      this.material.uniforms.uPointer.value.set(this.pointer.x, this.pointer.y);
      this.material.uniforms.uPointerStrength.value = this.pointer.strength;
      this.material.uniforms.uAccent.value.copy(this.accentColor);
      this.material.uniforms.uSectionEnergy.value = this.sectionEnergy;
      this.renderer.render(this.scene, this.camera);
    },

    destroy(options = {}) {
      const { keepFallback = false, reason = "destroyed" } = options;
      this.stop();

      document.removeEventListener("pointermove", this.handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", this.handlePointerLeave);
      window.removeEventListener("resize", this.handleResizeBound);
      window.removeEventListener("hashchange", this.handleHashChange);
      document.removeEventListener("visibilitychange", this.handleVisibility);
      motionQuery.removeEventListener("change", this.handleMotionChange);
      window.removeEventListener("pagehide", this.handlePageHide);

      if (this.renderer?.domElement) {
        this.renderer.domElement.removeEventListener("webglcontextlost", this.handleContextLost);
        this.renderer.domElement.removeEventListener("webglcontextrestored", this.handleContextRestored);
      }

      if (this.points && this.scene) this.scene.remove(this.points);
      this.geometry?.dispose();
      this.material?.dispose();
      this.renderer?.dispose();
      this.renderer?.domElement.remove();

      this.points = null;
      this.geometry = null;
      this.material = null;
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.accentColor = null;
      this.targetAccentColor = null;
      this.initialized = false;

      if (keepFallback) this.useFallback(reason);
      else {
        body.classList.remove("organic-bg-ready", "organic-bg-context-lost");
        delete body.dataset.organicBackground;
        delete body.dataset.motionSurface;
      }
    },
  };

  function syncEnvironmentFallback() {
    const fallbackReason = motionQuery.matches
      ? "reduced-motion"
      : staticQuery.matches
        ? "small-screen"
        : connection?.saveData
          ? "save-data"
          : "";
    if (fallbackReason) {
      if (background.renderer || background.initialized) {
        background.destroy({ keepFallback: true, reason: fallbackReason });
      } else {
        background.useFallback(fallbackReason);
      }
      return;
    }
    if (!background.renderer && !background.initialized) background.init();
  }

  staticQuery.addEventListener("change", syncEnvironmentFallback);
  motionQuery.addEventListener("change", syncEnvironmentFallback);

  window.OrganicBackground = background;
  background.init();
})();
