import {
  CONTROLS,
  INTENTIONS,
  MODES,
  SURFACE_LEVEL_FACTORS,
} from "./config.js";

const cloneValue = globalThis.structuredClone
  ? (value) => globalThis.structuredClone(value)
  : (value) => JSON.parse(JSON.stringify(value));

export function cloneModes(modes) {
  return cloneValue(modes);
}

export function areModesEqual(a, b) {
  return MODES.every((mode) =>
    INTENTIONS.every((intention) =>
      CONTROLS.every(
        (control) =>
          Number(a[mode][intention.id][control.id]) ===
          Number(b[mode][intention.id][control.id]),
      ),
    ),
  );
}

export function formatControlValue(controlId, value) {
  if (controlId === "hue") {
    return `${Math.round(Number(value))}`;
  }

  return Number(value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function formatCssValue(controlId, value) {
  if (controlId === "hue") {
    return `${Math.round(Number(value))}`;
  }

  return Number(value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export function applyModeToRoot(root, mode, modeValues) {
  root.dataset.theme = mode;

  INTENTIONS.forEach((intention) => {
    const cssName = intention.cssName;
    const values = modeValues[intention.id];

    root.style.setProperty(`--${cssName}-h`, formatCssValue("hue", values.hue));
    root.style.setProperty(`--${cssName}-c`, formatCssValue("chroma", values.chroma));
    root.style.setProperty(
      `--${cssName}-base-l`,
      formatCssValue("baselineLightness", values.baselineLightness),
    );
    root.style.setProperty(
      `--${cssName}-spread`,
      formatCssValue("spread", values.spread),
    );
  });
}

function clampLightness(value) {
  return Math.min(0.99, Math.max(0.02, value));
}

export function getSurfaceLightnesses(values) {
  return {
    raised: clampLightness(
      values.baselineLightness + values.spread * SURFACE_LEVEL_FACTORS.raised,
    ),
    default: clampLightness(
      values.baselineLightness + values.spread * SURFACE_LEVEL_FACTORS.default,
    ),
    subtle: clampLightness(
      values.baselineLightness + values.spread * SURFACE_LEVEL_FACTORS.subtle,
    ),
    sunken: clampLightness(
      values.baselineLightness + values.spread * SURFACE_LEVEL_FACTORS.sunken,
    ),
  };
}

function toOklch(lightness, chroma, hue) {
  return `oklch(${Number(lightness).toFixed(3)} ${Number(chroma).toFixed(3)} ${Math.round(
    Number(hue),
  )})`;
}

export function buildPreviewPalette(modeValues) {
  return INTENTIONS.reduce((palette, intention) => {
    const values = modeValues[intention.id];
    const levels = getSurfaceLightnesses(values);

    palette[intention.id] = {
      label: intention.label,
      schemeClass: intention.schemeClass,
      levels: {
        raised: toOklch(levels.raised, values.chroma, values.hue),
        default: toOklch(levels.default, values.chroma, values.hue),
        subtle: toOklch(levels.subtle, values.chroma, values.hue),
        sunken: toOklch(levels.sunken, values.chroma, values.hue),
      },
    };

    return palette;
  }, {});
}
