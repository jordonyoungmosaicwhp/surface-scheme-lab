const LIGHT_NEUTRAL_SCALE = [
  { index: 0, hex: "#FDFDFD" },
  { index: 1, hex: "#F8F8F8" },
  { index: 2, hex: "#F1F1F1" },
  { index: 3, hex: "#EBEBEB" },
  { index: 4, hex: "#E4E4E4" },
  { index: 5, hex: "#D9D9D9" },
];

const DARK_NEUTRAL_SCALE = [
  { index: 0, hex: "#080808" },
  { index: 1, hex: "#0F0F0F" },
  { index: 2, hex: "#141414" },
  { index: 3, hex: "#1A1A1A" },
  { index: 4, hex: "#212121" },
  { index: 5, hex: "#292929" },
  { index: 6, hex: "#373737" },
];

const SCALES = {
  light: LIGHT_NEUTRAL_SCALE,
  dark: DARK_NEUTRAL_SCALE,
};

const BADGE_INTENTIONS = [
  { id: "neutral", label: "Neutral" },
  { id: "brand", label: "Brand" },
  { id: "information", label: "Information" },
  { id: "success", label: "Success" },
  { id: "error", label: "Error" },
];

const INTENSITIES = [
  { id: "faint", label: "Faint" },
  { id: "subtle", label: "Subtle" },
  { id: "prominent", label: "Prominent" },
];

const INTENTION_COLOR_MODELS = {
  neutral: { hue: 255, chroma: 0.012 },
  brand: { hue: 255, chroma: 0.11 },
  information: { hue: 235, chroma: 0.1 },
  success: { hue: 148, chroma: 0.1 },
  error: { hue: 24, chroma: 0.11 },
};

const INTENSITY_CHROMA_MULTIPLIERS = {
  faint: 0.22,
  subtle: 0.45,
  prominent: 0.92,
};

const MODE_FILL_MODELS = {
  light: {
    lightness: {
      faint: 95,
      subtle: 89,
      prominent: 62,
    },
    ink: {
      dark: "oklch(21% 0 0)",
      darkSoft: "oklch(28% 0 0)",
      light: "oklch(99% 0 0)",
    },
  },
  darkA: {
    lightness: {
      faint: 25,
      subtle: 32,
      prominent: 72,
    },
    ink: {
      dark: "oklch(12% 0 0)",
      darkSoft: "oklch(18% 0 0)",
      light: "oklch(96% 0 0)",
    },
  },
  darkB: {
    lightness: {
      faint: 27,
      subtle: 35,
      prominent: 76,
    },
    ink: {
      dark: "oklch(11% 0 0)",
      darkSoft: "oklch(17% 0 0)",
      light: "oklch(97% 0 0)",
    },
  },
};

const DEFAULT_COPY = {
  bg: {
    title: "Default background",
    copy: "This is the base surface. It stays closest to the page and does not jump immediately to the strongest card level.",
  },
  "1": {
    title: "Subtle section",
    copy: "This first step is still very close to the background. It is a quiet container, not a primary card.",
  },
  "2": {
    title: "Early separation",
    copy: "This is the first clear card step. It should feel distinct without becoming the most assertive layer.",
  },
  "3": {
    title: "Stronger separation",
    copy: "A more pronounced step for denser groups or content that needs firmer containment.",
  },
  "4": {
    title: "Highest default example",
    copy: "The strongest example in the default ladder. Useful for pressure-testing how far the progression can go.",
  },
};

const OFFSET_COPY = {
  bg: {
    title: "Offset background",
    copy: "Offset starts from its own background rather than inheriting the default page baseline.",
  },
  "1": {
    title: "Preferred primary card",
    copy: "This is the farthest usable level from the offset background. Offset jumps here first instead of climbing gradually.",
  },
  "2": {
    title: "Subdued companion",
    copy: "This secondary step works back toward the offset background while staying distinct from it.",
  },
};

