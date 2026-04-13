# Surface Color Prototype Hub

A no-build static site for experimenting with neutral surface ladders and contextual mappings across light and dark themes.

## Structure

- `/` is the hub page.
- `/primitives/` is the Primitive Inspector.
- `/mapping/` is the Contextual Mapping Lab.
- `/order-history/` is the Order History Benchmark.
- `/surface-scheme-lab/` is an isolated imported prototype for tuning semantic surface schemes across identities.
- `/layered-landing/` is a spacious landing-page benchmark that applies the contextual page and offset layering model.
- `/default-offset-fill-study/` is a one-page fill comparison tool for testing badges across default and offset surfaces in Light, Dark A, and Dark B.
- `/shared/` contains shared CSS and ES modules.

The `surface-scheme-lab` prototype is intentionally self-contained. Its HTML, CSS, JavaScript,
and app modules live within that directory so it can evolve independently from the shared hub
runtime used by the other prototypes.

## Local Preview

Serve the repository with any static file server so ES module imports and local storage behave normally.

Examples:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

## Hosting

The site does not require a build step. Upload the repository contents as static files to any host that serves directories with `index.html`.

## GitHub Pages

This project is already structured for GitHub Pages:

- keep the repository root as the published folder
- enable Pages for the branch you want to publish
- use the generated Pages URL as the hub entry point

All links and module imports are relative, so subpages continue to work when served from a repository subpath.
