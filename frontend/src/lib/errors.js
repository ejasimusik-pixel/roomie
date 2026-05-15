/**
 * Maps raw Supabase error messages to user-facing Spanish copy.
 * Falls back to the original message when the code isn't covered, so we don't
 * silently swallow new errors.
 */
const MAP = [
  [/invalid login credentials/i, "Correo o contraseña incorrectos."],
  [/email not confirmed/i, "Tu correo aún no está confirmado. Revisa tu bandeja de entrada."],
  [/user already registered/i, "Este correo ya está registrado. Inicia sesión."],
  [/user not found/i, "No encontramos una cuenta con ese correo."],
  [/password should be at least 6 characters/i, "La contraseña debe tener al menos 6 caracteres."],
  [/password should be at least \d+ characters/i, "La contraseña es demasiado corta."],
  [/rate limit/i, "Has hecho demasiados intentos. Espera unos minutos."],
  [/network request failed|failed to fetch|networkerror/i, "No pudimos conectar con el servidor. Revisa tu conexión."],
  [/signup is disabled/i, "Los registros están temporalmente cerrados."],
  [/database error saving new user/i, "No pudimos crear tu cuenta. Intenta de nuevo en unos segundos."],
];

export function mapSupabaseError(error) {
  if (!error) return null;
  const msg = (error.message || error.toString() || "").trim();
  if (!msg) return "Ha ocurrido un error. Intenta de nuevo.";
  for (const [pattern, friendly] of MAP) {
    if (pattern.test(msg)) return friendly;
  }
  return msg;
}
