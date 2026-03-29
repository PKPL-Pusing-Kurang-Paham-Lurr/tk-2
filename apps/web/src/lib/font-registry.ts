export const FONT_REGISTRY = [
  {
    id: "architects-daughter",
    name: "Architects Daughter",
    googleFamily: "Architects+Daughter",
    category: "handwriting",
    cssVariable: "var(--font-architects-daughter)",
  },
  {
    id: "merriweather",
    name: "Merriweather",
    googleFamily: "Merriweather",
    category: "serif",
    cssVariable: "var(--font-merriweather)",
  },
  {
    id: "courier-prime",
    name: "Courier Prime",
    googleFamily: "Courier+Prime",
    category: "monospace",
    cssVariable: "var(--font-courier-prime)",
  },
  {
    id: "roboto",
    name: "Roboto",
    googleFamily: "Roboto",
    category: "sans-serif",
    cssVariable: "var(--font-roboto)",
  },
  {
    id: "playfair-display",
    name: "Playfair Display",
    googleFamily: "Playfair+Display",
    category: "serif",
    cssVariable: "var(--font-playfair-display)",
  },
  {
    id: "lobster",
    name: "Lobster",
    googleFamily: "Lobster",
    category: "display",
    cssVariable: "var(--font-lobster)",
  },
  {
    id: "pacifico",
    name: "Pacifico",
    googleFamily: "Pacifico",
    category: "handwriting",
    cssVariable: "var(--font-pacifico)",
  },
  {
    id: "source-code-pro",
    name: "Source Code Pro",
    googleFamily: "Source+Code+Pro",
    category: "monospace",
    cssVariable: "var(--font-source-code-pro)",
  },
] as const;

export type FontId = (typeof FONT_REGISTRY)[number]["id"];

export function getFontById(id: string) {
  return FONT_REGISTRY.find((font) => font.id === id) ?? FONT_REGISTRY[0];
}