const MODES = {
  light: {
    id: "light",
    label: "Light",
    summary:
      "Light mode keeps default on the brightest baseline and compresses offset into a dedicated field at light 2.",
    defaultNote:
      "Default starts at light 0 and builds upward gradually through light 1, 2, 3, and 4.",
    offsetNote:
      "Offset starts at light 2, jumps to light 0 for its preferred primary card, then steps back to light 1 for a quieter companion level.",
    surfaces: {
      default: {
        bg: { scale: "light", index: 0 },
        "1": { scale: "light", index: 1 },
        "2": { scale: "light", index: 2 },
        "3": { scale: "light", index: 3 },
        "4": { scale: "light", index: 4 },
      },
      offset: {
        bg: { scale: "light", index: 2 },
        "1": { scale: "light", index: 0 },
        "2": { scale: "light", index: 1 },
      },
    },
  },
  darkA: {
    id: "darkA",
    label: "Dark A",
    summary:
      "Dark A keeps default at dark 0, raises offset to dark 1, and uses dark 3 as the preferred offset primary card level.",
    defaultNote:
      "Default begins at dark 0 and builds upward gradually through dark 1, 2, 3, and 4.",
    offsetNote:
      "Offset sits slightly above the default baseline at dark 1, then jumps to dark 3 for its primary card and works back to dark 2 for the subdued step.",
    surfaces: {
      default: {
        bg: { scale: "dark", index: 0 },
        "1": { scale: "dark", index: 1 },
        "2": { scale: "dark", index: 2 },
        "3": { scale: "dark", index: 3 },
        "4": { scale: "dark", index: 4 },
      },
      offset: {
        bg: { scale: "dark", index: 1 },
        "1": { scale: "dark", index: 3 },
        "2": { scale: "dark", index: 2 },
      },
    },
  },
  darkB: {
    id: "darkB",
    label: "Dark B",
    summary:
      "Dark B makes offset the lowest field at dark 0 while default begins one step above it at dark 1 and still climbs progressively.",
    defaultNote:
      "Default begins at dark 1 and builds upward gradually through dark 2, 3, 4, and 5.",
    offsetNote:
      "Offset becomes the lowest baseline at dark 0. Its primary card jumps to dark 2 and its quieter companion steps back to dark 1.",
    surfaces: {
      default: {
        bg: { scale: "dark", index: 1 },
        "1": { scale: "dark", index: 2 },
        "2": { scale: "dark", index: 3 },
        "3": { scale: "dark", index: 4 },
        "4": { scale: "dark", index: 5 },
      },
      offset: {
        bg: { scale: "dark", index: 0 },
        "1": { scale: "dark", index: 2 },
        "2": { scale: "dark", index: 1 },
      },
    },
  },
};

const app = document.querySelector("#app");

const state = readStateFromUrl();
state.fillLightness = cloneFillLightness();
state.scrub = null;

app.addEventListener("click", (event) => {
  const modeButton = event.target.closest("[data-mode-button]");

  if (modeButton) {
    const nextMode = modeButton.dataset.modeButton;

    if (MODES[nextMode]) {
      state.mode = nextMode;
      render();
    }

    return;
  }

  const toggleButton = event.target.closest("[data-toggle-button]");

  if (toggleButton) {
    const key = toggleButton.dataset.toggleButton;

    if (Object.hasOwn(state, key)) {
      state[key] = !state[key];
      render();
    }
  }
});

app.addEventListener("input", (event) => {
  const field = event.target.closest("[data-lightness-input]");

  if (!field) {
    return;
  }

  const intensityId = field.dataset.lightnessInput;
  updateFillLightness(intensityId, field.value);
});

app.addEventListener("change", (event) => {
  const field = event.target.closest("[data-lightness-input]");

  if (!field) {
    return;
  }

  const intensityId = field.dataset.lightnessInput;
  updateFillLightness(intensityId, field.value);
});

app.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest("[data-scrub-handle]");

  if (!handle) {
    return;
  }

  event.preventDefault();

  const intensityId = handle.dataset.scrubHandle;

  state.scrub = {
    intensityId,
    pointerId: event.pointerId,
    startX: event.clientX,
    startValue: state.fillLightness[state.mode][intensityId],
  };

  handle.setPointerCapture?.(event.pointerId);
  document.body.style.userSelect = "none";
});

