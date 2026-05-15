/**
 * Centralised taxonomies used across the salon catalog. Localised labels live
 * here so the same translation is reused in selectors, badges and filters.
 */

import {
  Scissors,
  Hand,
  Eye,
  Sparkles,
  Smile,
  Flower2,
  Palette,
  HeartPulse,
  Tag,
} from "lucide-react";

export const SERVICE_CATEGORIES = [
  { key: "hair", label: "Cabello", icon: Scissors },
  { key: "nails", label: "Uñas", icon: Hand },
  { key: "brows", label: "Cejas", icon: Eye },
  { key: "lashes", label: "Pestañas", icon: Sparkles },
  { key: "facial", label: "Facial", icon: Smile },
  { key: "spa", label: "Spa", icon: Flower2 },
  { key: "makeup", label: "Maquillaje", icon: Palette },
  { key: "wellness", label: "Wellness", icon: HeartPulse },
  { key: "other", label: "Otro", icon: Tag },
];

export const PRODUCT_TYPES = [
  "Shampoo",
  "Tratamiento",
  "Acondicionador",
  "Color",
  "Skincare",
  "Maquillaje",
  "Fragancia",
  "Herramienta",
  "Suplemento",
  "Otro",
];

export const CURRENCY_DEFAULT = "MXN";

export function categoryMeta(key) {
  return (
    SERVICE_CATEGORIES.find((c) => c.key === key) ||
    SERVICE_CATEGORIES[SERVICE_CATEGORIES.length - 1]
  );
}

export function formatPrice(cents, currency = CURRENCY_DEFAULT) {
  const value = Number(cents || 0) / 100;
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toFixed(0)} ${currency}`;
  }
}
