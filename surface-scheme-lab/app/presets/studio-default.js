export const studioDefault = {
  id: "studio-default",
  label: "Studio Default",
  description: "Balanced surfaces with restrained neutral structure and strong contrast support for alternate families.",
  modes: {
    light: {
      neutral: {
        hue: 236,
        chroma: 0.016,
        baselineLightness: 0.972,
        spread: 0.026,
      },
      neutralAlt: {
        hue: 236,
        chroma: 0.034,
        baselineLightness: 0.332,
        spread: 0.055,
      },
      brand: {
        hue: 246,
        chroma: 0.11,
        baselineLightness: 0.968,
        spread: 0.028,
      },
      brandAlt: {
        hue: 244,
        chroma: 0.052,
        baselineLightness: 0.372,
        spread: 0.061,
      },
    },
    dark: {
      neutral: {
        hue: 236,
        chroma: 0.017,
        baselineLightness: 0.276,
        spread: 0.031,
      },
      neutralAlt: {
        hue: 236,
        chroma: 0.036,
        baselineLightness: 0.296,
        spread: 0.05,
      },
      brand: {
        hue: 246,
        chroma: 0.1,
        baselineLightness: 0.29,
        spread: 0.033,
      },
      brandAlt: {
        hue: 244,
        chroma: 0.054,
        baselineLightness: 0.332,
        spread: 0.056,
      },
    },
  },
};
