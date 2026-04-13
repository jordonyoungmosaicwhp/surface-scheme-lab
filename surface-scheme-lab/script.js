import {
  CUSTOM_IDENTITY_ID,
  DEFAULT_IDENTITY_ID,
  MODES,
  PAGES,
  RANGE_MODES,
  CONTROLS,
} from "./app/config.js";
import {
  renderControlGroups,
  renderIdentityGallery,
  renderIdentityOptions,
} from "./app/renderers.js";
import { presets, presetsById } from "./app/presets/index.js";
import { applyModeToRoot, areModesEqual, cloneModes } from "./app/theme-engine.js";

const root = document.documentElement;
const body = document.body;
const desktopRailQuery = window.matchMedia("(min-width: 961px)");

const initialPreset = presetsById.get(DEFAULT_IDENTITY_ID) ?? presets[0];
const pageIds = new Set(PAGES.map((page) => page.id));

const elements = {
  identitySelect: document.querySelector("[data-identity-select]"),
  themeButtons: Array.from(document.querySelectorAll("[data-theme-button]")),
  rangeModeButtons: Array.from(document.querySelectorAll("[data-range-mode-button]")),
  panelToggles: Array.from(document.querySelectorAll("[data-panel-toggle]")),
  navCloseButtons: Array.from(document.querySelectorAll("[data-nav-close]")),
  controlsCloseButtons: Array.from(document.querySelectorAll("[data-controls-close]")),
  navPanel: document.querySelector("#site-nav"),
  controlsPanel: document.querySelector("#control-drawer"),
  pageViews: Array.from(document.querySelectorAll("[data-page-view]")),
  pageLinks: Array.from(document.querySelectorAll("[data-page-link]")),
  controlGroups: document.querySelector("[data-control-groups]"),
  resetModeButton: document.querySelector("[data-reset-mode]"),
  presetStatus: document.querySelector("[data-preset-status]"),
  activeModeLabel: document.querySelector("[data-active-mode-label]"),
  rangeModeNote: document.querySelector("[data-range-mode-note]"),
  identityGallery: document.querySelector("[data-identity-gallery]"),
  galleryCurrentLabel: document.querySelector("[data-gallery-current-label]"),
  galleryCurrentCopy: document.querySelector("[data-gallery-current-copy]"),
  galleryCurrentMode: document.querySelector("[data-gallery-current-mode]"),
  galleryCurrentStatus: document.querySelector("[data-gallery-current-status]"),
};

const state = {
  activePage: resolvePageFromUrl(),
  activeMode: MODES.includes(root.dataset.theme) ? root.dataset.theme : "light",
  navOpen: false,
  controlsOpen: false,
  sliderRangeMode: "standard",
  sourceIdentityId: initialPreset.id,
  working: cloneModes(initialPreset.modes),
  rangeClampNotice: "",
};

function resolvePageFromUrl() {
  const page = new URLSearchParams(window.location.search).get("page");
  return pageIds.has(page) ? page : "home";
}

function getSourcePreset() {
  return presetsById.get(state.sourceIdentityId) ?? initialPreset;
}

