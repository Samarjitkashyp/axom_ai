// Run from the repo root: node next-frontend/tests/stt-front.check.js
// Checks the chat's voice input (server voice typing with the browser's own recognition as the fallback) against fake microphone,
// recorder, clock and server, so that the whole decision logic runs without a browser.
const fs = require('fs');
const src = fs.readFileSync('next-frontend/components/chat/ChatWindow.jsx', 'utf8');
const a = src.indexOf('const VOICE_VAD');
const b = src.indexOf('const langCode = () =>');
const block = src.slice(a, b);
let fails = 0;
const t = (name, ok) => { if (!ok) { fails++; console.log('FAIL', name); } };

async function scenario(o = {}) {
  const w = {
    now: 1000000, level: 0, intervals: [], fetchCalls: [], error: '', input: o.inputText || '', listening: false, transcribing: false,
    stoppedTracks: 0, browserStarted: 0, recorders: [], appended: [],
  };
  class FakeMediaRecorder {
    constructor(stream, opts) { this.stream = stream; this.opts = opts; this.state = 'inactive'; this.mimeType = (opts && opts.mimeType) || 'audio/webm'; w.recorders.push(this); }
    start() { this.state = 'recording'; }
    stop() { if (this.state === 'inactive') return; this.state = 'inactive'; this.ondataavailable && this.ondataavailable({ data: { size: 1000 } }); this.onstop && this.onstop(); }
    static isTypeSupported(m) { return m === 'audio/webm;codecs=opus'; }
  }
  class FakeAudioContext {
    createMediaStreamSource() { return { connect() {} }; }
    createAnalyser() { return { fftSize: 1024, getFloatTimeDomainData(buf) { buf.fill(w.level); } }; }
    close() { this.closed = true; }
  }
  class FakeSR {
    start() { w.browserStarted++; this.onstart && this.onstart(); }
    stop() { this.onend && this.onend(); }
  }
  const track = { stop() { w.stoppedTracks++; } };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  const nav = { mediaDevices: { getUserMedia: async (c) => { w.constraints = c; if (o.permission === 'denied') { const e = new Error('x'); e.name = 'NotAllowedError'; throw e; } if (o.permission === 'none') { const e = new Error('x'); e.name = 'NotFoundError'; throw e; } return stream; } } };
  const win = { AudioContext: FakeAudioContext, SpeechRecognition: FakeSR };
  if (!o.noRecorder) win.MediaRecorder = FakeMediaRecorder;
  const fakeFetch = async (url, init) => {
    w.fetchCalls.push({ url, init });
    if (o.fetchThrows) throw new Error('offline');
    const r = o.reply || { status: 200, body: { success: true, text: 'How are you' } };
    return { ok: r.status === 200, status: r.status, json: async () => r.body };
  };
  class FakeBlob { constructor(parts, opts) { this.parts = parts; this.type = (opts && opts.type) || ''; this.size = 1000; } }
  class FakeFormData { constructor() { this.items = {}; } append(k, v, n) { this.items[k] = { v, n }; } }
  const D = { now: () => w.now };
  const setInterval_ = (fn, ms) => { const id = w.intervals.length + 1; w.intervals.push({ id, fn, ms, on: true }); return id; };
  const clearInterval_ = (id) => { const x = w.intervals.find((i) => i.id === id); if (x) x.on = false; };
  // like React: useRef gives the same object on every render (by the order of the calls)
  const store = [];
  let n = 0;
  const useRef = (v) => { const i = n++; if (!store[i]) store[i] = { current: v }; return store[i]; };
  const state = { isListening: false, isTranscribing: false };
  const names = ['useRef', 'window', 'navigator', 'Date', 'setInterval', 'clearInterval', 'fetch', 'FormData', 'Blob', 'language', 'inputText',
    'recognitionRef', 'setInputText', 'setIsListening', 'setIsTranscribing', 'setErrorMsg', 'langCode', 'isListening', 'isTranscribing'];
  const fn0 = new Function(...names, block + '; return { toggleSpeechRecognition, sttModeRef, VOICE_VAD };');
  const fn = (...args) => { n = 0; return fn0(...args); };
  const api = fn(useRef, win, nav, D, setInterval_, clearInterval_, fakeFetch, FakeFormData, FakeBlob, o.language || 'assamese', o.inputText || '',
    { current: null }, (v) => { w.input = v; }, (v) => { w.listening = v; state.isListening = v; }, (v) => { w.transcribing = v; state.isTranscribing = v; },
    (m) => { w.error = m; }, () => 'as-IN', false, false);
  if (o.mode) api.sttModeRef.current = o.mode;
  // `isListening` is a render value in the real component: a second tap sees the new value because React re-renders; here it is passed again
  const again = () => fn(useRef, win, nav, D, setInterval_, clearInterval_, fakeFetch, FakeFormData, FakeBlob, o.language || 'assamese', o.inputText || '',
    { current: null }, (v) => { w.input = v; }, (v) => { w.listening = v; state.isListening = v; }, (v) => { w.transcribing = v; state.isTranscribing = v; },
    (m) => { w.error = m; }, () => 'as-IN', state.isListening, state.isTranscribing);
  // advance the fake clock and run the level meter
  const run = async (ms, level) => {
    w.level = level;
    for (let t0 = 0; t0 < ms; t0 += 100) {
      w.now += 100;
      w.intervals.filter((i) => i.on).forEach((i) => i.fn());
    }
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  };
  return { w, api, again, run, FakeSR, state };
}

