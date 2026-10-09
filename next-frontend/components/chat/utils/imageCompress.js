// Client-side image compression. Nothing is uploaded: everything runs in the visitor's browser with <canvas>.
//
//   compressImage(file, { mode: 'quality' | 'target', quality: 0.1-1, targetKB, format: 'auto'|'jpeg'|'webp'|'png', maxSide })
//
// - 'quality' encodes once at the given quality; 'target' searches for the best quality that fits `targetKB`
//   and, if even the lowest quality is too big, scales the picture down step by step.
// - PNG is lossless in a canvas (no quality knob), so for PNG output only scaling can shrink the file.
// - The result is never bigger than the original: if compressing does not help, the original file is returned (`kept: true`).
// - Canvas re-encoding drops EXIF/GPS data, and the EXIF orientation is applied before drawing.

export const MAX_SIDE = 8192;          // browsers fail on huge canvases, so very large pictures are scaled to this
const JPEG = 'image/jpeg';
const WEBP = 'image/webp';
const PNG = 'image/png';

export const extFor = (mime) => (mime === JPEG ? 'jpg' : mime === WEBP ? 'webp' : 'png');

let webpOk = null;
async function supportsWebp() {
  if (webpOk !== null) return webpOk;
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const b = await new Promise((res) => c.toBlob(res, WEBP, 0.8));
    webpOk = !!b && b.type === WEBP;      // Safari silently returns PNG when it cannot write WebP
  } catch (_) { webpOk = false; }
  return webpOk;
}

async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (_) { /* fall back to <img> */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error('This file could not be read as an image.'));
      img.src = url;
    });
    return img;
  } finally { URL.revokeObjectURL(url); }
}

const dims = (src) => ({ w: src.naturalWidth || src.width, h: src.naturalHeight || src.height });

function hasTransparency(src, w, h) {
  const s = Math.min(1, 64 / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * s));
  const ch = Math.max(1, Math.round(h * s));
  const c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(src, 0, 0, cw, ch);
  const d = g.getImageData(0, 0, cw, ch).data;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 250) return true;
  return false;
}

function draw(src, w, h, whiteBackground) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (whiteBackground) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); }
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.drawImage(src, 0, 0, w, h);
  return c;
}

const toBlob = (canvas, mime, q) => new Promise((res) => canvas.toBlob(res, mime, q));

async function pickMime(format, file, alpha) {
  if (format === 'jpeg') return JPEG;
  if (format === 'png') return PNG;
  if (format === 'webp') return (await supportsWebp()) ? WEBP : (alpha ? PNG : JPEG);
  // auto: keep JPEG as JPEG; transparent pictures need WebP/PNG; everything else is far smaller as JPEG
  if (file.type === JPEG) return JPEG;
  if (alpha) return (await supportsWebp()) ? WEBP : PNG;
  if (file.type === WEBP && (await supportsWebp())) return WEBP;
  return JPEG;
}

const baseName = (name) => (name || 'image').replace(/\.[^.]+$/, '') || 'image';

/** Compress one image file. Returns { blob, name, width, height, mime, bytes, originalBytes, savedPct, kept, notes[] }. */
export async function compressImage(file, opts = {}) {
  const { mode = 'quality', quality = 0.75, targetKB = 100, format = 'auto', maxSide = 0 } = opts;
  const src = await decode(file);
  try {
    const { w, h } = dims(src);
    if (!w || !h) throw new Error('This image has no size.');
    const notes = [];
    const limit = maxSide > 0 ? Math.min(maxSide, MAX_SIDE) : MAX_SIDE;
    const scale0 = Math.min(1, limit / Math.max(w, h));
    if (scale0 < 1 && !(maxSide > 0)) notes.push('A very large picture was scaled down to ' + MAX_SIDE + ' px.');
    const alpha = file.type !== JPEG && hasTransparency(src, w, h);
    const mime = await pickMime(format, file, alpha);
    if (format === 'webp' && mime !== WEBP) notes.push('This browser cannot save WebP, so ' + extFor(mime).toUpperCase() + ' was used.');
    if (format === 'jpeg' && alpha) notes.push('Transparent areas become white in JPG.');
    if (mime === PNG && mode === 'quality') notes.push('PNG is lossless, so quality has no effect. Choose JPG or WebP for stronger compression.');

    const encodeAt = async (scale, q) => {
      const cw = Math.max(1, Math.round(w * scale));
      const ch = Math.max(1, Math.round(h * scale));
      const b = await toBlob(draw(src, cw, ch, mime === JPEG), mime, mime === PNG ? undefined : q);
      if (!b || b.type !== mime) throw new Error('Your browser could not save this picture as ' + extFor(mime).toUpperCase() + '.');
      return { b, cw, ch };
    };
    const smaller = (a, b) => (!a || b.b.size < a.b.size ? b : a);

    let res;
    if (mode === 'target') {
      const target = Math.max(1, targetKB) * 1024;
      if (file.size <= target && !(maxSide > 0)) {
        return { blob: file, name: file.name, width: w, height: h, mime: file.type, bytes: file.size, originalBytes: file.size, savedPct: 0, kept: true, notes: ['Already smaller than the target size.'] };
      }
      let best = null;
      let sc = scale0;
      for (let round = 0; round < 12; round++) {
        if (mime === PNG) {
          const r = await encodeAt(sc);
          best = smaller(best, r);
          if (r.b.size <= target) break;
        } else {
          const lowest = await encodeAt(sc, 0.05);
          if (lowest.b.size <= target) {
            let fit = lowest;
            let lo = 0.05;
            let hi = 0.95;
            for (let i = 0; i < 7; i++) {
              const mid = (lo + hi) / 2;
              const r = await encodeAt(sc, mid);
              if (r.b.size <= target) { fit = r; lo = mid; } else { hi = mid; }
            }
            best = fit;
            break;
          }
          best = smaller(best, lowest);
        }
        const next = sc * 0.85;
        if (Math.max(w, h) * next < 160) break;
        sc = next;
      }
      res = best;
      if (res.b.size > target) notes.push('Could not reach ' + targetKB + ' KB; this is the smallest possible.');
      else if (res.cw < Math.round(w * scale0)) notes.push('The picture was also made smaller to fit ' + targetKB + ' KB.');
    } else {
      res = await encodeAt(scale0, Math.min(1, Math.max(0.05, quality)));
    }

    const resized = res.cw !== w || res.ch !== h;
    if (res.b.size >= file.size && !(maxSide > 0) && !resized) {
      return { blob: file, name: file.name, width: w, height: h, mime: file.type, bytes: file.size, originalBytes: file.size, savedPct: 0, kept: true, notes: ['This picture is already well optimised.'].concat(notes) };
    }
    return {
      blob: res.b,
      name: baseName(file.name) + '-compressed.' + extFor(mime),
      width: res.cw,
      height: res.ch,
      mime,
      bytes: res.b.size,
      originalBytes: file.size,
      savedPct: Math.round((1 - res.b.size / file.size) * 100),
      kept: false,
      notes,
    };
  } finally {
    if (src && typeof src.close === 'function') src.close();
  }
}

export const fmtSize = (b) => (b < 1024 ? b + ' B' : b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(2) + ' MB');