function hasCustomEdits() {
  return !areModesEqual(state.working, getSourcePreset().modes);
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function updateUrlForPage(pageId) {
  const url = new URL(window.location.href);

  if (pageId === "home") {
    url.searchParams.delete("page");
  } else {
    url.searchParams.set("page", pageId);
  }

  window.history.pushState({ page: pageId }, "", `${url.pathname}${url.search}${url.hash}`);
}

function isDesktopRail() {
  return desktopRailQuery.matches;
}

function getControlMeta(controlId) {
  return CONTROLS.find((control) => control.id === controlId);
}

function clampValueToRange(controlId, value, rangeMode) {
  const control = getControlMeta(controlId);
  const range = control?.ranges?.[rangeMode];

  if (!control || !range) {
    return value;
  }

  const numeric = Number(value);
  return Math.min(range.max, Math.max(range.min, numeric));
}

function clampWorkingValuesToRange(rangeMode) {
  let didClamp = false;

  MODES.forEach((mode) => {
    Object.values(state.working[mode]).forEach((intentionValues) => {
      CONTROLS.forEach((control) => {
        const nextValue = clampValueToRange(
          control.id,
          intentionValues[control.id],
          rangeMode,
        );

        if (Number(nextValue) !== Number(intentionValues[control.id])) {
          intentionValues[control.id] = nextValue;
          didClamp = true;
        }
      });
    });
  });

  state.rangeClampNotice = didClamp
    ? "Standard mode narrows values to the focused range and clamps any broader advanced edits."
    : "Standard mode keeps the most practical tuning range visible.";
}

function syncPanels() {
  body.classList.toggle("has-open-nav", state.navOpen);
  body.classList.toggle("has-open-controls", state.controlsOpen);
  body.classList.toggle("has-open-panel", state.navOpen || (!isDesktopRail() && state.controlsOpen));
  body.classList.toggle("has-docked-controls", isDesktopRail() && state.controlsOpen);

  if (state.navOpen) {
    body.dataset.openPanel = "nav";
  } else if (state.controlsOpen) {
    body.dataset.openPanel = "controls";
  } else {
    delete body.dataset.openPanel;
  }

  elements.navPanel?.setAttribute("aria-hidden", String(!state.navOpen));
  elements.controlsPanel?.setAttribute(
    "aria-hidden",
    String(!state.controlsOpen && !isDesktopRail()),
  );

  elements.panelToggles.forEach((toggle) => {
    const panelId = toggle.dataset.panelToggle;
    const isExpanded = panelId === "nav" ? state.navOpen : state.controlsOpen;
    toggle.setAttribute("aria-expanded", String(isExpanded));
  });
}

function setNavOpen(isOpen) {
  state.navOpen = isOpen;
  if (isOpen) {
    state.controlsOpen = isDesktopRail() ? state.controlsOpen : false;
  }
  syncPanels();
}

function setControlsOpen(isOpen) {
  state.controlsOpen = isOpen;
  if (isOpen) {
    state.navOpen = false;
  }
  syncPanels();
}

function setSliderRangeMode(rangeMode) {
  if (!RANGE_MODES.includes(rangeMode)) {
    return;
  }

  state.sliderRangeMode = rangeMode;

  if (rangeMode === "standard") {
    clampWorkingValuesToRange("standard");
  } else {
    state.rangeClampNotice =
      "Advanced mode expands chroma, lightness, and spread beyond the standard tuning bounds.";
  }

  render();
}

function setPage(pageId, { pushHistory = true, scrollToTop = false } = {}) {
  if (!pageIds.has(pageId)) {
    return;
  }

  state.activePage = pageId;
  setNavOpen(false);

  if (pushHistory) {
    updateUrlForPage(pageId);
  }

  render();

  if (scrollToTop) {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }
}

function setActiveMode(mode) {
  if (!MODES.includes(mode)) {
    return;
  }

  state.activeMode = mode;
  render();
}

function loadIdentity(identityId) {
  const preset = presetsById.get(identityId);

  if (!preset) {
    return;
  }

  state.sourceIdentityId = preset.id;
  state.working = cloneModes(preset.modes);
  state.rangeClampNotice =
    state.sliderRangeMode === "advanced"
      ? "Advanced mode expands chroma, lightness, and spread beyond the standard tuning bounds."
      : "Standard mode keeps the most practical tuning range visible.";
  if (state.sliderRangeMode === "standard") {
    clampWorkingValuesToRange("standard");
  }
  setNavOpen(false);
  render();
}

function resetCurrentMode() {
  const preset = getSourcePreset();
  state.working[state.activeMode] = cloneModes(preset.modes[state.activeMode]);
  render();
}

function updateControl(intentionId, controlId, rawValue) {
  const nextValue = Number(rawValue);

  if (!Number.isFinite(nextValue)) {
    return;
  }

  state.working[state.activeMode][intentionId][controlId] = nextValue;
  render();
}

function syncPages() {
  elements.pageViews.forEach((pageView) => {
    const isActive = pageView.dataset.pageView === state.activePage;
    pageView.hidden = !isActive;
    pageView.classList.toggle("is-active", isActive);
  });

  elements.pageLinks.forEach((link) => {
    const isActive = link.dataset.pageLink === state.activePage;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function renderHeader(custom) {
  renderIdentityOptions(
    elements.identitySelect,
    presets,
    custom ? CUSTOM_IDENTITY_ID : state.sourceIdentityId,
  );

  elements.themeButtons.forEach((button) => {
    const isActive = button.dataset.themeButton === state.activeMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  elements.rangeModeButtons.forEach((button) => {
    const isActive = button.dataset.rangeModeButton === state.sliderRangeMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (elements.activeModeLabel) {
    elements.activeModeLabel.textContent = `${capitalize(state.activeMode)} mode`;
  }

  if (elements.rangeModeNote) {
    elements.rangeModeNote.textContent =
      state.rangeClampNotice ||
      "Standard mode keeps the most practical tuning range visible.";
  }
}

function renderStatus(custom, preset) {
  if (elements.presetStatus) {
    elements.presetStatus.textContent = custom
      ? `${capitalize(state.activeMode)} mode has custom edits. Base identity: ${preset.label}.`
      : `${preset.label} is loaded for both light and dark modes with no unsaved overrides.`;
  }

  if (elements.galleryCurrentLabel) {
    elements.galleryCurrentLabel.textContent = custom ? "Custom" : preset.label;
  }

  if (elements.galleryCurrentCopy) {
    elements.galleryCurrentCopy.textContent = custom
      ? `Custom edits are layered on top of ${preset.label}. Reload any identity to replace both appearance configs.`
      : preset.description;
  }

  if (elements.galleryCurrentMode) {
    elements.galleryCurrentMode.textContent = capitalize(state.activeMode);
  }

  if (elements.galleryCurrentStatus) {
    elements.galleryCurrentStatus.textContent = custom ? "Custom edits active" : "Preset loaded";
  }
}

function render() {
  const preset = getSourcePreset();
  const custom = hasCustomEdits();

  applyModeToRoot(root, state.activeMode, state.working[state.activeMode]);
  syncPages();
  syncPanels();
  renderHeader(custom);
  renderStatus(custom, preset);
  renderControlGroups(
    elements.controlGroups,
    state.working[state.activeMode],
    state.sliderRangeMode,
  );
  renderIdentityGallery(elements.identityGallery, {
    presets,
    activeSourceId: state.sourceIdentityId,
    isCustom: custom,
    activeMode: state.activeMode,
  });
}

document.addEventListener("click", (event) => {
  const panelToggle = event.target.closest("[data-panel-toggle]");

  if (panelToggle) {
    const panelId = panelToggle.dataset.panelToggle;
    if (panelId === "nav") {
      setNavOpen(!state.navOpen);
    } else if (panelId === "controls") {
      setControlsOpen(!state.controlsOpen);
    }
    return;
  }

  const navClose = event.target.closest("[data-nav-close]");

  if (navClose) {
    setNavOpen(false);
    return;
  }

  const controlsClose = event.target.closest("[data-controls-close]");

  if (controlsClose) {
    setControlsOpen(false);
    return;
  }

  const pageLink = event.target.closest("[data-page-link]");

  if (pageLink) {
    if (pageLink.tagName === "A") {
      event.preventDefault();
    }

    setPage(pageLink.dataset.pageLink, { pushHistory: true, scrollToTop: true });
    return;
  }

  const loadIdentityButton = event.target.closest("[data-load-identity]");

  if (loadIdentityButton) {
    loadIdentity(loadIdentityButton.dataset.loadIdentity);
  }
});

elements.identitySelect?.addEventListener("change", (event) => {
  const selectedValue = event.currentTarget.value;

  if (selectedValue === CUSTOM_IDENTITY_ID) {
    render();
    return;
  }

  loadIdentity(selectedValue);
});

elements.themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveMode(button.dataset.themeButton);
  });
});

elements.rangeModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setSliderRangeMode(button.dataset.rangeModeButton);
  });
});

elements.controlGroups?.addEventListener("input", (event) => {
  const control = event.target.closest("[data-control-input]");

  if (!control) {
    return;
  }

  updateControl(
    control.dataset.intentionId,
    control.dataset.controlId,
    clampValueToRange(control.dataset.controlId, control.value, state.sliderRangeMode),
  );
});

elements.resetModeButton?.addEventListener("click", () => {
  resetCurrentMode();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setNavOpen(false);
    if (!isDesktopRail()) {
      setControlsOpen(false);
    }
  }
});

window.addEventListener("popstate", () => {
  state.activePage = resolvePageFromUrl();
  render();
});

desktopRailQuery.addEventListener("change", () => {
  if (!isDesktopRail()) {
    state.controlsOpen = false;
  }
  state.navOpen = false;
  syncPanels();
  render();
});

state.rangeClampNotice = "Standard mode keeps the most practical tuning range visible.";

render();
