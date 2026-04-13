import {
  applySurfaceVariables,
  buildSurfaceOptions,
  deriveBenchmarkMappings,
  getInkForStep,
  resolveSurfaceToken,
} from "../shared/surfaces.js";
import { getState, resetBenchmarkPage, subscribe, updateBenchmarkUI } from "../shared/state.js";

const app = document.querySelector("#app");

const NAV_ITEMS = [
  "Dashboard",
  "Orders",
  "Architects",
  "Vault",
  "Settings",
];

const TIMELINE_STAGES = ["Origin", "Processing", "Distribution", "Arrival"];

const LEDGER_ROWS = [
  {
    id: "MONO-6542-ZA",
    date: "12 Sep 2024",
    spec: "Brutalist Concrete Modular V2",
    amount: "$12,450.00",
    status: "Archived",
  },
  {
    id: "MONO-5981-BT",
    date: "02 Aug 2024",
    spec: "Steel Reinforcement Cluster X14",
    amount: "$8,200.00",
    status: "Archived",
  },
  {
    id: "MONO-4412-OP",
    date: "15 Jul 2024",
    spec: "Glass Transparency Set (Clear)",
    amount: "$24,900.00",
    status: "Archived",
  },
  {
    id: "MONO-3390-PL",
    date: "28 May 2024",
    spec: "Titanium Joint Systems (Custom)",
    amount: "$45,000.00",
    status: "Canceled",
  },
];

const METRICS = [
  { label: "Total archive volume", value: "$142,590.00" },
  { label: "Verified commissions", value: "18" },
  { label: "Average build cycle", value: "14 Days" },
];

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

function renderSelect({ label, action, value, options }) {
  return `
    <label class="control-group">
      <span class="control-label">${label}</span>
      <select class="field-input" data-action="${action}">
        ${options
          .map(
            (option) => `
              <option value="${option.step}" ${option.step === value ? "selected" : ""}>
                ${option.token}
              </option>
            `,
          )
          .join("")}
      </select>
    </label>
  `;
}

function renderLegendItem(label, step, suffix = "") {
  return `
    <div class="benchmark-legend__item">
      <p class="kicker">${label}</p>
      <p class="benchmark-legend__value">${resolveSurfaceToken(step)}${suffix}</p>
    </div>
  `;
}

function renderRail(theme, surfaceValues, mappings) {
  return `
    <aside
      class="benchmark-rail"
      style="background: var(--surface-${mappings.rail}); color: ${getInkForStep(surfaceValues, theme, mappings.rail)};"
    >
      <div class="benchmark-rail__brand">
        <p class="benchmark-brand">Portfolio</p>
        <p class="benchmark-caption">Verified enterprise</p>
      </div>
      <nav class="benchmark-rail__nav" aria-label="Primary">
        ${NAV_ITEMS.map(
          (item) => `
            <a
              class="benchmark-nav__item ${item === "Orders" ? "benchmark-nav__item--active" : ""}"
              href="#"
            >
              <span class="benchmark-nav__dot"></span>
              <span>${item}</span>
            </a>
          `,
        ).join("")}
      </nav>
      <div class="benchmark-rail__footer">
        <button class="benchmark-rail__action" type="button">New commission</button>
        <div class="benchmark-profile">
          <div class="benchmark-profile__avatar">M</div>
          <div>
            <p class="benchmark-profile__name">M. Archive</p>
            <p class="benchmark-caption">Global Admin</p>
          </div>
        </div>
      </div>
    </aside>
  `;
}