window.addEventListener("pointermove", (event) => {
  if (!state.scrub || event.pointerId !== state.scrub.pointerId) {
    return;
  }

  const delta = event.clientX - state.scrub.startX;
  const nextValue = state.scrub.startValue + delta * 0.15;

  updateFillLightness(state.scrub.intensityId, nextValue, { shouldRender: true });
});

window.addEventListener("pointerup", releaseScrub);
window.addEventListener("pointercancel", releaseScrub);

window.addEventListener("popstate", () => {
  Object.assign(state, readStateFromUrl());
  render();
});

function cloneFillLightness() {
  return Object.fromEntries(
    Object.entries(MODE_FILL_MODELS).map(([modeId, config]) => [
      modeId,
      { ...config.lightness },
    ]),
  );
}

function clampLightnessValue(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.min(99, Math.max(0, Math.round(numeric * 10) / 10));
}

function releaseScrub(event) {
  if (!state.scrub || (event && event.pointerId !== undefined && event.pointerId !== state.scrub.pointerId)) {
    return;
  }

  state.scrub = null;
  document.body.style.userSelect = "";
}

function updateFillLightness(intensityId, rawValue, { shouldRender = true } = {}) {
  if (!Object.hasOwn(state.fillLightness[state.mode], intensityId)) {
    return;
  }

  state.fillLightness[state.mode][intensityId] = clampLightnessValue(rawValue);

  if (shouldRender) {
    render();
  }
}

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);

  return {
    mode: MODES[params.get("mode")] ? params.get("mode") : "light",
    showTokenLabels: parseBooleanParam(params.get("labels"), true),
    showRawScaleValues: parseBooleanParam(params.get("raw"), false),
    stressMode: parseBooleanParam(params.get("stress"), false),
  };
}

function parseBooleanParam(value, fallback) {
  if (value === null) {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(value)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(value)) {
    return false;
  }

  return fallback;
}

