import { CONTROLS, CUSTOM_IDENTITY_ID, INTENTIONS } from "./config.js";
import { buildPreviewPalette, formatControlValue } from "./theme-engine.js";

function buildControlGroupsMarkup() {
  return INTENTIONS.map(
    (intention) => `
      <section class="intention-group ${intention.schemeClass} surface-default">
        <div class="intention-head">
          <div>
            <p class="mini-label">${intention.label}</p>
            <p class="stack-note">${intention.description}</p>
          </div>
        </div>

        <div class="intention-slider-list">
          ${CONTROLS.map(
            (control) => `
              <div class="slider-group">
                <label class="slider-control" for="control-${intention.id}-${control.id}">
                  <span>${control.label}</span>
                  <output
                    for="control-${intention.id}-${control.id}"
                    data-control-output="${intention.id}:${control.id}"
                  ></output>
                </label>
                <input
                  id="control-${intention.id}-${control.id}"
                  name="control-${intention.id}-${control.id}"
                  type="range"
                  min="${control.min}"
                  max="${control.max}"
                  step="${control.step}"
                  data-control-input
                  data-intention-id="${intention.id}"
                  data-control-id="${control.id}"
                />
                <p class="slider-hint">${control.hint}</p>
              </div>
            `,
          ).join("")}
        </div>
      </section>
    `,
  ).join("");
}

export function renderIdentityOptions(select, presets, selectedValue) {
  if (!select) {
    return;
  }

  select.innerHTML = [
    ...presets.map(
      (preset) => `<option value="${preset.id}">${preset.label}</option>`,
    ),
    `<option value="${CUSTOM_IDENTITY_ID}">Custom</option>`,
  ].join("");

  select.value = selectedValue;
}

export function renderControlGroups(container, modeValues, rangeMode) {
  if (!container) {
    return;
  }

  if (!container.dataset.initialized) {
    container.innerHTML = buildControlGroupsMarkup();
    container.dataset.initialized = "true";
  }

  container.querySelectorAll("[data-control-input]").forEach((input) => {
    const { intentionId, controlId } = input.dataset;
    const nextValue = modeValues[intentionId][controlId];
    const controlMeta = CONTROLS.find((control) => control.id === controlId);
    const range = controlMeta?.ranges?.[rangeMode];
    input.value = `${nextValue}`;
    if (range) {
      input.min = `${range.min}`;
      input.max = `${range.max}`;
    }

    const output = container.querySelector(
      `[data-control-output="${intentionId}:${controlId}"]`,
    );

    if (output) {
      const formatted = formatControlValue(controlId, nextValue);
      output.value = formatted;
      output.textContent = formatted;
    }
  });
}

function renderPreviewMode(modeLabel, palette, wrapperClassName = "") {
  return `
    <div class="identity-preview-mode ${wrapperClassName}">
      <div class="identity-preview-mode-head">
        <p class="mini-label">${modeLabel}</p>
      </div>
      <div class="identity-preview-list">
        ${INTENTIONS.map((intention) => {
          const preview = palette[intention.id];

          return `
            <div class="identity-preview-row">
              <p class="identity-preview-label">${preview.label}</p>
              <div class="identity-preview-swatches">
                <span class="identity-preview-swatch" style="background:${preview.levels.raised}"></span>
                <span class="identity-preview-swatch" style="background:${preview.levels.default}"></span>
                <span class="identity-preview-swatch" style="background:${preview.levels.subtle}"></span>
                <span class="identity-preview-swatch" style="background:${preview.levels.sunken}"></span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

export function renderIdentityGallery(
  container,
  { presets, activeSourceId, isCustom, activeMode },
) {
  if (!container) {
    return;
  }

  container.innerHTML = presets
    .map((preset) => {
      const lightPalette = buildPreviewPalette(preset.modes.light);
      const darkPalette = buildPreviewPalette(preset.modes.dark);
      const isActivePreset = preset.id === activeSourceId;
      const status = isActivePreset ? (isCustom ? "Base preset" : "Loaded") : "";
      const buttonLabel = isActivePreset ? "Reload identity" : "Load identity";

      return `
        <article class="identity-card scheme-neutral surface-subtle">
          <div class="identity-card-head">
            <div class="identity-card-copy">
              <p class="mini-label">${status || "Identity"}</p>
              <h3>${preset.label}</h3>
              <p class="stack-note">${preset.description}</p>
            </div>
            <p class="identity-card-mode">${activeMode} preview active</p>
          </div>

          <div class="identity-preview-grid">
            ${renderPreviewMode("Light", lightPalette, "identity-preview-mode-light")}
            ${renderPreviewMode("Dark", darkPalette, "identity-preview-mode-dark")}
          </div>

          <button
            class="button ${isActivePreset ? "button-subtle" : "button-solid"} scheme-brand"
            type="button"
            data-load-identity="${preset.id}"
          >
            ${buttonLabel}
          </button>
        </article>
      `;
    })
    .join("");
}