(async () => {
  // 1. the person speaks, then pauses: the recording stops by itself and the text arrives once, after what was typed before
  let s = await scenario({ inputText: 'Hello' });
  await s.api.toggleSpeechRecognition();
  t('1 listening starts', s.w.listening === true && s.w.recorders.length === 1 && s.w.recorders[0].state === 'recording');
  t('1 asked for noise suppression, echo cancellation and gain control', s.w.constraints.audio.noiseSuppression === true && s.w.constraints.audio.echoCancellation === true && s.w.constraints.audio.autoGainControl === true);
  await s.run(600, 0.001);                                   // the room: calibration
  await s.run(1000, 0.2);                                    // speech
  t('1 still recording while speaking', s.w.recorders[0].state === 'recording');
  await s.run(2000, 0.001);                                  // pause > 1.6 s
  t('1 stopped by itself after the pause', s.w.recorders[0].state === 'inactive' && s.w.listening === false);
  t('1 the recording went to the server with the language', s.w.fetchCalls.length === 1 && s.w.fetchCalls[0].url === '/api/stt/' &&
    s.w.fetchCalls[0].init.body.items.language.v === 'assamese' && s.w.fetchCalls[0].init.body.items.audio.n === 'speech.webm');
  t('1 typed text is kept and the voice text follows once', s.w.input === 'Hello How are you');
  t('1 microphone released', s.w.stoppedTracks === 1);
  t('1 not stuck on "writing down"', s.w.transcribing === false);

  // 2. nobody speaks: stops after the wait, nothing is sent
  s = await scenario();
  await s.api.toggleSpeechRecognition();
  await s.run(9000, 0.001);
  t('2 stops when nothing is said', s.w.recorders[0].state === 'inactive' && s.w.fetchCalls.length === 0);
  t('2 says so', /did not hear/i.test(s.w.error));
  t('2 microphone released', s.w.stoppedTracks === 1);

  // 3. a tap while recording stops it and sends what was said
  s = await scenario();
  await s.api.toggleSpeechRecognition();
  await s.run(600, 0.001); await s.run(800, 0.3);
  const again1 = s.again();
  await again1.toggleSpeechRecognition();
  await new Promise((r) => setTimeout(r, 0));
  t('3 a tap stops the recording and sends it', s.w.recorders[0].state === 'inactive' && s.w.fetchCalls.length === 1 && s.w.input === 'How are you');

  // 4. server says no (503): fall back to the browser's own recognition for the next tap
  s = await scenario({ reply: { status: 503, body: { success: false, disabled: true } } });
  await s.api.toggleSpeechRecognition(); await s.run(600, 0.001); await s.run(800, 0.2); await s.run(2000, 0.001);
  t('4 the server voice typing is given up', s.api.sttModeRef.current === 'browser' && /browser voice typing/i.test(s.w.error));
  s.w.error = '';
  await s.again().toggleSpeechRecognition();
  t('4 the next tap uses the browser recognition', s.w.browserStarted === 1);

  // 5. the daily limit: told so, the server way is kept
  s = await scenario({ reply: { status: 429, body: { success: false, error: "You have used today's voice-typing limit (40 recordings).", upgrade_required: true } } });
  await s.api.toggleSpeechRecognition(); await s.run(600, 0.001); await s.run(800, 0.2); await s.run(2000, 0.001);
  t('5 limit message with the upgrade hint', /limit/.test(s.w.error) && /Upgrade/.test(s.w.error) && s.api.sttModeRef.current === 'server');

  // 6. the server could not hear words
  s = await scenario({ reply: { status: 200, body: { success: true, text: '' } }, inputText: 'Hi' });
  await s.api.toggleSpeechRecognition(); await s.run(600, 0.001); await s.run(800, 0.2); await s.run(2000, 0.001);
  t('6 empty text: a message, the text box stays', /could not catch/i.test(s.w.error) && s.w.input === 'Hi');

  // 7. network down
  s = await scenario({ fetchThrows: true });
  await s.api.toggleSpeechRecognition(); await s.run(600, 0.001); await s.run(800, 0.2); await s.run(2000, 0.001);
  t('7 offline: the browser way is offered', s.api.sttModeRef.current === 'browser' && /could not reach/i.test(s.w.error) && s.w.transcribing === false);

  // 8. microphone refused / missing
  s = await scenario({ permission: 'denied' });
  await s.api.toggleSpeechRecognition();
  t('8 refused: message, nothing recorded', /allow microphone/i.test(s.w.error) && s.w.recorders.length === 0);
  s = await scenario({ permission: 'none' });
  await s.api.toggleSpeechRecognition();
  t('8 no microphone: message', /No microphone/i.test(s.w.error) && s.w.recorders.length === 0);

  // 9. a browser without MediaRecorder uses its own recognition straight away
  s = await scenario({ noRecorder: true });
  await s.api.toggleSpeechRecognition();
  t('9 no MediaRecorder: browser recognition', s.w.browserStarted === 1 && s.w.fetchCalls.length === 0);

  // 10. English and Hindi are named to the server
  s = await scenario({ language: 'english' });
  await s.api.toggleSpeechRecognition(); await s.run(600, 0.001); await s.run(800, 0.2); await s.run(2000, 0.001);
  t('10 english', s.w.fetchCalls[0].init.body.items.language.v === 'english');
  s = await scenario({ language: 'hindi' });
  await s.api.toggleSpeechRecognition(); await s.run(600, 0.001); await s.run(800, 0.2); await s.run(2000, 0.001);
  t('10 other languages go as hinglish', s.w.fetchCalls[0].init.body.items.language.v === 'hinglish');

  // 11. a noisy room is not taken for speech: the level meter measures the room first
  s = await scenario();
  await s.api.toggleSpeechRecognition();
  await s.run(600, 0.05);                                    // a noisy room (calibration)
  await s.run(9000, 0.06);                                   // only the room noise: not louder than 2.5 times the room
  t('11 steady room noise is not speech: nothing is sent', s.w.fetchCalls.length === 0 && s.w.recorders[0].state === 'inactive');

  // 12. a tap during "writing down" does nothing
  s = await scenario();
  s.state.isTranscribing = true;
  await s.again().toggleSpeechRecognition();
  t('12 a tap while the recording is being written down does nothing', s.w.recorders.length === 0 && s.w.browserStarted === 0);

  console.log(fails ? fails + ' FAILED' : 'voice typing (front end): all pass');
  process.exit(fails ? 1 : 0);
})();
