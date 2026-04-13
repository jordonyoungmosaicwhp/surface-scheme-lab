import {
  DEFAULT_BENCHMARK_UI,
  DEFAULT_MAPPING_UI,
  DEFAULT_PRIMITIVES_UI,
  DEFAULT_SURFACE_VALUES,
  THEMES,
  clampStep,
  normalizeSurfaceValues,
} from "./surfaces.js";

const STORAGE_KEY = "surface-color-prototype-hub:v1";
const listeners = new Set();

let currentState = readState();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeViewMode(value, fallback) {
  return value === "single" ? "single" : fallback;
}

function normalizeTheme(value, fallback) {
  return THEMES.includes(value) ? value : fallback;
}

function normalizePageState(value = {}, defaults) {
  return {
    viewMode: normalizeViewMode(value.viewMode, defaults.viewMode),
    singleTheme: normalizeTheme(value.singleTheme, defaults.singleTheme),
  };
}

function normalizeMappingState(value = {}) {
  return {
    ...normalizePageState(value, DEFAULT_MAPPING_UI),
    cardBase: Math.min(5, Math.max(1, clampStep(value.cardBase ?? DEFAULT_MAPPING_UI.cardBase))),
    offsetSteps: {
      light: clampStep(value.offsetSteps?.light ?? DEFAULT_MAPPING_UI.offsetSteps.light),
      dark: clampStep(value.offsetSteps?.dark ?? DEFAULT_MAPPING_UI.offsetSteps.dark),
    },
  };
}

function normalizeBenchmarkState(value = {}) {
  return {
    theme: normalizeTheme(value.theme, DEFAULT_BENCHMARK_UI.theme),
    defaultCardBase: Math.min(
      4,
      Math.max(1, clampStep(value.defaultCardBase ?? DEFAULT_BENCHMARK_UI.defaultCardBase)),
    ),
    offsetSteps: {
      light: clampStep(value.offsetSteps?.light ?? DEFAULT_BENCHMARK_UI.offsetSteps.light),
      dark: clampStep(value.offsetSteps?.dark ?? DEFAULT_BENCHMARK_UI.offsetSteps.dark),
    },
    railSteps: {
      light: clampStep(value.railSteps?.light ?? DEFAULT_BENCHMARK_UI.railSteps.light),
      dark: clampStep(value.railSteps?.dark ?? DEFAULT_BENCHMARK_UI.railSteps.dark),
    },
  };
}

function normalizeState(raw = {}) {
  return {
    surfaceValues: normalizeSurfaceValues(raw.surfaceValues),
    primitivesUI: normalizePageState(raw.primitivesUI, DEFAULT_PRIMITIVES_UI),
    mappingUI: normalizeMappingState(raw.mappingUI),
    benchmarkUI: normalizeBenchmarkState(raw.benchmarkUI),
  };
}

function readState() {
  if (typeof window === "undefined") {
    return normalizeState();
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeState(JSON.parse(saved)) : normalizeState();
  } catch (error) {
    console.warn("Unable to read saved prototype state.", error);
    return normalizeState();
  }
}

function persistState() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  } catch (error) {
    console.warn("Unable to save prototype state.", error);
  }
}

function emitChange() {
  const snapshot = getState();
  listeners.forEach((listener) => listener(snapshot));
}

export function getState() {
  return clone(currentState);
}

export function subscribe(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function setState(updater) {
  const baseState = getState();
  const nextState = typeof updater === "function" ? updater(baseState) : updater;

  currentState = normalizeState(nextState);
  persistState();
  emitChange();

  return getState();
}

export function updateSurfaceValue(theme, step, value) {
  return setState((state) => {
    state.surfaceValues[theme][step] = value;
    return state;
  });
}

export function updatePrimitivesUI(patch) {
  return setState((state) => {
    state.primitivesUI = {
      ...state.primitivesUI,
      ...patch,
    };

    return state;
  });
}

export function updateMappingUI(patch) {
  return setState((state) => {
    state.mappingUI = {
      ...state.mappingUI,
      ...patch,
      offsetSteps: {
        ...state.mappingUI.offsetSteps,
        ...(patch.offsetSteps ?? {}),
      },
    };

    return state;
  });
}

export function updateBenchmarkUI(patch) {
  return setState((state) => {
    state.benchmarkUI = {
      ...state.benchmarkUI,
      ...patch,
      offsetSteps: {
        ...state.benchmarkUI.offsetSteps,
        ...(patch.offsetSteps ?? {}),
      },
      railSteps: {
        ...state.benchmarkUI.railSteps,
        ...(patch.railSteps ?? {}),
      },
    };

    return state;
  });
}

export function resetPrimitivesPage() {
  return setState((state) => ({
    ...state,
    surfaceValues: clone(DEFAULT_SURFACE_VALUES),
    primitivesUI: clone(DEFAULT_PRIMITIVES_UI),
  }));
}

export function resetMappingPage() {
  return setState((state) => ({
    ...state,
    surfaceValues: clone(DEFAULT_SURFACE_VALUES),
    mappingUI: clone(DEFAULT_MAPPING_UI),
  }));
}

export function resetBenchmarkPage() {
  return setState((state) => ({
    ...state,
    benchmarkUI: clone(DEFAULT_BENCHMARK_UI),
  }));
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.storageArea !== window.localStorage) {
      return;
    }

    if (event.key !== STORAGE_KEY && event.key !== null) {
      return;
    }

    currentState = readState();
    emitChange();
  });
}
