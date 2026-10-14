// Voice typing decides "the person is speaking" when the microphone level is clearly above the room's own noise.
// The noise is measured in the first moments after the microphone opens. If the person starts talking at once, that measurement holds
// speech, the limit gets too high and nothing is ever heard as speech ("nothing happened"). So: only the quietest samples count, the
// result is capped at a value a quiet-to-noisy room can reach (never speech), and it follows the room down when it gets quieter.

export const FLOOR_CAP = 0.03;          // root-mean-square level (0 to 1). Rooms are 0.002 to 0.02, speech 0.04 and up.
export const MIN_THRESHOLD = 0.015;
export const MAX_THRESHOLD = 0.06;       // the limit never goes above ordinary quiet speech

/** The room's noise level from the first samples: the average of the quietest half, at most FLOOR_CAP. */
export function noiseFloor(samples: number[]): number {
  const s = samples.filter((x) => isFinite(x) && x >= 0).sort((a, b) => a - b);
  if (!s.length) return 0;
  const quiet = s.slice(0, Math.max(1, Math.ceil(s.length / 2)));
  const avg = quiet.reduce((a, b) => a + b, 0) / quiet.length;
  return Math.min(avg, FLOOR_CAP);
}

/** A level above this counts as speech. */
export function speechThreshold(floor: number): number {
  return Math.min(MAX_THRESHOLD, Math.max(floor * 2.5, MIN_THRESHOLD));
}

/** The floor follows the room down (a quieter moment) but never up (a louder moment may be speech). */
export function followFloor(floor: number, level: number): number {
  return level < floor ? floor * 0.8 + level * 0.2 : floor;
}
