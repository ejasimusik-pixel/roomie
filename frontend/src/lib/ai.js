/**
 * ROOMIE — AI scaffolding (lightweight stubs)
 * ----------------------------------------------------------------------------
 * This module is intentionally thin: it defines the contracts Roomie will use
 * when real model integrations land. Today every function returns
 * `{ data: null, mocked: true }` so the UI can wire its hooks now and we'll
 * swap implementations later without touching call-sites.
 *
 * Vendor-agnostic by design: no provider names leak into the signatures.
 * Coverage targeted (not just hair): hair, nails, brows, lashes, facial, spa,
 * makeup, wellness, skincare.
 */

const PLACEHOLDER = Object.freeze({ data: null, mocked: true });

/**
 * Extract a product (name, brand, type, recommended_for) from an image.
 * Future: vision model → structured JSON.
 */
export async function extractProductFromImage(_file) {
  return { ...PLACEHOLDER, hint: "AI product extraction from image (coming soon)" };
}

/**
 * Extract a product from a public URL (Sephora, Mercado Libre, brand sites).
 * Future: scrape + LLM normalisation.
 */
export async function extractProductFromUrl(_url) {
  return { ...PLACEHOLDER, hint: "AI product extraction from URL (coming soon)" };
}

/**
 * Suggest services the salon could add based on its current catalog and
 * inferred audience. Returns an array of suggestion objects shaped like:
 * `{ category, name, rationale }`.
 */
export async function suggestServicesForSalon(_salon, _existingServices) {
  return { ...PLACEHOLDER, suggestions: [] };
}

/**
 * Suggest a friendly Roomie-tone reply for a client message, scoped to the
 * salon's `roomie_personality` (tone/style/emoji_level/sales_style).
 */
export async function composeRoomieReply(_salon, _context) {
  return { ...PLACEHOLDER, reply: null };
}

export const AI_READY = false;
