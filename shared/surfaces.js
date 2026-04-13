export const THEMES = ["light", "dark"];
export const SURFACE_COUNT = 6;
export const SURFACE_INDICES = Array.from({ length: SURFACE_COUNT }, (_, index) => index);

export const DEFAULT_SURFACE_VALUES = {
  light: [99, 98, 96, 94, 92, 90],
  dark: [15, 18, 21, 23, 25, 27],
};

export const DEFAULT_PRIMITIVES_UI = {
  viewMode: "split",
  singleTheme: "light",
};

export const DEFAULT_MAPPING_UI = {
  viewMode: "split",
  singleTheme: "light",
  cardBase: 2,
  offsetSteps: {
    light: 4,
    dark: 1,
  },
};

export const DEFAULT_BENCHMARK_UI = {
  theme: "light",
  defaultCardBase: 2,
  offsetSteps: {
    light: 4,
    dark: 1,
  },
  railSteps: {
    light: 1,
    dark: 1,
  },
};

export function clampStep(step) {
  const parsed = Number(step);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return Math.min(SURFACE_COUNT - 1, Math.max(0, Math.round(parsed)));
}

export function clampLightness(value) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(parsed * 10) / 10));
}

export function normalizeSurfaceValues(values = DEFAULT_SURFACE_VALUES) {
  return THEMES.reduce((normalized, theme) => {
    const source = Array.isArray(values?.[theme]) ? values[theme] : DEFAULT_SURFACE_VALUES[theme];

    normalized[theme] = SURFACE_INDICES.map((step) =>
      clampLightness(source[step] ?? DEFAULT_SURFACE_VALUES[theme][step]),
    );

    return normalized;
  }, {});
}

export function buildNeutralColor(lightness) {
  return `oklch(${clampLightness(lightness)}% 0 0)`;
}

export function resolveSurfaceToken(step) {
  return `surface-${clampStep(step)}`;
}

export function getSurfaceLightness(surfaceValues, theme, step) {
  const normalized = normalizeSurfaceValues(surfaceValues);
  return normalized[theme][clampStep(step)];
}

export function getReadableInk(lightness) {
  return clampLightness(lightness) >= 60 ? "oklch(18% 0 0)" : "oklch(98% 0 0)";
}

export function getInkForStep(surfaceValues, theme, step) {
  return getReadableInk(getSurfaceLightness(surfaceValues, theme, step));
}

export function applySurfaceVariables(container, theme, surfaceValues) {
  const normalized = normalizeSurfaceValues(surfaceValues);

  SURFACE_INDICES.forEach((step) => {
    container.style.setProperty(`--surface-${step}`, buildNeutralColor(normalized[theme][step]));
  });

  container.dataset.theme = theme;
  container.style.setProperty("--surface-ink", getInkForStep(normalized, theme, 0));
}

export function stackUp(_theme, step) {
  return clampStep(step + 1);
}

export function stackDown(_theme, step) {
  return clampStep(step - 1);
}

export function shiftWithClamp(step, delta) {
  const requested = Number(step) + Number(delta);
  const resolved = clampStep(requested);

  return {
    step: resolved,
    clamped: resolved !== requested,
  };
}

export function buildSurfaceOptions(start = 0) {
  return SURFACE_INDICES.filter((step) => step >= start).map((step) => ({
    step,
    token: resolveSurfaceToken(step),
  }));
}

function deriveCardRegions(theme, baseStep, offsetBackgroundStep) {
  const base = clampStep(baseStep);
  const header = clampStep(base + 1);
  const inset = clampStep(base + 1);
  const requestedFooter = clampStep(base - 1);
  const footer =
    theme === "dark" && typeof offsetBackgroundStep === "number"
      ? Math.max(requestedFooter, clampStep(offsetBackgroundStep + 1))
      : requestedFooter;

  return {
    base,
    header,
    inset,
    footer,
    footerClamped: footer !== requestedFooter,
  };
}

export function deriveBenchmarkMappings(theme, benchmarkUI = DEFAULT_BENCHMARK_UI) {
  const activeTheme = THEMES.includes(theme) ? theme : DEFAULT_BENCHMARK_UI.theme;
  const defaultCardBase = Math.min(
    4,
    Math.max(1, clampStep(benchmarkUI.defaultCardBase ?? DEFAULT_BENCHMARK_UI.defaultCardBase)),
  );
  const rail = clampStep(
    benchmarkUI.railSteps?.[activeTheme] ?? DEFAULT_BENCHMARK_UI.railSteps[activeTheme],
  );
  const offsetBackground = clampStep(
    benchmarkUI.offsetSteps?.[activeTheme] ?? DEFAULT_BENCHMARK_UI.offsetSteps[activeTheme],
  );
  let offsetCardBase =
    activeTheme === "light"
      ? Math.min(Math.max(0, defaultCardBase - 1), clampStep(offsetBackground - 1))
      : Math.max(defaultCardBase, clampStep(offsetBackground + 1));

  offsetCardBase = clampStep(offsetCardBase);

  if (activeTheme === "dark" && offsetCardBase <= offsetBackground) {
    offsetCardBase = clampStep(offsetBackground + 1);
  }

  return {
    pageBackground: 0,
    rail,
    defaultCardBase,
    pageModule: deriveCardRegions(activeTheme, defaultCardBase),
    pageTableCard: deriveCardRegions(activeTheme, defaultCardBase),
    pageMetricsCard: deriveCardRegions(activeTheme, defaultCardBase),
    offsetBackground,
    offsetCardBase,
    offsetModule: deriveCardRegions(activeTheme, offsetCardBase, offsetBackground),
    offsetTableCard: deriveCardRegions(activeTheme, offsetCardBase, offsetBackground),
    offsetMetricsCard: deriveCardRegions(activeTheme, offsetCardBase, offsetBackground),
  };
}
