// How fast the Assamese voice (the read-aloud button) speaks: a slider in Settings, kept on this device only.
export const SPEED_KEY = 'axom_tts_speed';
export const SPEED_MIN = 0.75;
export const SPEED_MAX = 1.5;

/** A saved value as a speed between SPEED_MIN and SPEED_MAX (steps of 0.05); anything else means normal speed (1). */
export function parseSpeed(raw: string | null | undefined): number {
  const n = Number(raw);
  if (!raw || !isFinite(n)) return 1;
  const clamped = Math.min(SPEED_MAX, Math.max(SPEED_MIN, n));
  return Math.round(clamped * 20) / 20;
}

export function readSpeed(): number {
  try { return parseSpeed(localStorage.getItem(SPEED_KEY)); } catch (e) { return 1; }
}

export function saveSpeed(speed: number) {
  try { localStorage.setItem(SPEED_KEY, String(parseSpeed(String(speed)))); } catch (e) { /* private mode: it just is not remembered */ }
}
