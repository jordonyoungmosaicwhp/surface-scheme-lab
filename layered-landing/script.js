import {
  applySurfaceVariables,
  deriveBenchmarkMappings,
  getInkForStep,
  resolveSurfaceToken,
} from "../shared/surfaces.js";
import { getState, subscribe } from "../shared/state.js";

const app = document.querySelector("#app");

const fixedMappings = Object.freeze({
  defaultCardBase: 2,
  offsetSteps: {
    light: 4,
    dark: 1,
  },
  railSteps: {
    light: 0,
    dark: 0,
  },
});

const localState = {
  theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
};

function getMappings(theme) {
  return deriveBenchmarkMappings(theme, {
    theme,
    defaultCardBase: fixedMappings.defaultCardBase,
    offsetSteps: fixedMappings.offsetSteps,
    railSteps: fixedMappings.railSteps,
  });
}

function surfaceStyle(surfaceValues, theme, step) {
  return `background: var(--surface-${step}); color: ${getInkForStep(surfaceValues, theme, step)};`;
}

function renderTokenChip(label, step, subtle = false) {
  return `
    <span class="token-chip ${subtle ? "token-chip--subtle" : ""}">
      <span class="token-chip__swatch" style="background: var(--surface-${step});"></span>
      <span>${label} -> ${resolveSurfaceToken(step)}</span>
    </span>
  `;
}

function renderThemeButtons(activeTheme) {
  return `
    <div class="theme-toggle" role="group" aria-label="Appearance">
      <button
        class="theme-button ${activeTheme === "light" ? "is-active" : ""}"
        type="button"
        data-theme-button="light"
        aria-pressed="${String(activeTheme === "light")}"
      >
        Light
      </button>
      <button
        class="theme-button ${activeTheme === "dark" ? "is-active" : ""}"
        type="button"
        data-theme-button="dark"
        aria-pressed="${String(activeTheme === "dark")}"
      >
        Dark
      </button>
    </div>
  `;
}

function renderShowcaseCard(
  surfaceValues,
  theme,
  card,
  {
    eyebrow,
    title,
    copy,
    points = [],
    insetTitle,
    insetCopy,
    bandLabel,
    footerLabel,
    className = "",
  },
) {
  return `
    <article class="layer-card ${className}">
      <div class="layer-card__band" style="${surfaceStyle(surfaceValues, theme, card.header)}">
        <p class="surface-note">${bandLabel} -> ${resolveSurfaceToken(card.header)}</p>
      </div>
      <div class="layer-card__body" style="${surfaceStyle(surfaceValues, theme, card.base)}">
        <div class="layer-card__copy">
          <p class="eyebrow">${eyebrow}</p>
          <h3>${title}</h3>
          <p class="body-copy">${copy}</p>
          ${
            points.length
              ? `
                <ul class="card-points">
                  ${points.map((point) => `<li>${point}</li>`).join("")}
                </ul>
              `
              : ""
          }
        </div>
        <div class="quiet-inset" style="${surfaceStyle(surfaceValues, theme, card.inset)}">
          <p class="surface-note">Quiet inset -> ${resolveSurfaceToken(card.inset)}</p>
          <p class="quiet-inset__title">${insetTitle}</p>
          <p class="quiet-inset__copy">${insetCopy}</p>
        </div>
      </div>
      <div class="layer-card__footer" style="${surfaceStyle(surfaceValues, theme, card.footer)}">
        <p class="surface-note">${footerLabel} -> ${resolveSurfaceToken(card.footer)}</p>
      </div>
    </article>
  `;
}

function renderMetricDeck(surfaceValues, theme, card, items) {
  return `
    <div class="metric-grid">
      ${items
        .map(
          (item) => `
            <article class="metric-card" style="${surfaceStyle(surfaceValues, theme, card.inset)}">
              <p class="surface-note">${item.label}</p>
              <p class="metric-card__value">${item.value}</p>
              <p class="metric-card__copy">${item.copy}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function bindEvents() {
  app.querySelectorAll("[data-theme-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = button.dataset.themeButton;

      if (nextTheme === localState.theme) {
        return;
      }

      localState.theme = nextTheme;
      render();
    });
  });
}

function syncPreview(theme, surfaceValues) {
  document.documentElement.style.colorScheme = theme;
  document.documentElement.dataset.theme = theme;
  applySurfaceVariables(document.body, theme, surfaceValues);
}

