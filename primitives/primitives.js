import {
  SURFACE_INDICES,
  THEMES,
  applySurfaceVariables,
  getInkForStep,
  getSurfaceLightness,
  resolveSurfaceToken,
} from "../shared/surfaces.js";
import { getState, resetPrimitivesPage, subscribe, updatePrimitivesUI, updateSurfaceValue } from "../shared/state.js";

const app = document.querySelector("#app");

function getVisibleThemes(viewMode, singleTheme) {
  return viewMode === "single" ? [singleTheme] : THEMES;
}

function renderRadioGroup({ legend, name, value, action, options }) {
  return `
    <fieldset class="control-group">
      <legend>${legend}</legend>
      <div class="segmented-control">
        ${options
          .map(
            (option) => `
              <label class="segmented-option">
                <input
                  type="radio"
                  name="${name}"
                  value="${option.value}"
                  data-action="${action}"
                  ${option.value === value ? "checked" : ""}
                />
                <span>${option.label}</span>
              </label>
            `,
          )
          .join("")}
      </div>
    </fieldset>
  `;
}

function renderSurfaceBlock(theme, surfaceValues, step) {
  const token = resolveSurfaceToken(step);
  const lightness = getSurfaceLightness(surfaceValues, theme, step);
  const textColor = getInkForStep(surfaceValues, theme, step);
  const blockClasses = [
    "surface-block",
    step === 0 ? "surface-block--first" : "",
    step === SURFACE_INDICES.length - 1 ? "surface-block--last" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <section
      class="${blockClasses}"
      style="background: var(--surface-${step}); color: ${textColor};"
    >
      <div class="surface-block__header">
        <p class="surface-token">${token}</p>
        <label class="field-stack field-stack--inline">
          <span>Lightness</span>
          <div class="number-stepper">
            <button
              class="stepper-button"
              type="button"
              aria-label="Decrease ${token} lightness"
              data-action="step-lightness"
              data-theme="${theme}"
              data-step="${step}"
              data-delta="-1"
            >
              -
            </button>
            <input
              class="field-input field-input--inline field-input--stepper"
              type="number"
              min="0"
              max="100"
              step="1"
              value="${lightness}"
              data-action="surface-lightness"
              data-theme="${theme}"
              data-step="${step}"
            />
            <button
              class="stepper-button"
              type="button"
              aria-label="Increase ${token} lightness"
              data-action="step-lightness"
              data-theme="${theme}"
              data-step="${step}"
              data-delta="1"
            >
              +
            </button>
          </div>
        </label>
      </div>
    </section>
  `;
}

function renderThemePanel(theme, surfaceValues) {
  const descriptor = theme === "light" ? "Subtractive ladder" : "Additive ladder";

  return `
    <section class="preview-panel preview-panel--surface-shell" data-preview-root data-theme-panel="${theme}">
      <div class="panel-heading">
        <div>
          <p class="kicker">${theme} theme</p>
          <h2>${descriptor}</h2>
        </div>
      </div>
      <div class="surface-stack">
        ${SURFACE_INDICES.map((step) => renderSurfaceBlock(theme, surfaceValues, step)).join("")}
      </div>
    </section>
  `;
}

function bindEvents() {
  app.querySelectorAll('[data-action="view-mode"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      updatePrimitivesUI({
        viewMode: event.target.value,
      });
    });
  });

  app.querySelectorAll('[data-action="single-theme"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      updatePrimitivesUI({
        singleTheme: event.target.value,
      });
    });
  });

  app.querySelectorAll('[data-action="surface-lightness"]').forEach((input) => {
    input.addEventListener("input", (event) => {
      updateSurfaceValue(
        event.target.dataset.theme,
        Number(event.target.dataset.step),
        event.target.value,
      );
    });
  });

  app.querySelectorAll('[data-action="step-lightness"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      const { theme, step, delta } = event.currentTarget.dataset;
      const input = app.querySelector(
        `[data-action="surface-lightness"][data-theme="${theme}"][data-step="${step}"]`,
      );
      const currentValue = Number(input?.value ?? 0);

      updateSurfaceValue(theme, Number(step), currentValue + Number(delta));
    });
  });

  const resetButton = app.querySelector('[data-action="reset-primitives"]');

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      resetPrimitivesPage();
    });
  }
}

function applyPreviews(surfaceValues) {
  app.querySelectorAll("[data-preview-root]").forEach((panel) => {
    applySurfaceVariables(panel, panel.dataset.themePanel, surfaceValues);
  });
}

function render() {
  const state = getState();
  const visibleThemes = getVisibleThemes(state.primitivesUI.viewMode, state.primitivesUI.singleTheme);

  app.innerHTML = `
    <section class="page-chrome">
      <a class="back-link" href="../">Hub</a>
      <p class="kicker">Prototype</p>
      <h1>Primitive Inspector</h1>
      <p class="lede">
        Adjust each lightness step directly and inspect how the shared primitive ladder resolves
        in light and dark themes.
      </p>
    </section>
    <section class="control-strip">
      ${renderRadioGroup({
        legend: "View mode",
        name: "primitives-view-mode",
        value: state.primitivesUI.viewMode,
        action: "view-mode",
        options: [
          { label: "Side by side", value: "split" },
          { label: "Single column", value: "single" },
        ],
      })}
      ${
        state.primitivesUI.viewMode === "single"
          ? renderRadioGroup({
              legend: "Theme",
              name: "primitives-single-theme",
              value: state.primitivesUI.singleTheme,
              action: "single-theme",
              options: [
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
              ],
            })
          : ""
      }
      <div class="control-group control-group--actions">
        <p class="control-label">State</p>
        <button class="action-button" type="button" data-action="reset-primitives">Reset ladder</button>
      </div>
    </section>
    <section class="status-note">
      Primitive values persist in local storage so changes carry into the mapping lab.
    </section>
    <section class="preview-grid ${state.primitivesUI.viewMode === "single" ? "preview-grid--single" : ""}">
      ${visibleThemes.map((theme) => renderThemePanel(theme, state.surfaceValues)).join("")}
    </section>
  `;

  bindEvents();
  applyPreviews(state.surfaceValues);
}

subscribe(render);
render();