function syncUrl() {
  const url = new URL(window.location.href);

  url.searchParams.set("mode", state.mode);
  url.searchParams.set("labels", state.showTokenLabels ? "1" : "0");
  url.searchParams.set("raw", state.showRawScaleValues ? "1" : "0");
  url.searchParams.set("stress", state.stressMode ? "1" : "0");

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function getScaleEntry(scaleId, index) {
  return SCALES[scaleId].find((entry) => entry.index === index);
}

function getSurfaceReference(modeId, contextId, roleId) {
  const reference = MODES[modeId].surfaces[contextId][roleId];
  const scaleEntry = getScaleEntry(reference.scale, reference.index);

  return {
    contextId,
    roleId,
    label: `${contextId}/${roleId}`,
    scale: reference.scale,
    index: reference.index,
    hex: scaleEntry.hex,
  };
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function getReadableInk(hex) {
  const { r, g, b } = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 145 ? "#151515" : "#F7F7F7";
}

function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatOklch(lightness, chroma, hue) {
  return `oklch(${lightness}% ${Number(chroma).toFixed(3)} ${hue})`;
}

function getBadgeFillToken(modeId, intentionId, intensityId) {
  const model = INTENTION_COLOR_MODELS[intentionId];
  const lightness = state.fillLightness[modeId][intensityId];
  const chroma = model.chroma * INTENSITY_CHROMA_MULTIPLIERS[intensityId];

  return formatOklch(lightness, chroma, model.hue);
}

function getBadgeInkToken(modeId, intentionId, intensityId) {
  const palette = MODE_FILL_MODELS[modeId].ink;

  if (modeId === "light") {
    if (intensityId === "prominent") {
      return intentionId === "neutral" ? palette.dark : palette.light;
    }

    return intentionId === "neutral" ? palette.darkSoft : palette.dark;
  }

  if (intensityId === "prominent") {
    return intentionId === "neutral" ? palette.light : palette.dark;
  }

  return palette.light;
}

function buildModeFills(modeId) {
  return Object.fromEntries(
    BADGE_INTENTIONS.map((intention) => [
      intention.id,
      Object.fromEntries(
        INTENSITIES.map((intensity) => [
          intensity.id,
          {
            fill: getBadgeFillToken(modeId, intention.id, intensity.id),
            ink: getBadgeInkToken(modeId, intention.id, intensity.id),
          },
        ]),
      ),
    ]),
  );
}

function applyModeVariables(modeId) {
  const root = document.documentElement;
  const pageBackground = getSurfaceReference(modeId, "default", "bg").hex;
  const pageInk = getReadableInk(pageBackground);
  const panelFill = getSurfaceReference(modeId, "default", "1").hex;
  const panelFillStrong = getSurfaceReference(modeId, "default", "2").hex;
  const panelInk = getReadableInk(panelFill);
  const panelInkStrong = getReadableInk(panelFillStrong);
  const fills = buildModeFills(modeId);

  root.style.setProperty("--page-bg", pageBackground);
  root.style.setProperty("--page-ink", pageInk);
  root.style.setProperty("--page-ink-muted", hexToRgba(pageInk, 0.72));
  root.style.setProperty("--panel-fill", panelFill);
  root.style.setProperty("--panel-fill-strong", panelFillStrong);
  root.style.setProperty("--panel-ink", panelInkStrong);
  root.style.setProperty("--panel-ink-muted", hexToRgba(panelInk, 0.72));
  root.dataset.mode = modeId;
  root.style.colorScheme = modeId === "light" ? "light" : "dark";

  Object.entries(fills).forEach(([intentionId, intensities]) => {
    Object.entries(intensities).forEach(([intensityId, token]) => {
      root.style.setProperty(`--fill-${intentionId}-${intensityId}`, token.fill);
      root.style.setProperty(`--on-fill-${intentionId}-${intensityId}`, token.ink);
    });
  });
}

function renderModeButtons() {
  return Object.values(MODES)
    .map(
      (mode) => `
        <button
          class="control-button ${state.mode === mode.id ? "is-active" : ""}"
          type="button"
          data-mode-button="${mode.id}"
          aria-pressed="${String(state.mode === mode.id)}"
        >
          <span>${mode.label}</span>
        </button>
      `,
    )
    .join("");
}

function renderToggleButton(key, label) {
  return `
    <button
      class="control-button ${state[key] ? "is-active" : ""}"
      type="button"
      data-toggle-button="${key}"
      aria-pressed="${String(state[key])}"
    >
      <span>${label}</span>
      <span class="control-button__value">${state[key] ? "On" : "Off"}</span>
    </button>
  `;
}

function renderLightnessInputs(modeId) {
  return `
    <div class="control-cluster control-cluster--numeric" role="group" aria-label="Badge lightness controls">
      ${INTENSITIES.map((intensity) => {
        const value = state.fillLightness[modeId][intensity.id];

        return `
          <label class="scrub-field">
            <span class="scrub-label" data-scrub-handle="${intensity.id}" title="Drag horizontally to scrub">
              ${intensity.label}
            </span>
            <span class="scrub-input-wrap">
              <input
                class="scrub-input"
                type="number"
                min="0"
                max="99"
                step="0.5"
                value="${value}"
                data-lightness-input="${intensity.id}"
                aria-label="${intensity.label} lightness"
              />
              <span class="scrub-unit">L</span>
            </span>
          </label>
        `;
      }).join("")}
    </div>
  `;
}

function renderSurfaceMeta(modeId, contextId, roleId, options = {}) {
  const surface = getSurfaceReference(modeId, contextId, roleId);
  const parts = [];

  if (state.showTokenLabels || options.forceTokenLabel) {
    parts.push(`<p class="surface-tag">${surface.label}</p>`);
  }

  if (state.showRawScaleValues || options.forceRaw) {
    parts.push(`<p class="scale-meta">${surface.scale} ${surface.index} · ${surface.hex}</p>`);
  }

  if (!parts.length) {
    return "";
  }

  return `<div class="surface-meta ${options.compact ? "surface-meta--compact" : ""}">${parts.join("")}</div>`;
}

function renderBadge(intentionId, intensityId, text) {
  return `
    <span
      class="badge"
      style="background: var(--fill-${intentionId}-${intensityId}); color: var(--on-fill-${intentionId}-${intensityId});"
    >
      ${text}
    </span>
  `;
}

function renderDefaultComposition(modeId) {
  const background = getSurfaceReference(modeId, "default", "bg");
  const subtleBand = getSurfaceReference(modeId, "default", "1");
  const backgroundInk = getReadableInk(background.hex);
  const bandInk = getReadableInk(subtleBand.hex);

  return `
    <section class="surface-stage" style="background: ${background.hex}; color: ${backgroundInk};">
      ${renderSurfaceMeta(modeId, "default", "bg")}
      <p class="context-note">${MODES[modeId].defaultNote}</p>
      <div class="surface-band" style="background: ${subtleBand.hex}; color: ${bandInk};">
        ${renderSurfaceMeta(modeId, "default", "1")}
        <p class="panel-copy">${DEFAULT_COPY["1"].copy}</p>
        <div class="surface-grid surface-grid--default">
          ${["2", "3", "4"]
            .map((roleId) => renderSurfacePanel(modeId, "default", roleId, DEFAULT_COPY[roleId]))
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderOffsetComposition(modeId) {
  const background = getSurfaceReference(modeId, "offset", "bg");
  const backgroundInk = getReadableInk(background.hex);

  return `
    <section class="surface-stage" style="background: ${background.hex}; color: ${backgroundInk};">
      ${renderSurfaceMeta(modeId, "offset", "bg")}
      <p class="context-note">${MODES[modeId].offsetNote}</p>
      <div class="surface-grid surface-grid--offset">
        ${["2", "1"]
          .map((roleId) =>
            renderSurfacePanel(modeId, "offset", roleId, OFFSET_COPY[roleId], roleId === "1"),
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderSurfacePanel(modeId, contextId, roleId, copy, isPrimary = false) {
  const surface = getSurfaceReference(modeId, contextId, roleId);
  const ink = getReadableInk(surface.hex);

  return `
    <article
      class="surface-panel ${isPrimary ? "surface-panel--primary" : ""}"
      style="background: ${surface.hex}; color: ${ink};"
    >
      ${renderSurfaceMeta(modeId, contextId, roleId)}
      <h3>${copy.title}</h3>
      <p class="panel-copy">${copy.copy}</p>
    </article>
  `;
}

function getHostsForContext(contextId) {
  if (contextId === "default") {
    return state.stressMode ? ["bg", "1", "2", "3", "4"] : ["bg", "1", "2"];
  }

  return ["bg", "1", "2"];
}

function renderBadgeStudy(modeId, contextId) {
  return state.stressMode
    ? renderStressMatrix(modeId, contextId, getHostsForContext(contextId))
    : renderHostGrid(modeId, contextId, getHostsForContext(contextId));
}

function renderHostGrid(modeId, contextId, hostRoles) {
  return `
    <div class="host-grid">
      ${hostRoles.map((roleId) => renderHostSurface(modeId, contextId, roleId)).join("")}
    </div>
  `;
}

function renderHostSurface(modeId, contextId, roleId) {
  const surface = getSurfaceReference(modeId, contextId, roleId);
  const ink = getReadableInk(surface.hex);

  return `
    <article class="host-surface" style="background: ${surface.hex}; color: ${ink};">
      ${renderSurfaceMeta(modeId, contextId, roleId)}
      <div class="badge-rows">
        ${BADGE_INTENTIONS.map(
          (intention) => `
            <div class="badge-row">
              <p class="row-label">${intention.label}</p>
              <div class="badge-list">
                ${INTENSITIES.map((intensity) =>
                  renderBadge(intention.id, intensity.id, intensity.label),
                ).join("")}
              </div>
            </div>
          `,
        ).join("")}
      </div>
    </article>
  `;
}

function renderStressMatrix(modeId, contextId, hostRoles) {
  const gridTemplate = `minmax(10rem, 11rem) repeat(${hostRoles.length}, minmax(8rem, 1fr))`;

  return `
    <div class="matrix-scroll">
      <div class="matrix-grid" style="grid-template-columns: ${gridTemplate};">
        <div class="matrix-corner">
          <p class="matrix-label">Badge fill / host</p>
          <p class="scale-meta">All intensities on every active surface</p>
        </div>
        ${hostRoles
          .map((roleId) => {
            const surface = getSurfaceReference(modeId, contextId, roleId);

            return `
              <div class="matrix-header" style="background: ${surface.hex}; color: ${getReadableInk(surface.hex)};">
                ${renderSurfaceMeta(modeId, contextId, roleId, { forceTokenLabel: true, compact: true })}
              </div>
            `;
          })
          .join("")}
        ${BADGE_INTENTIONS.flatMap((intention) =>
          INTENSITIES.map(
            (intensity) => `
              <div class="matrix-row-head">
                <p class="surface-tag">${intention.label}</p>
                <p class="scale-meta">${intensity.label}</p>
              </div>
              ${hostRoles
                .map((roleId) => {
                  const surface = getSurfaceReference(modeId, contextId, roleId);

                  return `
                    <div class="matrix-cell" style="background: ${surface.hex}; color: ${getReadableInk(surface.hex)};">
                      ${renderBadge(intention.id, intensity.id, "Badge")}
                    </div>
                  `;
                })
                .join("")}
            `,
          ),
        ).join("")}
      </div>
    </div>
  `;
}

function renderContextSection(modeId, contextId) {
  const isDefault = contextId === "default";

  return `
    <section class="context-section">
      <div class="context-header">
        <p class="eyebrow">${isDefault ? "Default context" : "Offset context"}</p>
        <h2>${isDefault ? "Default uses a gradual ladder." : "Offset uses a compressed preferred-card pattern."}</h2>
        <p class="section-copy">${isDefault ? MODES[modeId].defaultNote : MODES[modeId].offsetNote}</p>
      </div>
      ${isDefault ? renderDefaultComposition(modeId) : renderOffsetComposition(modeId)}
      <div class="study-note">
        <p class="surface-tag">Badge fill study</p>
        <p class="matrix-note">
          ${state.stressMode
            ? "Stress mode shows every badge intensity on every active hosting surface with explicit row and column labels."
            : "Normal mode focuses on the core hosting surfaces so faint, subtle, and prominent behavior is easier to scan."}
        </p>
      </div>
      ${renderBadgeStudy(modeId, contextId)}
    </section>
  `;
}

function render() {
  const mode = MODES[state.mode];

  applyModeVariables(mode.id);
  syncUrl();

  app.innerHTML = `
    <div class="app-shell">
      <header class="sticky-shell">
        <div class="masthead">
          <div class="masthead__copy">
            <a class="back-link" href="../">Hub</a>
            <p class="eyebrow">One-page comparison prototype</p>
            <h1>Default vs Offset Fill Study</h1>
            <p class="masthead__summary">Evaluate solid badge fills on progressive default surfaces versus compressed offset surfaces.</p>
          </div>
          <div class="mode-summary">
            <p class="surface-tag">${mode.label}</p>
            <p>${mode.summary}</p>
          </div>
        </div>
      </header>

      <div class="controls-row controls-row--sticky" aria-label="Study controls">
        <p class="controls-caption">Mode: ${mode.label}</p>
        <div class="controls-row__group">
          <div class="control-cluster" role="group" aria-label="Mode selector">
            ${renderModeButtons()}
          </div>
          ${renderLightnessInputs(mode.id)}
        </div>
        <div class="controls-row__group">
          ${renderToggleButton("showTokenLabels", "Token labels")}
          ${renderToggleButton("showRawScaleValues", "Raw scale values")}
          ${renderToggleButton("stressMode", "Stress mode")}
        </div>
      </div>

      <main class="study-main">
        ${renderContextSection(mode.id, "default")}
        ${renderContextSection(mode.id, "offset")}
      </main>
    </div>
  `;
}

render();
