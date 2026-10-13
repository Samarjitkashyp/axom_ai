// Run from the repo root: node next-frontend/tests/voice-input.check.js  (voice input in the chat: no doubled text, noise handling)
const fs = require('fs');
const src = fs.readFileSync('next-frontend/components/chat/ChatWindow.jsx', 'utf8');
const a = src.indexOf('const micStreamRef = useRef(null);');
const b = src.indexOf('const langCode = () =>');
const block = src.slice(a, b);
let fails = 0; const t = (n, c) => { if (!c) { fails++; console.log('FAIL', n); } };

async function scenario({ inputText = '', takesTrack = false, permission = 'ok', events = [] }) {
  const state = { input: inputText, listening: false, error: '', trackUsed: false, stopped: 0, started: 0, startArg: undefined };
  class FakeSR {
    constructor() { FakeSR.last = this; }
    start(arg) { state.started++; state.startArg = arg; this.onstart && this.onstart(); }
    stop() { this.onend && this.onend(); }
  }
  if (takesTrack) FakeSR.available = () => Promise.resolve('available');
  const track = { stop: () => { state.stopped++; } };
  const nav = { mediaDevices: { getUserMedia: async () => { if (permission === 'denied') { const e = new Error('x'); e.name = 'NotAllowedError'; throw e; } return { getTracks: () => [track], getAudioTracks: () => [track] }; } } };
  const refs = {};
  const useRef = (v) => (refs[Math.random()] = { current: v });
  const win = { SpeechRecognition: FakeSR };
  const ctx = new Function('useRef', 'window', 'navigator', 'recognitionRef', 'isListening', 'inputText', 'setInputText', 'setIsListening', 'setErrorMsg', 'langCode',
    block + '; return { toggleSpeechRecognition, releaseMic };');
  const recRef = { current: null };
  let listening = false;
  const api = ctx(useRef, win, nav, recRef, false, inputText, (v) => { state.input = typeof v === 'function' ? v(state.input) : v; }, (v) => { listening = v; state.listening = v; }, (m) => { state.error = m; }, () => 'en-IN');
  await api.toggleSpeechRecognition();
  const rec = FakeSR.last;
  for (const ev of events) rec.onresult && rec.onresult({ results: ev });
  return { state, rec, recRef };
}
const R = (text, isFinal = false, confidence = 0.9) => { const r = [{ transcript: text, confidence }]; r.isFinal = isFinal; return r; };

(async () => {
  // the reported problem: growing interim results must not pile up
  let r = await scenario({ events: [[R('How')], [R('How are')], [R('How are you')], [R('How are you', true)]] });
  t('"How are you" is not doubled', r.state.input === 'How are you');
  r = await scenario({ events: [[R('how')], [R('how are')]] });
  t('interim text is shown while speaking', r.state.input === 'how are');
  r = await scenario({ inputText: 'Hello', events: [[R('How')], [R('How are you', true)]] });
  t('typed text before is kept, voice follows it once', r.state.input === 'Hello How are you');
  r = await scenario({ inputText: 'Hello  ', events: [[R('Hi', true)]] });
  t('trailing spaces of the typed text are tidied', r.state.input === 'Hello Hi');
  // two phrases in one go (the recogniser can hold several results): they follow each other, once
  r = await scenario({ events: [[R('How are you', true), R(' I am fine')]] });
  t('two results are joined once', r.state.input === 'How are you I am fine');
  // noise heard as words: a finished phrase with low confidence is dropped, an unknown confidence (0) is kept
  r = await scenario({ events: [[R('hmm kss', true, 0.12)]] });
  t('low-confidence finished phrase is dropped', r.state.input === '');
  r = await scenario({ events: [[R('good morning', true, 0)]] });
  t('unknown confidence (some browsers report 0) is kept', r.state.input === 'good morning');
  r = await scenario({ events: [[R('how are you', true, 0.8), R('zzt', true, 0.1)]] });
  t('only the noisy part is dropped', r.state.input === 'how are you');
  // old browsers: plain start(), no microphone stream opened
  r = await scenario({ takesTrack: false });
  t('no track support: plain start()', r.state.startArg === undefined && r.state.started === 1);
  // new browsers: the noise-suppressed track is given to the recogniser, and the stream is released at the end
  r = await scenario({ takesTrack: true });
  t('track support: start(track)', r.state.startArg && typeof r.state.startArg.stop === 'function');
  r.rec.onend();
  t('microphone stream is released when listening ends', r.state.stopped === 1 && r.state.listening === false);
  // permission denied
  r = await scenario({ takesTrack: true, permission: 'denied' });
  t('denied microphone: message and no recogniser started', /allow microphone/i.test(r.state.error) && r.state.started === 0);
  // error event
  r = await scenario({ takesTrack: true });
  r.rec.onerror({ error: 'not-allowed' });
  t('recogniser error releases the microphone and tells the person', r.state.stopped === 1 && /microphone/i.test(r.state.error));
  r = await scenario({ takesTrack: true });
  r.rec.onerror({ error: 'no-speech' });
  t('"no speech" is silent', r.state.error === '' && r.state.stopped === 1);
  console.log(fails ? fails + ' FAILED' : 'voice input: all pass');
  process.exit(fails ? 1 : 0);
})();
