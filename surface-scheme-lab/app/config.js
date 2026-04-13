export const CUSTOM_IDENTITY_ID = "__custom";
export const DEFAULT_IDENTITY_ID = "studio-default";

export const MODES = ["light", "dark"];
export const RANGE_MODES = ["standard", "advanced"];

export const PAGES = [
  {
    id: "home",
    label: "Home",
  },
  {
    id: "identity-gallery",
    label: "Identity Gallery",
  },
];

export const INTENTIONS = [
  {
    id: "neutral",
    cssName: "neutral",
    schemeClass: "scheme-neutral",
    label: "Neutral",
    description: "Baseline UI surfaces and structural layout depth.",
  },
  {
    id: "brand",
    cssName: "brand",
    schemeClass: "scheme-brand",
    label: "Brand",
    description: "Primary emphasis surfaces for storytelling and product framing.",
  },
  {
    id: "neutralAlt",
    cssName: "neutral-alt",
    schemeClass: "scheme-neutral-alt",
    label: "Neutral Alt",
    description: "Inverse neutral surfaces for knockout moments and contained contrast.",
  },
  {
    id: "brandAlt",
    cssName: "brand-alt",
    schemeClass: "scheme-brand-alt",
    label: "Brand Alt",
    description: "Louder emphasis surfaces for spotlight states and high-interest moments.",
  },
];

export const CONTROLS = [
  {
    id: "hue",
    label: "Hue",
    step: 1,
    ranges: {
      standard: { min: 0, max: 360 },
      advanced: { min: 0, max: 360 },
    },
    hint: "Adjusts the family angle in OKLCH space.",
  },
  {
    id: "chroma",
    label: "Chroma",
    step: 0.001,
    ranges: {
      standard: { min: 0, max: 0.24 },
      advanced: { min: 0, max: 0.5 },
    },
    hint: "Controls how colorful the family feels overall.",
  },
  {
    id: "baselineLightness",
    label: "Baseline lightness",
    step: 0.001,
    ranges: {
      standard: { min: 0.12, max: 0.99 },
      advanced: { min: 0, max: 1 },
    },
    hint: "Sets where the default surface sits before derived levels spread away from it.",
  },
  {
    id: "spread",
    label: "Spread",
    step: 0.001,
    ranges: {
      standard: { min: 0, max: 0.08 },
      advanced: { min: 0, max: 0.12 },
    },
    hint: "Controls separation between raised, default, subtle, and sunken levels.",
  },
];

export const SURFACE_LEVEL_FACTORS = {
  raised: 0.85,
  default: 0,
  subtle: -1,
  sunken: -2.25,
};