function render() {
  const { surfaceValues } = getState();
  const theme = localState.theme;
  const mappings = getMappings(theme);
  const offsetDescription =
    theme === "light"
      ? "Light mode pushes the offset section deeper so grouped content reads as a clear field against the open page."
      : "Dark mode keeps the offset close to the canvas and lifts the cards above it so the section stays distinct without getting muddy.";

  syncPreview(theme, surfaceValues);

  app.innerHTML = `
    <div class="site-shell">
      <header class="masthead">
        <a class="back-link" href="../">Hub</a>
        <div class="masthead__meta">
          <p class="eyebrow">Prototype</p>
          <p class="masthead__title">Layered Landing Benchmark</p>
        </div>
        ${renderThemeButtons(theme)}
      </header>

      <section class="hero">
        <div class="hero__copy">
          <p class="eyebrow">Level-zero landing page</p>
          <h1>Keep the page open. Let the offset sections gather the weight.</h1>
          <p class="lede">
            This study borrows the editorial rhythm of Surface Scheme Lab, then swaps in the
            contextual mapping model. The page background stays at ${resolveSurfaceToken(mappings.pageBackground)},
            default cards share ${resolveSurfaceToken(mappings.defaultCardBase)}, and offset sections do the heavier grouping.
          </p>
          <div class="token-row">
            ${renderTokenChip("Page background", mappings.pageBackground)}
            ${renderTokenChip("Default card", mappings.defaultCardBase)}
            ${renderTokenChip("Offset section", mappings.offsetBackground)}
          </div>
        </div>

        <div class="hero__panel">
          ${renderShowcaseCard(surfaceValues, theme, mappings.pageModule, {
            eyebrow: "Current structure",
            title: "A small set of steps can carry the whole composition.",
            copy:
              "The page background stays calm while shared default cards hold the primary content. Secondary information stays inside the card family instead of becoming another section layer.",
            points: [
              "Page background remains consistent across the whole page.",
              "Default cards share one anchor so the layout feels coherent.",
              "Quiet inset and supporting bands separate information without changing the page structure.",
            ],
            insetTitle: "Most of the contrast work should happen inside the active card family.",
            insetCopy:
              "That keeps the page background clean and gives the offset section a clear job when denser content needs to collect.",
            bandLabel: "Supporting band",
            footerLabel: "Return band",
            className: "layer-card--hero",
          })}
        </div>
      </section>

      <section class="section-block">
        <div class="section-head">
          <p class="eyebrow">Page background</p>
          <h2>Default cards stay readable without crowding the canvas.</h2>
          <p class="section-copy">
            The outer page remains level zero. Default cards can carry the product story, proof points,
            and supporting details while still letting the background breathe.
          </p>
          <div class="token-row">
            ${renderTokenChip("Page background", mappings.pageBackground, true)}
            ${renderTokenChip("Card family", mappings.pageModule.base, true)}
          </div>
        </div>

        <div class="card-grid card-grid--page">
          ${renderShowcaseCard(surfaceValues, theme, mappings.pageTableCard, {
            eyebrow: "Primary message",
            title: "Use the default card for the strongest promise on the page.",
            copy:
              "It can hold product framing, launch messaging, or a dense editorial block while still feeling anchored to the page background instead of detached from it.",
            points: [
              "The same base step can support long-form copy and short calls to action.",
              "The upper band can introduce a section without turning into a separate surface family.",
              "The footer band can return metadata or links closer to the page background.",
            ],
            insetTitle: "Quiet inset keeps the details inside the same card relationship.",
            insetCopy:
              "Short notes, secondary stats, or compact media descriptions can sit here without needing a new structural layer.",
            bandLabel: "Section band",
            footerLabel: "Supporting band",
          })}

          ${renderShowcaseCard(surfaceValues, theme, mappings.pageMetricsCard, {
            eyebrow: "Supporting story",
            title: "A second default card can stay simple and still feel connected.",
            copy:
              "The goal is not to create many layers. The goal is to make each transition legible so the page remains spacious even when the content gets richer.",
            points: [
              "The page background never has to compete with the cards.",
              "Shared defaults make the layout easier to compare across themes.",
              "Spacing does as much visual work as the surfaces themselves.",
            ],
            insetTitle: "If the difference is hard to see, the composition is probably too dense.",
            insetCopy:
              "This prototype deliberately leaves room around each block so the step changes remain easy to judge.",
            bandLabel: "Context band",
            footerLabel: "Reference band",
          })}
        </div>
      </section>

      <section class="offset-stage" style="${surfaceStyle(surfaceValues, theme, mappings.offsetBackground)}">
        <div class="section-head section-head--offset">
          <p class="eyebrow">Offset section</p>
          <h2>Grouped content moves into a deeper field without changing the overall system.</h2>
          <p class="section-copy">${offsetDescription}</p>
          <div class="token-row">
            ${renderTokenChip("Offset section", mappings.offsetBackground, true)}
            ${renderTokenChip("Offset card", mappings.offsetCardBase, true)}
          </div>
        </div>

        <div class="card-grid card-grid--offset">
          ${renderShowcaseCard(surfaceValues, theme, mappings.offsetModule, {
            eyebrow: "Grouped details",
            title: "Cards inside the offset still follow the same logic as the page-level cards.",
            copy:
              "The surface relationship stays contextual. In dark mode especially, the card family is kept above the offset field so the section remains distinct and usable.",
            points: [
              "The active offset is fixed for this prototype so the composition stays stable.",
              "The card family resolves from the same shared mapping behavior used elsewhere in the hub.",
              "The offset is structural, not decorative.",
            ],
            insetTitle: "The section can get denser without making the page feel noisy.",
            insetCopy:
              "That is the main role of the offset field. It collects related material and gives it a different resting place than the open page.",
            bandLabel: "Offset header",
            footerLabel: "Offset return",
          })}

          ${renderShowcaseCard(surfaceValues, theme, mappings.offsetTableCard, {
            eyebrow: "Comparison block",
            title: "This is where tables, grouped features, or dense explanations belong.",
            copy:
              "The page background stays available for breathing room while the offset section handles the more concentrated blocks. That makes the overall hierarchy feel calm instead of stacked for its own sake.",
            points: [
              "The card base stays separated from the offset field.",
              "The inset can carry secondary evidence or definitions.",
              "The bands can frame tools, captions, or navigation inside the section.",
            ],
            insetTitle: "Same model, different context.",
            insetCopy:
              "The page and offset do not need two competing surface systems. They need one system that resolves differently based on context.",
            bandLabel: "Offset context",
            footerLabel: "Offset footer",
          })}
        </div>

        ${renderMetricDeck(surfaceValues, theme, mappings.offsetMetricsCard, [
          {
            label: "Current page background",
            value: resolveSurfaceToken(mappings.pageBackground),
            copy: "Level zero remains the open canvas around the section.",
          },
          {
            label: "Current offset field",
            value: resolveSurfaceToken(mappings.offsetBackground),
            copy: "The active section step changes with the theme, but the role stays the same.",
          },
          {
            label: "Offset card family",
            value: resolveSurfaceToken(mappings.offsetCardBase),
            copy: "Cards stay distinct from the field, especially in dark mode.",
          },
        ])}
      </section>

      <section class="section-block section-block--closing">
        <div class="section-head">
          <p class="eyebrow">Back on the page background</p>
          <h2>Returning to level zero should feel like a release, not a collapse.</h2>
          <p class="section-copy">
            After an offset section, the page can open back up without adding more chrome. The background does less,
            the cards stay consistent, and the differences remain easy to judge at a glance.
          </p>
        </div>

        <div class="closing-grid">
          <article class="closing-note" style="${surfaceStyle(surfaceValues, theme, mappings.pageMetricsCard.base)}">
            <p class="surface-note">Default card -> ${resolveSurfaceToken(mappings.pageMetricsCard.base)}</p>
            <h3>What this benchmark is testing.</h3>
            <ul class="card-points">
              <li>Whether level-zero page backgrounds stay clean enough to compare across themes.</li>
              <li>Whether offset fields feel structural rather than ornamental.</li>
              <li>Whether default cards remain the stable anchor across both contexts.</li>
            </ul>
          </article>

          <article class="closing-quote" style="${surfaceStyle(surfaceValues, theme, mappings.pageModule.footer)}">
            <p class="surface-note">Supporting band -> ${resolveSurfaceToken(mappings.pageModule.footer)}</p>
            <p class="closing-quote__copy">
              Clean, simple, and spacious is not a styling preference here. It is the condition that makes the color differences visible enough to judge.
            </p>
          </article>
        </div>
      </section>
    </div>
  `;

  bindEvents();
}

subscribe(render);
render();
