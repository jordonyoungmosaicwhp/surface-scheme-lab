import { prototypeRegistry } from "./registry.js";

const app = document.querySelector("#app");

app.innerHTML = `
  <section class="page-chrome">
    <p class="kicker">Surface Color Prototype Hub</p>
    <h1>Prototype index</h1>
    <p class="lede">
      Diagnostic prototypes for exploring neutral surface ladders and contextual mappings
      across light and dark themes.
    </p>
  </section>
  <section class="hub-grid" aria-label="Prototype list">
    ${prototypeRegistry
      .map(
        (prototype) => `
          <a class="hub-card" href="${prototype.path}">
            <p class="kicker">Prototype</p>
            <h2>${prototype.title}</h2>
            <p>${prototype.description}</p>
          </a>
        `,
      )
      .join("")}
  </section>
`;
