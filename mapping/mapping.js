import {
  THEMES,
  applySurfaceVariables,
  clampStep,
  getInkForStep,
  resolveSurfaceToken,
} from "../shared/surfaces.js";
import { getState, resetMappingPage, subscribe, updateMappingUI } from "../shared/state.js";

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

function renderSelect({ label, action, value, theme, options }) {
  return `
    <label class="control-group">
      <span class="control-label">${label}</span>
      <select class="field-input" data-action="${action}" ${theme ? `data-theme="${theme}"` : ""}>
        ${options
          .map(
            (option) => `
              <option value="${option.value}" ${option.value === value ? "selected" : ""}>
                ${option.label}
              </option>
            `,
          )
          .join("")}
      </select>
    </label>
  `;
}

function resolveShift(step, delta) {
  const requested = Number(step) + Number(delta);
  const resolved = clampStep(requested);

  return {
    step: resolved,
    clamped: resolved !== requested,
  };
}

function getInternalDeltas(theme) {
  return {
    emphasis: 1,
    deEmphasis: -1,
    label: theme === "light" ? "Subtractive within surfaces" : "Additive within surfaces",
  };
}

function buildCardState(theme, baseStep) {
  const deltas = getInternalDeltas(theme);

  return {
    theme,
    baseStep,
    modeLabel: deltas.label,
    header: resolveShift(baseStep, deltas.emphasis),
    subsurface: resolveShift(baseStep, deltas.emphasis),
    footer: resolveShift(baseStep, deltas.deEmphasis),
  };
}

function formatResolution(label, relation, resolution) {
  return `${label} ${relation} -> ${resolveSurfaceToken(resolution.step)}${resolution.clamped ? " (clamped)" : ""}`;
}

function getOffsetStudySteps(theme, baseStep, sectionStep) {
  const labels = ["Prominent", "Default", "Quiet"];

  if (theme === "dark") {
    const minimumAboveOffset = clampStep(sectionStep + 1);
    const strongAboveOffset = clampStep(sectionStep + 2);
    const candidates = [
      Math.max(clampStep(baseStep + 1), strongAboveOffset),
      Math.max(clampStep(baseStep), minimumAboveOffset),
      Math.max(clampStep(baseStep + 1), strongAboveOffset),
    ];

    return candidates.map((step, index) => ({
      step,
      prominence: labels[index],
    }));
  }

  return [-1, 0, 1].map((delta, index) => ({
    step: clampStep(baseStep + delta),
    prominence: labels[index],
  }));
}

function renderStudyCard(surfaceValues, theme, baseStep, variant, title, description, options = {}) {
  const state = buildCardState(theme, baseStep);
  const footerResolution =
    options.direct && variant === "footer" && theme === "light"
      ? resolveShift(baseStep, 1)
      : options.direct && variant === "footer" && theme === "dark" && options.sectionStep !== undefined
        ? {
            step: Math.max(resolveShift(baseStep, -1).step, clampStep(options.sectionStep + 1)),
            clamped: resolveShift(baseStep, -1).step < clampStep(options.sectionStep + 1),
          }
      : state.footer;
  const baseText = getInkForStep(surfaceValues, theme, state.baseStep);
  const headerText = getInkForStep(surfaceValues, theme, state.header.step);
  const footerText = getInkForStep(surfaceValues, theme, footerResolution.step);
  const insetText = getInkForStep(surfaceValues, theme, state.subsurface.step);
  const wrapperClass = options.direct ? "study-card study-card--direct" : "study-card";

  return `
    <article class="${wrapperClass}">
      <div
        class="study-card__card study-card__card--${variant}"
        style="background: var(--surface-${state.baseStep}); color: ${baseText};"
      >
        ${
          variant === "header"
            ? `
              <div
                class="study-card__header"
                style="background: var(--surface-${state.header.step}); color: ${headerText};"
              >
                ${formatResolution("Header", "stacks up", state.header)}
              </div>
            `
            : ""
        }
        <div class="study-card__body">
          <div class="study-card__copy">
            <p class="surface-token">${title}</p>
            <p class="surface-value">${description}</p>
            <p class="surface-value">Base -> ${resolveSurfaceToken(state.baseStep)}</p>
            <p class="surface-value">${state.modeLabel}</p>
          </div>
          ${
            variant === "subsurface"
              ? `
                <div
                  class="study-inset"
                  style="background: var(--surface-${state.subsurface.step}); color: ${insetText};"
                >
                  ${formatResolution("Inset", "stacks up", state.subsurface)}
                </div>
              `
              : ""
          }
        </div>
        ${
          variant === "footer"
            ? `
              <div
                class="study-card__footer"
                style="background: var(--surface-${footerResolution.step}); color: ${footerText};"
              >
                ${formatResolution("Footer", options.direct && theme === "light" ? "stacks up" : "stacks down", footerResolution)}
              </div>
            `
            : ""
        }
      </div>
    </article>
  `;
}

function renderStudyGroup(surfaceValues, theme, baseStep, contextLabel) {
  return `
    <div class="study-group">
      <div class="context-section__header">
        <p class="surface-token">${contextLabel}</p>
        <p class="surface-value">Shared default surface -> ${resolveSurfaceToken(baseStep)}</p>
      </div>
      <div class="study-grid">
        ${renderStudyCard(
          surfaceValues,
          theme,
          baseStep,
          "header",
          "Header study",
          "Header only, isolated from footer and inset noise.",
        )}
        ${renderStudyCard(
          surfaceValues,
          theme,
          baseStep,
          "subsurface",
          "Inset study",
          "Inset section only, using the same default base.",
        )}
        ${renderStudyCard(
          surfaceValues,
          theme,
          baseStep,
          "footer",
          "Footer study",
          "Footer only, using the same default base.",
        )}
      </div>
    </div>
  `;
}

