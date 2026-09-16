'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X, Square, Circle, Minus, Type, Pen, MousePointer2, Download, UploadCloud,
  Trash2, Copy, Undo2, Redo2, ZoomIn, ZoomOut, Layers, Triangle, Star,
  ChevronDown, Grid3X3, Eye, EyeOff, Lock, Unlock, ArrowUp, ArrowDown,
  RotateCcw, FlipHorizontal, FlipVertical, AlignCenterHorizontal, AlignCenterVertical,
  Image as ImageIcon, PenTool,
} from 'lucide-react';

const COLORS = [
  '#111827', '#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#ffffff', '#6b7280', 'transparent',
];
const STROKE_WIDTHS = [1, 2, 3, 5, 8, 12];
const FONT_SIZES = [12, 14, 16, 20, 24, 32, 48, 64, 80];
const FONTS = ['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Impact'];

export default function SvgEditor({ onClose }) {
  const wrapRef = useRef(null);
  const fabricRef = useRef(null);
  const fabricModRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const historyRef = useRef({ states: [], idx: -1, recording: true });

  const [ready, setReady] = useState(false);
  const [tool, setTool] = useState('select');
  const [fillColor, setFillColor] = useState('#2563eb');
  const [strokeColor, setStrokeColor] = useState('#111827');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [selectedObj, setSelectedObj] = useState(null);
  const [layersList, setLayersList] = useState([]);
  const [showLayers, setShowLayers] = useState(false);
  const [showFillPicker, setShowFillPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const [canvasW] = useState(900);
  const [canvasH] = useState(640);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [selWidth, setSelWidth] = useState('');
  const [selHeight, setSelHeight] = useState('');
  const [selOpacity, setSelOpacity] = useState(100);

  const syncLayers = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const objs = fc.getObjects().filter((o) => !o._isGrid).map((o, i) => ({
      idx: i, type: o.type || 'object',
      name: o.type === 'textbox' ? 'Text' : o.type === 'path' ? 'Path' : (o.type || 'object'),
      visible: o.visible !== false, locked: !!o.lockMovementX, obj: o,
    }));
    setLayersList(objs.reverse());
  }, []);

  const saveHistory = useCallback(() => {
    const fc = fabricRef.current;
    const h = historyRef.current;
    if (!fc || !h.recording) return;
    const json = JSON.stringify(fc.toJSON());
    if (h.idx >= 0 && h.states[h.idx] === json) return;
    h.states = h.states.slice(0, h.idx + 1);
    h.states.push(json);
    if (h.states.length > 50) h.states.shift();
    h.idx = h.states.length - 1;
    setCanUndo(h.idx > 0);
    setCanRedo(false);
    syncLayers();
  }, [syncLayers]);

  // ── Init Fabric ──
  useEffect(() => {
    let disposed = false;
    const init = async () => {
      const fabric = await import('fabric');
      if (disposed) return;
      fabricModRef.current = fabric;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const el = document.createElement('canvas');
      el.width = canvasW;
      el.height = canvasH;
      wrap.innerHTML = '';
      wrap.appendChild(el);
      const fc = new fabric.Canvas(el, {
        width: canvasW, height: canvasH,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true, selection: true,
      });
      if (disposed) { fc.dispose(); return; }
      fabricRef.current = fc;

      fc.on('selection:created', () => syncSel());
      fc.on('selection:updated', () => syncSel());
      fc.on('selection:cleared', () => setSelectedObj(null));
      fc.on('object:modified', () => saveHistory());
      fc.on('object:added', () => saveHistory());
      fc.on('object:removed', () => saveHistory());

      saveHistory();
      setReady(true);
    };
    init();
    return () => { disposed = true; if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; } if (wrapRef.current) wrapRef.current.innerHTML = ''; };
  }, []);

  const syncSel = () => {
    const ao = fabricRef.current?.getActiveObject();
    if (!ao) { setSelectedObj(null); setSelWidth(''); setSelHeight(''); setSelOpacity(100); return; }
    setSelectedObj({ type: ao.type, fill: ao.fill, stroke: ao.stroke, strokeWidth: ao.strokeWidth, fontSize: ao.fontSize, fontFamily: ao.fontFamily, opacity: ao.opacity });
    setSelWidth(Math.round(ao.getScaledWidth()));
    setSelHeight(Math.round(ao.getScaledHeight()));
    setSelOpacity(Math.round((ao.opacity ?? 1) * 100));
  };

  // ── History ──
  const restoreHistory = useCallback(async (idx) => {
    const fc = fabricRef.current;
    const h = historyRef.current;
    if (!fc || idx < 0 || idx >= h.states.length) return;
    h.recording = false; h.idx = idx;
    await fc.loadFromJSON(h.states[idx]);
    fc.renderAll();
    h.recording = true;
    setCanUndo(idx > 0);
    setCanRedo(idx < h.states.length - 1);
    syncLayers();
  }, [syncLayers]);

  const undo = () => restoreHistory(historyRef.current.idx - 1);
  const redo = () => restoreHistory(historyRef.current.idx + 1);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      const fc = fabricRef.current;
      if (!fc) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); copyObj(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); pasteObj(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        const ao = fc.getActiveObject();
        if (ao && ao.type !== 'textbox') { e.preventDefault(); deleteSelected(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Tool mode ──
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    fc.isDrawingMode = tool === 'pen';
    fc.selection = tool === 'select';
    if (tool === 'pen' && fc.freeDrawingBrush) {
      fc.freeDrawingBrush.color = strokeColor;
      fc.freeDrawingBrush.width = strokeWidth;
    }
    fc.defaultCursor = tool === 'select' ? 'default' : 'crosshair';
    fc.hoverCursor = tool === 'select' ? 'move' : 'crosshair';
    fc.getObjects().forEach((o) => {
      if (o._isGrid) return;
      o.selectable = tool === 'select';
      o.evented = tool === 'select';
    });
    fc.renderAll();
  }, [tool, strokeColor, strokeWidth]);

  // ── Shape drawing ──
  useEffect(() => {
    const fc = fabricRef.current;
    const fab = fabricModRef.current;
    if (!fc || !fab) return;
    if (tool === 'select' || tool === 'pen') return;

    let isDown = false, startX = 0, startY = 0, shape = null;

    const onDown = (opt) => {
      if (tool === 'text') { addText(opt.pointer.x, opt.pointer.y); return; }
      isDown = true;
      const p = opt.pointer; startX = p.x; startY = p.y;
      const base = { left: p.x, top: p.y, fill: fillColor, stroke: strokeColor, strokeWidth, originX: 'left', originY: 'top', selectable: false, evented: false };
      if (tool === 'rect') shape = new fab.Rect({ ...base, width: 1, height: 1 });
      else if (tool === 'circle') shape = new fab.Ellipse({ ...base, rx: 1, ry: 1 });
      else if (tool === 'line') shape = new fab.Line([p.x, p.y, p.x, p.y], { stroke: strokeColor, strokeWidth, selectable: false, evented: false });
      else if (tool === 'triangle') shape = new fab.Triangle({ ...base, width: 1, height: 1 });
      else if (tool === 'star') shape = new fab.Polygon(starPts(p.x, p.y, 5, 1, 0.5), { ...base });
      if (shape) fc.add(shape);
    };

    const onMove = (opt) => {
      if (!isDown || !shape) return;
      const p = opt.pointer;
      if (tool === 'rect' || tool === 'triangle') {
        shape.set({ left: Math.min(startX, p.x), top: Math.min(startY, p.y), width: Math.abs(p.x - startX), height: Math.abs(p.y - startY) });
      } else if (tool === 'circle') {
        shape.set({ left: Math.min(startX, p.x), top: Math.min(startY, p.y), rx: Math.abs(p.x - startX) / 2, ry: Math.abs(p.y - startY) / 2 });
      } else if (tool === 'line') {
        shape.set({ x2: p.x, y2: p.y });
      } else if (tool === 'star') {
        const r = Math.sqrt((p.x - startX) ** 2 + (p.y - startY) ** 2);
        shape.set({ points: starPts(startX, startY, 5, r, r * 0.45) });
      }
      fc.renderAll();
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      if (shape) { shape.set({ selectable: true, evented: true }); fc.setActiveObject(shape); fc.renderAll(); }
      shape = null;
      setTool('select');
    };

    fc.on('mouse:down', onDown);
    fc.on('mouse:move', onMove);
    fc.on('mouse:up', onUp);
    return () => { fc.off('mouse:down', onDown); fc.off('mouse:move', onMove); fc.off('mouse:up', onUp); };
  }, [tool, fillColor, strokeColor, strokeWidth, fontSize, fontFamily, ready]);

  function starPts(cx, cy, n, outerR, innerR) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (Math.PI / n) * i - Math.PI / 2;
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
    return pts;
  }

  const addText = (x, y) => {
    const fc = fabricRef.current;
    const fab = fabricModRef.current;
    if (!fc || !fab) return;
    const t = new fab.Textbox('Text', {
      left: x || 100, top: y || 100, fontSize, fontFamily,
      fill: fillColor, width: 200, editable: true,
    });
    fc.add(t);
    fc.setActiveObject(t);
    t.enterEditing();
    fc.renderAll();
    setTool('select');
  };

  // ── Object ops ──
  const deleteSelected = () => { const fc = fabricRef.current; if (!fc) return; fc.getActiveObjects().forEach((o) => fc.remove(o)); fc.discardActiveObject(); fc.renderAll(); };

  const clipboardRef = useRef(null);
  const copyObj = async () => { const ao = fabricRef.current?.getActiveObject(); if (ao) clipboardRef.current = await ao.clone(); };
  const pasteObj = async () => {
    const fc = fabricRef.current;
    if (!fc || !clipboardRef.current) return;
    const cl = await clipboardRef.current.clone();
    cl.set({ left: cl.left + 20, top: cl.top + 20, evented: true });
    if (cl.type === 'activeSelection') { cl.canvas = fc; cl.forEachObject((o) => fc.add(o)); cl.setCoords(); }
    else fc.add(cl);
    fc.setActiveObject(cl); fc.renderAll();
  };
  const duplicateObj = async () => { await copyObj(); await pasteObj(); };

  const bringForward = () => { const fc = fabricRef.current; const ao = fc?.getActiveObject(); if (ao) { fc.bringObjectForward(ao); fc.renderAll(); saveHistory(); } };
  const sendBackward = () => { const fc = fabricRef.current; const ao = fc?.getActiveObject(); if (ao) { fc.sendObjectBackwards(ao); fc.renderAll(); saveHistory(); } };
  const toggleVis = (obj) => { obj.set('visible', !obj.visible); fabricRef.current?.renderAll(); syncLayers(); };
  const toggleLock = (obj) => {
    const l = !obj.lockMovementX;
    obj.set({ lockMovementX: l, lockMovementY: l, lockScalingX: l, lockScalingY: l, lockRotation: l, hasControls: !l });
    fabricRef.current?.renderAll(); syncLayers();
  };

  const flipH = () => { const ao = fabricRef.current?.getActiveObject(); if (ao) { ao.set('flipX', !ao.flipX); fabricRef.current.renderAll(); saveHistory(); } };
  const flipV = () => { const ao = fabricRef.current?.getActiveObject(); if (ao) { ao.set('flipY', !ao.flipY); fabricRef.current.renderAll(); saveHistory(); } };
  const rotate90 = () => { const ao = fabricRef.current?.getActiveObject(); if (ao) { ao.rotate((ao.angle || 0) + 90); fabricRef.current.renderAll(); saveHistory(); } };
  const alignH = () => { const ao = fabricRef.current?.getActiveObject(); if (ao) { ao.set('left', canvasW / 2 - ao.getScaledWidth() / 2); fabricRef.current.renderAll(); saveHistory(); } };
  const alignV = () => { const ao = fabricRef.current?.getActiveObject(); if (ao) { ao.set('top', canvasH / 2 - ao.getScaledHeight() / 2); fabricRef.current.renderAll(); saveHistory(); } };

  // ── Zoom ──
  const setZoomLevel = (z) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const v = Math.max(25, Math.min(400, z));
    fc.setZoom(v / 100);
    setZoom(v);
  };

  // ── Import SVG ──
  const flattenGroup = (group, scale, fab) => {
    const items = [];
    const children = group.getObjects ? group.getObjects() : [];
    for (const child of children) {
      if (child.type === 'group') {
        items.push(...flattenGroup(child, scale, fab));
      } else {
        child.set({
          scaleX: (child.scaleX || 1) * scale,
          scaleY: (child.scaleY || 1) * scale,
          selectable: true,
          evented: true,
        });
        items.push(child);
      }
    }
    return items;
  };

  const importSvg = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fc = fabricRef.current;
    const fab = fabricModRef.current;
    if (!fc || !fab) return;
    const text = await f.text();
    const result = await fab.loadSVGFromString(text);
    if (!result.objects || result.objects.length === 0) return;
    const group = fab.util.groupSVGElements(result.objects, result.options);
    const sx = (canvasW * 0.9) / (group.width || 1);
    const sy = (canvasH * 0.9) / (group.height || 1);
    const scale = Math.min(sx, sy, 1);

    fc.clear(); fc.backgroundColor = canvasBg;

    if (group.type === 'group') {
      const flat = flattenGroup(group, scale, fab);
      const offsetX = canvasW / 2 - (group.width * scale) / 2;
      const offsetY = canvasH / 2 - (group.height * scale) / 2;
      for (const obj of flat) {
        obj.set({
          left: (obj.left || 0) * scale + offsetX,
          top: (obj.top || 0) * scale + offsetY,
        });
        fc.add(obj);
      }
    } else {
      group.set({ scaleX: scale, scaleY: scale, left: canvasW / 2, top: canvasH / 2, originX: 'center', originY: 'center' });
      fc.add(group);
    }
    fc.renderAll(); saveHistory(); setTool('select');
    e.target.value = '';
  };

  // ── Import Image ──
  const importImage = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fc = fabricRef.current;
    const fab = fabricModRef.current;
    if (!fc || !fab) return;
    const url = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
    const img = await fab.FabricImage.fromURL(url);
    const sx = (canvasW * 0.6) / img.width;
    const sy = (canvasH * 0.6) / img.height;
    const scale = Math.min(sx, sy, 1);
    img.set({ scaleX: scale, scaleY: scale, left: canvasW / 2, top: canvasH / 2, originX: 'center', originY: 'center' });
    fc.add(img); fc.setActiveObject(img); fc.renderAll(); saveHistory();
    e.target.value = '';
  };

  // ── Export ──
  const exportSvg = () => {
    const fc = fabricRef.current; if (!fc) return;
    const svg = fc.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'design.svg'; a.click();
    URL.revokeObjectURL(url);
  };
  const exportPng = () => {
    const fc = fabricRef.current; if (!fc) return;
    const d = fc.toDataURL({ format: 'png', multiplier: 2 });
    const a = document.createElement('a'); a.href = d; a.download = 'design.png'; a.click();
  };
  const exportJpg = () => {
    const fc = fabricRef.current; if (!fc) return;
    const d = fc.toDataURL({ format: 'jpeg', quality: 0.95, multiplier: 2 });
    const a = document.createElement('a'); a.href = d; a.download = 'design.jpg'; a.click();
  };

  // ── Update selected ──
  const updateSelected = (prop, val) => {
    const fc = fabricRef.current;
    const ao = fc?.getActiveObject();
    if (!ao) return;
    ao.set(prop, val); fc.renderAll(); saveHistory(); syncSel();
  };

  // ── Canvas background ──
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    fc.backgroundColor = canvasBg;
    fc.renderAll();
  }, [canvasBg, ready]);

  const changeSelSize = (dim, val) => {
    const fc = fabricRef.current;
    const ao = fc?.getActiveObject();
    if (!ao || !val) return;
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) return;
    if (dim === 'w') {
      const newScale = num / (ao.width || 1);
      ao.set('scaleX', newScale);
      setSelWidth(num);
    } else {
      const newScale = num / (ao.height || 1);
      ao.set('scaleY', newScale);
      setSelHeight(num);
    }
    fc.renderAll(); saveHistory();
  };

  const changeSelOpacity = (val) => {
    const fc = fabricRef.current;
    const ao = fc?.getActiveObject();
    if (!ao) return;
    const v = Math.max(0, Math.min(100, val));
    setSelOpacity(v);
    ao.set('opacity', v / 100);
    fc.renderAll(); saveHistory();
  };

  // ── Grid ──
  useEffect(() => {
    const fc = fabricRef.current;
    const fab = fabricModRef.current;
    if (!fc || !fab) return;
    fc.getObjects().filter((o) => o._isGrid).forEach((o) => fc.remove(o));
    if (showGrid) {
      const step = 20;
      for (let i = step; i < canvasW; i += step) {
        const l = new fab.Line([i, 0, i, canvasH], { stroke: '#e5e7eb', strokeWidth: 0.5, selectable: false, evented: false, excludeFromExport: true });
        l._isGrid = true; fc.add(l); fc.sendObjectToBack(l);
      }
      for (let i = step; i < canvasH; i += step) {
        const l = new fab.Line([0, i, canvasW, i], { stroke: '#e5e7eb', strokeWidth: 0.5, selectable: false, evented: false, excludeFromExport: true });
        l._isGrid = true; fc.add(l); fc.sendObjectToBack(l);
      }
    }
    fc.renderAll();
  }, [showGrid, ready]);

  // ── Color picker ──
  const ColorGrid = ({ value, onChange, show, setShow }) => (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setShow(!show)} style={S.colorBtn}>
        <div style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid #555', background: value === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50%/8px 8px' : value }} />
        <ChevronDown size={10} style={{ marginLeft: 2 }} />
      </button>
      {show && (
        <div style={S.colorPopup} onMouseLeave={() => setShow(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {COLORS.map((c) => (
              <button key={c} onClick={() => { onChange(c); setShow(false); }}
                style={{ width: 28, height: 28, borderRadius: 6, border: c === value ? '2px solid #8b5cf6' : '1px solid #444',
                  background: c === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50%/8px 8px' : c, cursor: 'pointer' }} />
            ))}
          </div>
          <input type="color" value={value === 'transparent' ? '#ffffff' : value} onChange={(e) => { onChange(e.target.value); setShow(false); }}
            style={{ marginTop: 6, width: '100%', height: 28, cursor: 'pointer', border: 'none', background: 'transparent' }} />
        </div>
      )}
    </div>
  );

  return (
    <div style={S.overlay}>
      <div style={S.container}>
        {/* Top Bar */}
        <div style={S.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PenTool size={20} style={{ color: '#8b5cf6' }} />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>SVG Editor</span>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>— Draw, edit & export vector graphics</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={S.topBtn} onClick={exportSvg}><Download size={15} /><span style={{ marginLeft: 4 }}>SVG</span></button>
            <button style={S.topBtn} onClick={exportPng}><Download size={15} /><span style={{ marginLeft: 4 }}>PNG</span></button>
            <button style={S.topBtn} onClick={exportJpg}><Download size={15} /><span style={{ marginLeft: 4 }}>JPG</span></button>
            <div style={{ width: 1, height: 24, background: '#333', margin: '0 4px' }} />
            <button onClick={onClose} style={S.closeBtn}><X size={18} /></button>
          </div>
        </div>

        {/* Options Bar */}
        <div style={S.optionsBar}>
          <span style={S.label}>Fill</span>
          <ColorGrid value={fillColor} onChange={(c) => { setFillColor(c); if (selectedObj) updateSelected('fill', c); }} show={showFillPicker} setShow={setShowFillPicker} />
          <span style={S.label}>Stroke</span>
          <ColorGrid value={strokeColor} onChange={(c) => { setStrokeColor(c); if (selectedObj) updateSelected('stroke', c); }} show={showStrokePicker} setShow={setShowStrokePicker} />
          <select value={strokeWidth} onChange={(e) => { const v = +e.target.value; setStrokeWidth(v); if (selectedObj) updateSelected('strokeWidth', v); }} style={S.select}>
            {STROKE_WIDTHS.map((w) => <option key={w} value={w}>{w}px</option>)}
          </select>

          <div style={{ width: 1, height: 22, background: '#333' }} />

          <select value={fontFamily} onChange={(e) => { setFontFamily(e.target.value); if (selectedObj?.type === 'textbox') updateSelected('fontFamily', e.target.value); }} style={S.select}>
            {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={fontSize} onChange={(e) => { const v = +e.target.value; setFontSize(v); if (selectedObj?.type === 'textbox') updateSelected('fontSize', v); }} style={S.select}>
            {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
          </select>

          <div style={{ width: 1, height: 22, background: '#333' }} />

          <button onClick={flipH} style={S.smBtn} title="Flip Horizontal"><FlipHorizontal size={14} /></button>
          <button onClick={flipV} style={S.smBtn} title="Flip Vertical"><FlipVertical size={14} /></button>
          <button onClick={rotate90} style={S.smBtn} title="Rotate 90°"><RotateCcw size={14} /></button>
          <button onClick={alignH} style={S.smBtn} title="Center H"><AlignCenterHorizontal size={14} /></button>
          <button onClick={alignV} style={S.smBtn} title="Center V"><AlignCenterVertical size={14} /></button>

          <div style={{ flex: 1 }} />

          <button onClick={() => setZoomLevel(zoom - 25)} style={S.smBtn}><ZoomOut size={14} /></button>
          <span style={{ color: '#aaa', fontSize: '0.78rem', minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
          <button onClick={() => setZoomLevel(zoom + 25)} style={S.smBtn}><ZoomIn size={14} /></button>
          <button onClick={() => setShowGrid(!showGrid)} style={{ ...S.smBtn, background: showGrid ? 'rgba(139,92,246,0.3)' : 'transparent' }} title="Grid"><Grid3X3 size={14} /></button>
          <div style={{ width: 1, height: 22, background: '#333' }} />
          <span style={S.label}>BG</span>
          <ColorGrid value={canvasBg} onChange={(c) => setCanvasBg(c)} show={showBgPicker} setShow={setShowBgPicker} />
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Toolbar */}
          <div style={S.toolbar}>
            <TBtn icon={MousePointer2} id="select" label="Select (V)" active={tool} set={setTool} />
            <TBtn icon={Square} id="rect" label="Rectangle (R)" active={tool} set={setTool} />
            <TBtn icon={Circle} id="circle" label="Ellipse (C)" active={tool} set={setTool} />
            <TBtn icon={Triangle} id="triangle" label="Triangle" active={tool} set={setTool} />
            <TBtn icon={Minus} id="line" label="Line (L)" active={tool} set={setTool} />
            <TBtn icon={Star} id="star" label="Star" active={tool} set={setTool} />
            <TBtn icon={Type} id="text" label="Text (T)" active={tool} set={setTool} />
            <TBtn icon={Pen} id="pen" label="Freehand (P)" active={tool} set={setTool} />
            <div style={S.sep} />
            <button onClick={() => fileRef.current?.click()} style={S.toolBtn} title="Import SVG"><UploadCloud size={18} /></button>
            <button onClick={() => imgRef.current?.click()} style={S.toolBtn} title="Add Image"><ImageIcon size={18} /></button>
            <div style={S.sep} />
            <button onClick={undo} style={{ ...S.toolBtn, opacity: canUndo ? 1 : 0.35 }} title="Undo (Ctrl+Z)"><Undo2 size={18} /></button>
            <button onClick={redo} style={{ ...S.toolBtn, opacity: canRedo ? 1 : 0.35 }} title="Redo (Ctrl+Y)"><Redo2 size={18} /></button>
            <div style={S.sep} />
            <button onClick={duplicateObj} style={S.toolBtn} title="Duplicate"><Copy size={18} /></button>
            <button onClick={deleteSelected} style={S.toolBtn} title="Delete"><Trash2 size={18} /></button>
            <button onClick={bringForward} style={S.toolBtn} title="Bring Forward"><ArrowUp size={18} /></button>
            <button onClick={sendBackward} style={S.toolBtn} title="Send Backward"><ArrowDown size={18} /></button>
            <div style={{ flex: 1 }} />
            <button onClick={() => { setShowLayers(!showLayers); syncLayers(); }} style={{ ...S.toolBtn, background: showLayers ? 'rgba(139,92,246,0.3)' : 'transparent' }} title="Layers"><Layers size={18} /></button>
          </div>

          {/* Canvas */}
          <div style={S.canvasWrap}>
            <div ref={wrapRef} />
          </div>

          {/* Properties panel for selected object */}
          {selectedObj && (
            <div style={S.propsPanel}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #333', fontWeight: 700, fontSize: '0.85rem', color: '#ccc' }}>
                Properties
              </div>
              <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
                <div>
                  <span style={S.propLabel}>Width</span>
                  <input type="number" value={selWidth} onChange={(e) => changeSelSize('w', e.target.value)} style={S.propInput} min={1} />
                </div>
                <div>
                  <span style={S.propLabel}>Height</span>
                  <input type="number" value={selHeight} onChange={(e) => changeSelSize('h', e.target.value)} style={S.propInput} min={1} />
                </div>
                <div>
                  <span style={S.propLabel}>Opacity — {selOpacity}%</span>
                  <input type="range" min={0} max={100} value={selOpacity} onChange={(e) => changeSelOpacity(+e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <span style={S.propLabel}>Fill</span>
                  <input type="color" value={(selectedObj.fill && selectedObj.fill !== 'transparent') ? selectedObj.fill : '#ffffff'} onChange={(e) => updateSelected('fill', e.target.value)}
                    style={{ width: '100%', height: 28, cursor: 'pointer', border: '1px solid #444', borderRadius: 6, background: 'transparent' }} />
                  <button onClick={() => updateSelected('fill', 'transparent')} style={{ ...S.smBtn, width: '100%', marginTop: 4, fontSize: '0.72rem', color: '#888' }}>No Fill</button>
                </div>
                <div>
                  <span style={S.propLabel}>Stroke</span>
                  <input type="color" value={(selectedObj.stroke && selectedObj.stroke !== 'transparent') ? selectedObj.stroke : '#000000'} onChange={(e) => updateSelected('stroke', e.target.value)}
                    style={{ width: '100%', height: 28, cursor: 'pointer', border: '1px solid #444', borderRadius: 6, background: 'transparent' }} />
                  <button onClick={() => updateSelected('stroke', 'transparent')} style={{ ...S.smBtn, width: '100%', marginTop: 4, fontSize: '0.72rem', color: '#888' }}>No Stroke</button>
                </div>
                <div>
                  <span style={S.propLabel}>Stroke Width</span>
                  <select value={selectedObj.strokeWidth || 0} onChange={(e) => updateSelected('strokeWidth', +e.target.value)} style={{ ...S.select, width: '100%' }}>
                    <option value={0}>None</option>
                    {STROKE_WIDTHS.map((w) => <option key={w} value={w}>{w}px</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Layers */}
          {showLayers && (
            <div style={S.layersPanel}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #333', fontWeight: 700, fontSize: '0.85rem', color: '#ccc', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={14} /> Layers
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
                {layersList.length === 0 && <p style={{ color: '#666', fontSize: '0.8rem', textAlign: 'center', marginTop: 20 }}>No objects yet</p>}
                {layersList.map((l, i) => (
                  <div key={i} onClick={() => { fabricRef.current?.setActiveObject(l.obj); fabricRef.current?.renderAll(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
                      background: fabricRef.current?.getActiveObject() === l.obj ? 'rgba(139,92,246,0.2)' : 'transparent', marginBottom: 2 }}>
                    <span style={{ flex: 1, fontSize: '0.78rem', color: '#ccc', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.name}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); toggleVis(l.obj); }} style={S.layerBtn}>{l.visible ? <Eye size={12} /> : <EyeOff size={12} />}</button>
                    <button onClick={(e) => { e.stopPropagation(); toggleLock(l.obj); }} style={S.layerBtn}>{l.locked ? <Lock size={12} /> : <Unlock size={12} />}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept=".svg" onChange={importSvg} hidden />
        <input ref={imgRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif" onChange={importImage} hidden />
      </div>
    </div>
  );
}

function TBtn({ icon: Icon, id, label, active, set }) {
  return (
    <button onClick={() => set(id)} style={{ ...S.toolBtn, background: active === id ? 'rgba(139,92,246,0.3)' : 'transparent', color: active === id ? '#c084fc' : '#aaa' }} title={label}>
      <Icon size={18} />
    </button>
  );
}

const S = {
  overlay: { position: 'fixed', inset: 0, zIndex: 9999, background: '#0a0a0f', display: 'flex', flexDirection: 'column' },
  container: { display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#111118', borderBottom: '1px solid #222', flexShrink: 0 },
  optionsBar: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px', background: '#151520', borderBottom: '1px solid #222', flexShrink: 0, flexWrap: 'wrap', minHeight: 40 },
  toolbar: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 6px', background: '#111118', borderRight: '1px solid #222', flexShrink: 0, width: 52, overflowY: 'auto' },
  canvasWrap: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a24', overflow: 'auto', position: 'relative', padding: 20 },
  layersPanel: { width: 220, background: '#111118', borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  toolBtn: { width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', color: '#aaa', cursor: 'pointer' },
  topBtn: { display: 'inline-flex', alignItems: 'center', padding: '5px 10px', borderRadius: 7, border: '1px solid #333', background: '#1a1a24', color: '#ccc', cursor: 'pointer', fontSize: '0.82rem' },
  closeBtn: { width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#888', cursor: 'pointer' },
  smBtn: { width: 30, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '1px solid #333', background: 'transparent', color: '#aaa', cursor: 'pointer', flexShrink: 0 },
  colorBtn: { display: 'inline-flex', alignItems: 'center', gap: 2, padding: '3px 6px', borderRadius: 6, border: '1px solid #444', background: '#1a1a24', cursor: 'pointer', color: '#aaa' },
  colorPopup: { position: 'absolute', top: '100%', left: 0, zIndex: 50, background: '#1e1e2a', border: '1px solid #333', borderRadius: 10, padding: 10, marginTop: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.6)' },
  label: { color: '#888', fontSize: '0.78rem', flexShrink: 0 },
  select: { background: '#1a1a24', color: '#ccc', border: '1px solid #333', borderRadius: 6, padding: '3px 6px', fontSize: '0.78rem', cursor: 'pointer', outline: 'none' },
  layerBtn: { width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, border: 'none', background: 'transparent', color: '#888', cursor: 'pointer', flexShrink: 0 },
  sep: { width: '100%', height: 1, background: '#333', margin: '4px 0' },
  propsPanel: { width: 200, background: '#111118', borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' },
  propLabel: { display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: 4 },
  propInput: { width: '100%', background: '#1a1a24', color: '#ccc', border: '1px solid #333', borderRadius: 6, padding: '4px 8px', fontSize: '0.82rem', outline: 'none' },
};