function renderManifestCard(
  surfaceValues,
  theme,
  card,
  { compact = false, offsetBackgroundStep = null } = {},
) {
  const compactMainStep =
    compact && typeof offsetBackgroundStep === "number"
      ? Math.min(5, offsetBackgroundStep + 2)
      : card.base;
  const compactSupportStep =
    compact && typeof offsetBackgroundStep === "number"
      ? Math.min(5, offsetBackgroundStep + 1)
      : Math.max(0, card.base - 1);
  const studyStep = compact ? compactSupportStep : Math.max(0, card.base - 1);

  return `
    <article
      class="benchmark-module ${compact ? "benchmark-module--compact" : ""}"
      style="background: var(--surface-${compactMainStep}); color: ${getInkForStep(surfaceValues, theme, compactMainStep)};"
    >
      <div class="benchmark-module__body">
        <div
          class="benchmark-module__main"
          style="background: var(--surface-${compactMainStep}); color: ${getInkForStep(surfaceValues, theme, compactMainStep)};"
        >
          <div class="benchmark-module__head">
            <div>
              <p class="benchmark-caption">Current active manifest</p>
              <p class="benchmark-module__title">MONO-7729-LX</p>
            </div>
            <span class="benchmark-pill">In transit</span>
          </div>
          <div class="benchmark-timeline">
            <div class="benchmark-timeline__line"></div>
            ${TIMELINE_STAGES.map(
              (stage, index) => `
                <div class="benchmark-timeline__stage">
                  <span class="benchmark-timeline__dot ${index < 3 ? "benchmark-timeline__dot--active" : ""}"></span>
                  <span class="benchmark-caption">${stage}</span>
                </div>
              `,
            ).join("")}
          </div>
          <div class="benchmark-module__divider"></div>
          <div
            class="benchmark-module__footer"
            style="background: var(--surface-${compact ? compactSupportStep : card.footer}); color: ${getInkForStep(surfaceValues, theme, compact ? compactSupportStep : card.footer)};"
          >
            <div>
              <p class="benchmark-caption">ETA</p>
              <p>24 Oct 2024</p>
            </div>
            <div>
              <p class="benchmark-caption">Carrier</p>
              <p>Arch-Logistics</p>
            </div>
            <div>
              <p class="benchmark-caption">Weight</p>
              <p>42.5 KG</p>
            </div>
            <div>
              <p class="benchmark-caption">Location</p>
              <p>Berlin Hub</p>
            </div>
          </div>
        </div>
        <aside
          class="benchmark-module__aside"
          style="background: var(--surface-${studyStep}); color: ${getInkForStep(surfaceValues, theme, studyStep)};"
        >
          <p class="benchmark-module__aside-title">Material Study #04</p>
          <p class="benchmark-caption">Part of LX-series order</p>
        </aside>
      </div>
    </article>
  `;
}

