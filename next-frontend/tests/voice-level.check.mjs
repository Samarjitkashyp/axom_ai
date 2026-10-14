// Run from the repo root: node next-frontend/tests/voice-level.check.mjs   (Node 22.6+ strips the TypeScript types by itself)
import { noiseFloor, speechThreshold, followFloor, FLOOR_CAP, MAX_THRESHOLD, MIN_THRESHOLD } from '../lib/voiceLevel.ts';

let fails = 0;
const t = (name, ok) => { if (!ok) { fails++; console.log('FAIL', name); } };
const heard = (floor, level) => level > speechThreshold(floor);

// a quiet room: the limit is the minimum
const quiet = noiseFloor([0.003, 0.004, 0.003, 0.004, 0.003]);
t('quiet room floor is small', quiet < 0.005);
t('quiet room: ordinary speech (0.05) is heard', heard(quiet, 0.05));
t('quiet room: its own noise is not speech', !heard(quiet, 0.004));

// the person starts talking at once: the first half second is speech
const early = noiseFloor([0.12, 0.15, 0.09, 0.14, 0.11]);
t('early speech cannot push the floor above the cap', early <= FLOOR_CAP);
t('early speech: the limit stays a limit speech can pass', speechThreshold(early) <= MAX_THRESHOLD && heard(early, 0.08));
// the old way: mean of all samples (0.122) * 2.5 = 0.31, so a level of 0.15 would never count as speech
t('the old way would have missed this speech', 0.122 * 2.5 > 0.15);

// a noisy room (fan, traffic)
const noisy = noiseFloor([0.015, 0.016, 0.014, 0.015, 0.016]);
t('noisy room: speech well above the noise is heard', heard(noisy, 0.08));
t('noisy room: the noise alone is not speech', !heard(noisy, 0.016));

// the first samples are mixed: speech then silence
const mixed = noiseFloor([0.2, 0.18, 0.004, 0.003, 0.004]);
t('mixed start: the quiet samples decide', mixed < 0.01);

// edge cases
t('no samples', noiseFloor([]) === 0);
t('garbage samples are ignored', noiseFloor([NaN, -1, 0.004]) === 0.004);
t('limit is never below the minimum', speechThreshold(0) === MIN_THRESHOLD);

// following the room down, never up
t('goes down with the room', followFloor(0.02, 0.004) < 0.02);
t('does not go up with a loud moment', followFloor(0.01, 0.2) === 0.01);

console.log(fails ? fails + ' FAILED' : 'voice level: all pass');
process.exit(fails ? 1 : 0);