function renderOffsetStudyGroup(surfaceValues, theme, baseStep, sectionStep, contextLabel) {
  const cards = [
    {
      variant: "header",
      title: "Header study",
      description: "card on offset.",
    },
    {
      variant: "subsurface",
      title: "Inset study",
      description: "near-offset card.",
    },
    {
      variant: "footer",
      title: "Footer study",
      description: "card on offset.",
    },
  ];
  const offsetSteps = getOffsetStudySteps(theme, baseStep, sectionStep);

  return `
    <div class="study-group">
      <div class="context-section__header">
        <p class="surface-token">${contextLabel}</p>
        <p class="surface-value">
          Three direct cards on the offset, with darker-theme cards lifted when needed to stay above the offset.
        </p>
      </div>
      <div class="study-grid">
        ${offsetSteps
          .map((entry, index) =>
            renderStudyCard(
              surfaceValues,
              theme,
              entry.step,
              cards[index].variant,
              cards[index].title,
              `${entry.prominence} ${cards[index].description}`,
              { direct: true, sectionStep },
            ),
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderThemePanel(theme, state) {
  const baseStep = state.mappingUI.cardBase;
  const sectionStep = state.mappingUI.offsetSteps[theme];
  const pageContextLabel = `Page background -> ${resolveSurfaceToken(0)}`;
  const offsetContextLabel = `Offset background -> ${resolveSurfaceToken(sectionStep)}`;

  return `
    <section class="preview-panel preview-panel--canvas" data-preview-root data-theme-panel="${theme}">
      <div class="panel-heading">
        <div>
          <p class="kicker">${theme} theme</p>
          <h2>${theme === "light" ? "Shared base across page and offset" : "Shared base across page and offset"}</h2>
        </div>
      </div>
      <div class="context-page">
        ${renderStudyGroup(state.surfaceValues, theme, baseStep, pageContextLabel)}
        <section
          class="offset-section"
          style="background: var(--surface-${sectionStep}); color: ${getInkForStep(state.surfaceValues, theme, sectionStep)};"
        >
          ${renderOffsetStudyGroup(state.surfaceValues, theme, baseStep, sectionStep, offsetContextLabel)}
        </section>
      </div>
    </section>
  `;
}

function bindEvents() {
  app.querySelectorAll('[data-action="view-mode"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      updateMappingUI({
        viewMode: event.target.value,
      });
    });
  });

  app.querySelectorAll('[data-action="single-theme"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      updateMappingUI({
        singleTheme: event.target.value,
      });
    });
  });

  const baseSelect = app.querySelector('[data-action="card-base"]');

  if (baseSelect) {
    baseSelect.addEventListener("change", (event) => {
      updateMappingUI({
        cardBase: Number(event.target.value),
      });
    });
  }

  app.querySelectorAll('[data-action="offset-step"]').forEach((select) => {
    select.addEventListener("change", (event) => {
      updateMappingUI({
        offsetSteps: {
          [event.target.dataset.theme]: Number(event.target.value),
        },
      });
    });
  });

  const resetButton = app.querySelector('[data-action="reset-mapping"]');

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      resetMappingPage();
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
  const visibleThemes = getVisibleThemes(state.mappingUI.viewMode, state.mappingUI.singleTheme);
  const baseOptions = [1, 2, 3, 4].map((step) => ({
    value: step,
    label: resolveSurfaceToken(step),
  }));
  const offsetOptions = [0, 1, 2, 3, 4, 5].map((step) => ({
    value: step,
    label: resolveSurfaceToken(step),
  }));

  app.innerHTML = `
    <section class="page-chrome">
      <a class="back-link" href="../">Hub</a>
      <p class="kicker">Prototype</p>
      <h1>Contextual Mapping Lab</h1>
      <p class="lede">
        Use one shared default surface across page and offset contexts, then inspect header,
        inset, and footer rules as separate studies instead of combining them into one noisy card.
      </p>
    </section>
    <section class="control-strip control-strip--mapping">
      ${renderRadioGroup({
        legend: "View mode",
        name: "mapping-view-mode",
        value: state.mappingUI.viewMode,
        action: "view-mode",
        options: [
          { label: "Side by side", value: "split" },
          { label: "Single column", value: "single" },
        ],
      })}
      ${
        state.mappingUI.viewMode === "single"
          ? renderRadioGroup({
              legend: "Theme",
              name: "mapping-single-theme",
              value: state.mappingUI.singleTheme,
              action: "single-theme",
              options: [
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
              ],
            })
          : ""
      }
      ${renderSelect({
        label: "Default surface level",
        action: "card-base",
        value: state.mappingUI.cardBase,
        options: baseOptions,
      })}
      ${THEMES.map((theme) =>
        renderSelect({
          label: `${theme} offset background`,
          action: "offset-step",
          value: state.mappingUI.offsetSteps[theme],
          theme,
          options: offsetOptions,
        }),
      ).join("")}
      <div class="control-group control-group--actions">
        <p class="control-label">State</p>
        <button class="action-button" type="button" data-action="reset-mapping">Reset lab + ladder</button>
      </div>
    </section>
    <section class="status-note">
      The default surface level is now shared across default light, default dark, offset light, and offset dark so the only variable is the surrounding surface.
    </section>
    <section class="preview-grid ${state.mappingUI.viewMode === "single" ? "preview-grid--single" : ""}">
      ${visibleThemes.map((theme) => renderThemePanel(theme, state)).join("")}
    </section>
  `;

  bindEvents();
  applyPreviews(state.surfaceValues);
}

subscribe(render);
render();