function renderLedgerCard(surfaceValues, theme, card, title) {
  return `
    <section
      class="benchmark-ledger"
      style="background: var(--surface-${card.base}); color: ${getInkForStep(surfaceValues, theme, card.base)};"
    >
      <div
        class="benchmark-ledger__header"
        style="background: var(--surface-${card.header}); color: ${getInkForStep(surfaceValues, theme, card.header)};"
      >
        <h2>${title}</h2>
        <div class="benchmark-ledger__actions">
          <span>Export CSV</span>
          <span>Filter list</span>
        </div>
      </div>
      <div class="benchmark-ledger__table-wrap">
        <table class="benchmark-ledger__table">
          <thead>
            <tr>
              <th>Identifier</th>
              <th>Date</th>
              <th>Specification</th>
              <th>Investment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${LEDGER_ROWS.map(
              (row) => `
                <tr>
                  <td>${row.id}</td>
                  <td>${row.date}</td>
                  <td>${row.spec}</td>
                  <td>${row.amount}</td>
                  <td class="${row.status === "Canceled" ? "benchmark-ledger__status--alert" : ""}">
                    ${row.status}
                  </td>
                </tr>
              `,
            ).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderMetricStrip(surfaceValues, theme, card) {
  return `
    <section
      class="benchmark-metrics"
      style="background: var(--surface-${card.base}); color: ${getInkForStep(surfaceValues, theme, card.base)};"
    >
      ${METRICS.map(
        (metric) => `
          <article
            class="benchmark-metrics__item"
            style="background: var(--surface-${card.inset}); color: ${getInkForStep(surfaceValues, theme, card.inset)};"
          >
            <p class="benchmark-caption">${metric.label}</p>
            <p class="benchmark-metrics__value">${metric.value}</p>
          </article>
        `,
      ).join("")}
    </section>
  `;
}

function renderLegend(theme, mappings) {
  return `
    <details class="benchmark-summary">
      <summary class="benchmark-summary__toggle">
        <span>Resolved surfaces</span>
        <span class="benchmark-summary__hint">Show mapping summary</span>
      </summary>
      <div class="benchmark-legend">
        <div class="benchmark-legend__group">
          ${renderLegendItem("Page background", mappings.pageBackground)}
          ${renderLegendItem("Rail", mappings.rail)}
          ${renderLegendItem("Default cards", mappings.defaultCardBase)}
          ${renderLegendItem("Page header / inset", mappings.pageModule.header)}
          ${renderLegendItem("Page footer", mappings.pageModule.footer)}
        </div>
        <div class="benchmark-legend__group">
          ${renderLegendItem("Offset background", mappings.offsetBackground)}
          ${renderLegendItem("Offset cards", mappings.offsetCardBase)}
          ${renderLegendItem("Offset header / inset", mappings.offsetModule.header)}
          ${renderLegendItem(
            "Offset footer",
            mappings.offsetModule.footer,
            theme === "dark" && mappings.offsetModule.footerClamped ? " (clamped)" : "",
          )}
          ${renderLegendItem("Tables / metrics", mappings.pageTableCard.base)}
        </div>
      </div>
    </details>
  `;
}

function bindEvents() {
  app.querySelectorAll('[data-action="benchmark-theme"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      updateBenchmarkUI({ theme: event.target.value });
    });
  });

  const defaultSelect = app.querySelector('[data-action="default-card"]');

  if (defaultSelect) {
    defaultSelect.addEventListener("change", (event) => {
      updateBenchmarkUI({ defaultCardBase: Number(event.target.value) });
    });
  }

  const railSelect = app.querySelector('[data-action="rail-step"]');

  if (railSelect) {
    railSelect.addEventListener("change", (event) => {
      const theme = app.dataset.activeTheme;
      updateBenchmarkUI({
        railSteps: {
          [theme]: Number(event.target.value),
        },
      });
    });
  }

  const offsetSelect = app.querySelector('[data-action="offset-step"]');

  if (offsetSelect) {
    offsetSelect.addEventListener("change", (event) => {
      const theme = app.dataset.activeTheme;
      updateBenchmarkUI({
        offsetSteps: {
          [theme]: Number(event.target.value),
        },
      });
    });
  }

  const resetButton = app.querySelector('[data-action="reset-benchmark"]');

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      resetBenchmarkPage();
    });
  }
}

function applyPreview(theme, surfaceValues) {
  const benchmarkRoot = app.querySelector("[data-preview-root]");

  if (benchmarkRoot) {
    applySurfaceVariables(benchmarkRoot, theme, surfaceValues);
  }
}

function render() {
  const state = getState();
  const theme = state.benchmarkUI.theme;
  const mappings = deriveBenchmarkMappings(theme, state.benchmarkUI);
  const cardOptions = buildSurfaceOptions(1).filter((option) => option.step <= 4);
  const surfaceOptions = buildSurfaceOptions();

  app.dataset.activeTheme = theme;
  app.innerHTML = `
    <section class="page-chrome">
      <a class="back-link" href="../">Hub</a>
      <p class="kicker">Prototype</p>
      <h1>Order History Benchmark</h1>
      <p class="lede">
        Benchmark a more realistic archive dashboard layout while keeping the shared surface ladder,
        a single default card anchor, and a small set of contextual controls.
      </p>
    </section>
    <section class="control-strip control-strip--benchmark">
      <div class="benchmark-controls">
        ${renderRadioGroup({
          legend: "Theme",
          name: "benchmark-theme",
          value: theme,
          action: "benchmark-theme",
          options: [
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ],
        })}
        ${renderSelect({
          label: "Default card level",
          action: "default-card",
          value: state.benchmarkUI.defaultCardBase,
          options: cardOptions,
        })}
        ${renderSelect({
          label: `${theme} rail`,
          action: "rail-step",
          value: state.benchmarkUI.railSteps[theme],
          options: surfaceOptions,
        })}
        ${renderSelect({
          label: `${theme} offset background`,
          action: "offset-step",
          value: state.benchmarkUI.offsetSteps[theme],
          options: surfaceOptions,
        })}
        <div class="control-group control-group--actions">
          <p class="control-label">State</p>
          <button class="action-button" type="button" data-action="reset-benchmark">Reset benchmark</button>
        </div>
      </div>
      ${renderLegend(theme, mappings)}
    </section>
    <section class="benchmark-page" data-preview-root data-theme-panel="${theme}">
      <div class="benchmark-layout">
        ${renderRail(theme, state.surfaceValues, mappings)}
        <div class="benchmark-main">
          <section class="benchmark-hero">
            <p class="benchmark-accent">Archive Systems</p>
            <h2 class="benchmark-title">Order History.</h2>
            ${renderManifestCard(state.surfaceValues, theme, mappings.pageModule)}
          </section>
          <section
            class="benchmark-offset-canvas"
            style="background: var(--surface-${mappings.offsetBackground}); color: ${getInkForStep(state.surfaceValues, theme, mappings.offsetBackground)};"
          >
            <div class="benchmark-offset-canvas__intro">
              <p class="benchmark-accent">Archive Systems</p>
              <h2 class="benchmark-title benchmark-title--offset">Order History.</h2>
            </div>
            ${renderManifestCard(state.surfaceValues, theme, mappings.offsetModule, {
              compact: true,
              offsetBackgroundStep: mappings.offsetBackground,
            })}
            ${renderLedgerCard(state.surfaceValues, theme, mappings.offsetTableCard, "Archive Ledger")}
            ${renderMetricStrip(state.surfaceValues, theme, mappings.offsetMetricsCard)}
          </section>
          ${renderLedgerCard(state.surfaceValues, theme, mappings.pageTableCard, "Archive Ledger")}
          ${renderMetricStrip(state.surfaceValues, theme, mappings.pageMetricsCard)}
        </div>
      </div>
    </section>
  `;

  bindEvents();
  applyPreview(theme, state.surfaceValues);
}

subscribe(render);
render();
