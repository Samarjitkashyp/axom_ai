// Run from the repo root: node next-frontend/tests/voice-speed.check.mjs   (Node 22.6+ strips the TypeScript types by itself)
import { parseSpeed, SPEED_MIN, SPEED_MAX } from '../lib/voiceSpeed.ts';

let fails = 0;
const t = (name, ok) => { if (!ok) { fails++; console.log('FAIL', name); } };

t('nothing saved is normal speed', parseSpeed(null) === 1 && parseSpeed(undefined) === 1 && parseSpeed('') === 1);
t('garbage is normal speed', parseSpeed('fast') === 1 && parseSpeed('NaN') === 1 && parseSpeed('Infinity') === 1);
t('a good value is kept', parseSpeed('1.25') === 1.25 && parseSpeed('0.75') === 0.75 && parseSpeed('1.5') === 1.5);
t('too slow and too fast are held at the edges', parseSpeed('0.1') === SPEED_MIN && parseSpeed('5') === SPEED_MAX);
t('steps of 0.05', parseSpeed('1.07') === 1.05 && parseSpeed('1.13') === 1.15);
console.log(fails ? fails + ' FAILED' : 'voice speed: all pass');
process.exit(fails ? 1 : 0);
