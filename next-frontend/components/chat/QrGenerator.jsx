'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Link,
  Wifi,
  User,
  Type,
  Mail,
  Phone,
  MessageSquare,
  CreditCard,
  Palette,
  Image as ImageIcon,
  RefreshCw,
  QrCode,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Printer,
  ShieldCheck,
  ArrowRight,
  Trash2,
} from 'lucide-react';

// ==========================================
// 1. MODES & PRESETS CONFIGURATION
// ==========================================
const MODES = [
  { id: 'url', label: 'URL / Link', icon: Link, hint: 'Website, social profile, or web page' },
  { id: 'text', label: 'Plain Text', icon: Type, hint: 'Any text, note, or serial number' },
  { id: 'wifi', label: 'WiFi Network', icon: Wifi, hint: 'Auto-connect to your home or office WiFi' },
  { id: 'upi', label: 'UPI Payment', icon: CreditCard, hint: 'Direct UPI scan for GPay, PhonePe, Paytm' },
  { id: 'vcard', label: 'Contact Card', icon: User, hint: 'Save contact directly into phone address book' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, hint: 'Open direct WhatsApp chat with pre-filled message' },
  { id: 'email', label: 'Email', icon: Mail, hint: 'Compose pre-filled email to recipient' },
  { id: 'phone', label: 'Phone Call', icon: Phone, hint: 'Open phone dialer with phone number' },
];

const PRESETS = [
  { fg: '#0F172A', bg: '#FFFFFF', label: 'Classic Dark', desc: 'High contrast black & white' },
  { fg: '#4338CA', bg: '#EEF2FF', label: 'Axom Indigo', desc: 'Modern tech blue' },
  { fg: '#065F46', bg: '#ECFDF5', label: 'Emerald Mint', desc: 'Fresh organic green' },
  { fg: '#9F1239', bg: '#FFF1F2', label: 'Sunset Crimson', desc: 'Warm vivid red' },
  { fg: '#6B21A8', bg: '#FAF5FF', label: 'Royal Violet', desc: 'Deep luxury purple' },
  { fg: '#C2410C', bg: '#FFF7ED', label: 'Amber Flame', desc: 'Dynamic warm orange' },
  { fg: '#0E7490', bg: '#ECFEFF', label: 'Ocean Cyan', desc: 'Cool arctic cyan' },
  { fg: '#D97706', bg: '#18181B', label: 'Gold & Charcoal', desc: 'Sleek luxury dark mode' },
];

const BUILTIN_LOGOS = [
  { id: 'none', label: 'None' },
  { id: 'link', label: 'Link', icon: Link },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'upi', label: 'UPI', icon: CreditCard },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'shield', label: 'Verified', icon: ShieldCheck },
];

// Helper: Safely draw a rounded rectangle on any canvas (cross-browser fallback)
function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// Helper: Safely load QRCode library with CommonJS/ESM interop
let QRCodeLibInstance = null;
async function getQRCodeLib() {
  if (QRCodeLibInstance) return QRCodeLibInstance;
  const mod = await import('qrcode');
  QRCodeLibInstance = mod.default && typeof mod.default.toDataURL === 'function' ? mod.default : mod;
  return QRCodeLibInstance;
}

export default function QrGenerator({ onClose }) {
  // Mode & Form Data
  const [mode, setMode] = useState('url');
  const [url, setUrl] = useState('https://axom.ai');
  const [text, setText] = useState('Welcome to Axom AI Creative Suite!');
  const [wifi, setWifi] = useState({ ssid: 'Axom_WiFi', password: 'password123', encryption: 'WPA', hidden: false });
  const [upi, setUpi] = useState({ vpa: 'payee@upi', name: 'Axom Merchant', amount: '', note: 'Payment via Axom AI' });
  const [vcard, setVcard] = useState({ name: 'Samarjit Kashyap', phone: '+91 98765 43210', email: 'samarjit@axom.ai', org: 'Axom AI', title: 'Founder & CEO', url: 'https://axom.ai' });
  const [whatsapp, setWhatsapp] = useState({ phone: '919876543210', message: 'Hello! I found your QR code on Axom AI.' });
  const [emailData, setEmailData] = useState({ to: 'contact@axom.ai', subject: 'Inquiry via QR Code', body: 'Hello Axom AI Team,\n\nI scanned your QR code and wanted to connect!' });
  const [phoneData, setPhoneData] = useState('+919876543210');
  const [smsData, setSmsData] = useState({ phone: '+919876543210', message: 'Hello! Sent from Axom QR Code.' });

  // Customization Options
  const [fgColor, setFgColor] = useState('#0F172A');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [size, setSize] = useState(380);
  const [errorCorrection, setErrorCorrection] = useState('H'); // L, M, Q, H
  const [selectedBuiltinLogo, setSelectedBuiltinLogo] = useState('none');
  const [customLogoUrl, setCustomLogoUrl] = useState(null);
  const [customLogoFile, setCustomLogoFile] = useState(null);
  const [frameStyle, setFrameStyle] = useState('none'); // 'none' | 'scanme' | 'card'

  // Generated QR Output & UI States
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Generate standardized payload based on mode
  const payloadString = useMemo(() => {
    switch (mode) {
      case 'url': {
        const u = url.trim();
        if (!u) return 'https://axom.ai';
        return u.startsWith('http://') || u.startsWith('https://') ? u : `https://${u}`;
      }
      case 'text':
        return text.trim() || 'Welcome to Axom AI!';
      case 'wifi': {
        const enc = wifi.encryption || 'WPA';
        const s = wifi.ssid.trim();
        const p = wifi.password;
        const h = wifi.hidden ? 'H:true;' : '';
        return `WIFI:T:${enc};S:${s};P:${p};${h};`;
      }
      case 'upi': {
        const vpa = upi.vpa.trim();
        const name = encodeURIComponent(upi.name.trim() || 'Merchant');
        const note = encodeURIComponent(upi.note.trim() || 'Payment');
        const amt = upi.amount ? `&am=${encodeURIComponent(upi.amount)}` : '';
        return `upi://pay?pa=${vpa}&pn=${name}&tn=${note}${amt}&cu=INR`;
      }
      case 'vcard': {
        const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
        if (vcard.name) lines.push(`FN:${vcard.name}`);
        if (vcard.org) lines.push(`ORG:${vcard.org}`);
        if (vcard.title) lines.push(`TITLE:${vcard.title}`);
        if (vcard.phone) lines.push(`TEL;TYPE=CELL:${vcard.phone}`);
        if (vcard.email) lines.push(`EMAIL;TYPE=INTERNET:${vcard.email}`);
        if (vcard.url) lines.push(`URL:${vcard.url}`);
        lines.push('END:VCARD');
        return lines.join('\n');
      }
      case 'whatsapp': {
        const cleanPhone = whatsapp.phone.replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(whatsapp.message);
        return `https://wa.me/${cleanPhone}?text=${msg}`;
      }
      case 'email': {
        const to = emailData.to.trim();
        const sub = encodeURIComponent(emailData.subject);
        const bod = encodeURIComponent(emailData.body);
        return `mailto:${to}?subject=${sub}&body=${bod}`;
      }
      case 'phone': {
        return `tel:${phoneData.trim()}`;
      }
      default:
        return 'https://axom.ai';
    }
  }, [mode, url, text, wifi, upi, vcard, whatsapp, emailData, phoneData]);

  // Show Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 1800);
  };

  // QR Code Rendering Function
  const generateQRCode = useCallback(async () => {
    if (!payloadString) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const QRCode = await getQRCodeLib();
      const canvas = canvasRef.current || document.createElement('canvas');
      const targetSize = Math.max(256, Math.min(1000, size));
      canvas.width = targetSize;
      canvas.height = targetSize;

      // Always use 'H' if logo is present to maximize scannability
      const ecl = customLogoUrl || selectedBuiltinLogo !== 'none' ? 'H' : errorCorrection;

      // Step 1: Render native QR Code directly to canvas
      await QRCode.toCanvas(canvas, payloadString, {
        width: targetSize,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: ecl,
      });

      const ctx = canvas.getContext('2d');

      // Step 2: Overlay Center Logo if active
      if (customLogoUrl) {
        await new Promise((resolve) => {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const logoDimension = targetSize * 0.22;
            const pos = (targetSize - logoDimension) / 2;
            const pad = 6;

            // Rounded cutout background
            ctx.fillStyle = bgColor;
            drawRoundedRect(ctx, pos - pad, pos - pad, logoDimension + pad * 2, logoDimension + pad * 2, 10);

            // Draw user logo
            ctx.drawImage(img, pos, pos, logoDimension, logoDimension);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = customLogoUrl;
        });
      } else if (selectedBuiltinLogo !== 'none') {
        // Draw crisp built-in icon badge
        const logoDimension = targetSize * 0.20;
        const pos = (targetSize - logoDimension) / 2;
        const pad = 5;

        ctx.fillStyle = bgColor;
        drawRoundedRect(ctx, pos - pad, pos - pad, logoDimension + pad * 2, logoDimension + pad * 2, 10);

        ctx.fillStyle = fgColor;
        drawRoundedRect(ctx, pos, pos, logoDimension, logoDimension, 8);

        ctx.fillStyle = bgColor;
        ctx.font = `bold ${Math.round(logoDimension * 0.45)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const iconSymbols = {
          link: '🔗',
          wifi: '📶',
          whatsapp: '💬',
          upi: '₹',
          phone: '📞',
          shield: '✓',
        };
        ctx.fillText(iconSymbols[selectedBuiltinLogo] || '★', targetSize / 2, targetSize / 2);
      }

      // Step 3: Frame styling
      if (frameStyle === 'scanme') {
        const framedCanvas = document.createElement('canvas');
        const frameHeight = targetSize + 64;
        framedCanvas.width = targetSize;
        framedCanvas.height = frameHeight;
        const fCtx = framedCanvas.getContext('2d');

        // Draw background
        fCtx.fillStyle = bgColor;
        fCtx.fillRect(0, 0, targetSize, frameHeight);

        // Header Pill
        fCtx.fillStyle = fgColor;
        drawRoundedRect(fCtx, 16, 12, targetSize - 32, 40, 8);

        fCtx.fillStyle = bgColor;
        fCtx.font = 'bold 16px Inter, system-ui, sans-serif';
        fCtx.textAlign = 'center';
        fCtx.textBaseline = 'middle';
        fCtx.fillText('SCAN ME', targetSize / 2, 32);

        // Draw QR
        fCtx.drawImage(canvas, 0, 56);
        setQrDataUrl(framedCanvas.toDataURL('image/png'));
      } else {
        setQrDataUrl(canvas.toDataURL('image/png'));
      }
    } catch (err) {
      console.error('QR code generation error:', err);
      setErrorMessage('Could not generate QR code. Content may be too long for this error level.');
    } finally {
      setIsGenerating(false);
    }
  }, [payloadString, fgColor, bgColor, size, errorCorrection, customLogoUrl, selectedBuiltinLogo, frameStyle]);

  // Debounced auto-generate on change
  useEffect(() => {
    const timer = setTimeout(() => {
      generateQRCode();
    }, 120);
    return () => clearTimeout(timer);
  }, [generateQRCode]);

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCustomLogoUrl(reader.result);
      setSelectedBuiltinLogo('none');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setCustomLogoFile(null);
    setCustomLogoUrl(null);
    setSelectedBuiltinLogo('none');
  };

  // Download PNG
  const downloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode-${mode}-${Date.now()}.png`;
    a.click();
    showToast('Downloaded high-res PNG image!');
  };

  // Download SVG
  const downloadSvg = async () => {
    try {
      const QRCode = await getQRCodeLib();
      const svgString = await QRCode.toString(payloadString, {
        type: 'svg',
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: customLogoUrl || selectedBuiltinLogo !== 'none' ? 'H' : errorCorrection,
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObj;
      a.download = `qrcode-${mode}-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(urlObj);
      showToast('Downloaded vector SVG!');
    } catch (err) {
      console.error(err);
      showToast('SVG download failed.');
    }
  };

  // Copy Image to Clipboard
  const copyImageToClipboard = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      showToast('Copied QR Image to Clipboard!');
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      // Fallback: Copy raw payload text
      navigator.clipboard.writeText(payloadString).catch(() => {});
      showToast('Copied QR payload text to clipboard!');
    }
  };

  // Print QR Code
  const printQrCode = () => {
    if (!qrDataUrl) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Print QR Code - Axom AI</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; margin: 0; }
            .card { text-align: center; border: 2px solid #E5E7EB; border-radius: 16px; padding: 32px; max-width: 440px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            img { width: 300px; height: 300px; object-fit: contain; }
            h2 { margin: 16px 0 6px; font-size: 22px; color: #111827; }
            p { margin: 0; color: #6B7280; font-size: 14px; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="${qrDataUrl}" alt="QR Code" />
            <h2>Scan with your Phone</h2>
            <p>${payloadString}</p>
          </div>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div style={styles.overlay}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={styles.toast}>
          <CheckCircle2 size={16} style={{ color: '#10B981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={styles.container}>
        {/* TOP BAR */}
        <header style={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={styles.headerIconBadge}>
              <QrCode size={20} style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <div style={styles.headerTitle}>QR Code Studio Pro</div>
              <div style={styles.headerSubtitle}>High-Resolution Vector &amp; Canvas QR Generator</div>
            </div>
          </div>

          <button type="button" onClick={onClose} style={styles.closeBtn} title="Close Studio">
            <X size={18} />
          </button>
        </header>

        {/* MAIN BODY: 2 COLUMNS */}
        <div style={styles.body}>
          {/* ==========================================
              LEFT COLUMN: SETTINGS & INPUTS
          ========================================== */}
          <div style={styles.leftColumn}>
            {/* Mode Tabs */}
            <div style={styles.modeTabsNav}>
              {MODES.map((m) => {
                const Icon = m.icon;
                const isActive = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    style={{
                      ...styles.modeTabBtn,
                      ...(isActive ? styles.modeTabBtnActive : {}),
                    }}
                  >
                    <Icon size={15} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mode Input Fields */}
            <div style={styles.cardSection}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>Content &amp; Payload</span>
                <span style={styles.sectionBadge}>
                  {MODES.find(m => m.id === mode)?.hint}
                </span>
              </div>

              {/* Mode: URL */}
              {mode === 'url' && (
                <div>
                  <label style={styles.inputLabel}>Website URL or Social Link</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    style={styles.textInput}
                  />
                  <div style={styles.fieldHint}>
                    Supported: Websites, YouTube links, Instagram, Google Drive, Spotify
                  </div>
                </div>
              )}

              {/* Mode: Text */}
              {mode === 'text' && (
                <div>
                  <label style={styles.inputLabel}>Plain Text</label>
                  <textarea
                    rows={3}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter message, note, code, or secret text..."
                    style={{ ...styles.textInput, resize: 'vertical' }}
                  />
                </div>
              )}

              {/* Mode: WiFi */}
              {mode === 'wifi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={styles.inputLabel}>Network Name (SSID)</label>
                    <input
                      type="text"
                      value={wifi.ssid}
                      onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                      placeholder="MyHome_WiFi"
                      style={styles.textInput}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10 }}>
                    <div>
                      <label style={styles.inputLabel}>Password</label>
                      <input
                        type="text"
                        value={wifi.password}
                        onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                        placeholder="WiFi Password"
                        style={styles.textInput}
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>Security</label>
                      <select
                        value={wifi.encryption}
                        onChange={(e) => setWifi({ ...wifi, encryption: e.target.value })}
                        style={styles.selectInput}
                      >
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None (Open)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode: UPI Payment */}
              {mode === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={styles.inputLabel}>UPI ID (VPA)</label>
                    <input
                      type="text"
                      value={upi.vpa}
                      onChange={(e) => setUpi({ ...upi, vpa: e.target.value })}
                      placeholder="username@okhdfcbank or merchant@upi"
                      style={styles.textInput}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10 }}>
                    <div>
                      <label style={styles.inputLabel}>Payee Name</label>
                      <input
                        type="text"
                        value={upi.name}
                        onChange={(e) => setUpi({ ...upi, name: e.target.value })}
                        placeholder="Store or Personal Name"
                        style={styles.textInput}
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>Amount (₹ optional)</label>
                      <input
                        type="number"
                        value={upi.amount}
                        onChange={(e) => setUpi({ ...upi, amount: e.target.value })}
                        placeholder="e.g. 500"
                        style={styles.textInput}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mode: vCard */}
              {mode === 'vcard' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={styles.inputLabel}>Full Name</label>
                    <input
                      type="text"
                      value={vcard.name}
                      onChange={(e) => setVcard({ ...vcard, name: e.target.value })}
                      placeholder="John Doe"
                      style={styles.textInput}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Phone Number</label>
                    <input
                      type="text"
                      value={vcard.phone}
                      onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      style={styles.textInput}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Email Address</label>
                    <input
                      type="email"
                      value={vcard.email}
                      onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                      placeholder="john@example.com"
                      style={styles.textInput}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Company / Org</label>
                    <input
                      type="text"
                      value={vcard.org}
                      onChange={(e) => setVcard({ ...vcard, org: e.target.value })}
                      placeholder="Acme Corp"
                      style={styles.textInput}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={styles.inputLabel}>Website</label>
                    <input
                      type="url"
                      value={vcard.url}
                      onChange={(e) => setVcard({ ...vcard, url: e.target.value })}
                      placeholder="https://example.com"
                      style={styles.textInput}
                    />
                  </div>
                </div>
              )}

              {/* Mode: WhatsApp */}
              {mode === 'whatsapp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={styles.inputLabel}>WhatsApp Number (with Country Code)</label>
                    <input
                      type="text"
                      value={whatsapp.phone}
                      onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                      placeholder="919876543210"
                      style={styles.textInput}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Pre-filled Message</label>
                    <textarea
                      rows={2}
                      value={whatsapp.message}
                      onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })}
                      placeholder="Hi! I want to inquire about..."
                      style={{ ...styles.textInput, resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

              {/* Mode: Email */}
              {mode === 'email' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={styles.inputLabel}>Recipient Email</label>
                    <input
                      type="email"
                      value={emailData.to}
                      onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                      placeholder="recipient@example.com"
                      style={styles.textInput}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Subject Line</label>
                    <input
                      type="text"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                      placeholder="Subject"
                      style={styles.textInput}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Message Body</label>
                    <textarea
                      rows={2}
                      value={emailData.body}
                      onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                      placeholder="Message..."
                      style={{ ...styles.textInput, resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

              {/* Mode: Phone */}
              {mode === 'phone' && (
                <div>
                  <label style={styles.inputLabel}>Phone Number to Dial</label>
                  <input
                    type="tel"
                    value={phoneData}
                    onChange={(e) => setPhoneData(e.target.value)}
                    placeholder="+91 9876543210"
                    style={styles.textInput}
                  />
                </div>
              )}
            </div>

            {/* Colors & Themes */}
            <div style={styles.cardSection}>
              <span style={styles.sectionTitle}>Color Palette &amp; Contrast</span>

              {/* Presets Grid */}
              <div style={styles.presetsGrid}>
                {PRESETS.map((p) => {
                  const isSelected = fgColor === p.fg && bgColor === p.bg;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setFgColor(p.fg);
                        setBgColor(p.bg);
                      }}
                      style={{
                        ...styles.presetCard,
                        borderColor: isSelected ? '#8B5CF6' : '#2D3748',
                        background: isSelected ? 'rgba(139, 92, 246, 0.12)' : '#1A202C',
                      }}
                    >
                      <div style={styles.swatchPair}>
                        <div style={{ ...styles.swatchBlock, background: p.fg }} />
                        <div style={{ ...styles.swatchBlock, background: p.bg, border: '1px solid #4A5568' }} />
                      </div>
                      <span style={{ fontSize: '0.76rem', color: '#E2E8F0', fontWeight: 500 }}>
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                <div style={styles.colorPickerField}>
                  <label style={styles.inputLabel}>Foreground (Pattern)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      style={styles.colorInput}
                    />
                    <input
                      type="text"
                      value={fgColor.toUpperCase()}
                      onChange={(e) => setFgColor(e.target.value)}
                      style={styles.hexText}
                    />
                  </div>
                </div>

                <div style={styles.colorPickerField}>
                  <label style={styles.inputLabel}>Background</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={styles.colorInput}
                    />
                    <input
                      type="text"
                      value={bgColor.toUpperCase()}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={styles.hexText}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Center Logo & Badges */}
            <div style={styles.cardSection}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>Center Logo / Icon Badge</span>
                {customLogoUrl && (
                  <button type="button" onClick={removeLogo} style={styles.removeBtn}>
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>

              {/* Builtin Icon Chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {BUILTIN_LOGOS.map((b) => {
                  const isSel = selectedBuiltinLogo === b.id && !customLogoUrl;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBuiltinLogo(b.id);
                        setCustomLogoUrl(null);
                        setCustomLogoFile(null);
                      }}
                      style={{
                        ...styles.logoChip,
                        borderColor: isSel ? '#8B5CF6' : '#2D3748',
                        background: isSel ? 'rgba(139, 92, 246, 0.2)' : '#1A202C',
                        color: isSel ? '#C084FC' : '#94A3B8',
                      }}
                    >
                      {b.icon && <b.icon size={13} />}
                      <span>{b.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Upload Custom Logo Button */}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={styles.uploadLogoBtn}
                >
                  <ImageIcon size={15} />
                  <span>{customLogoFile ? `Logo: ${customLogoFile.name}` : 'Upload Custom Brand Logo (PNG, SVG, JPG)'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Sizing & Frame Template */}
            <div style={styles.cardSection}>
              <span style={styles.sectionTitle}>Frame &amp; Resolution</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setFrameStyle('none')}
                  style={{
                    ...styles.frameChip,
                    borderColor: frameStyle === 'none' ? '#8B5CF6' : '#2D3748',
                    background: frameStyle === 'none' ? 'rgba(139,92,246,0.2)' : '#1A202C',
                    color: frameStyle === 'none' ? '#C084FC' : '#94A3B8',
                  }}
                >
                  No Frame
                </button>
                <button
                  type="button"
                  onClick={() => setFrameStyle('scanme')}
                  style={{
                    ...styles.frameChip,
                    borderColor: frameStyle === 'scanme' ? '#8B5CF6' : '#2D3748',
                    background: frameStyle === 'scanme' ? 'rgba(139,92,246,0.2)' : '#1A202C',
                    color: frameStyle === 'scanme' ? '#C084FC' : '#94A3B8',
                  }}
                >
                  "SCAN ME" Header Card
                </button>
              </div>

              {/* Resolution Slider */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 6 }}>
                  <span>Resolution Size</span>
                  <span style={{ fontWeight: 600, color: '#E2E8F0' }}>{size} × {size} px</span>
                </div>
                <input
                  type="range"
                  min={240}
                  max={800}
                  step={20}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#8B5CF6', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* ==========================================
              RIGHT COLUMN: LIVE PREVIEW & EXPORTS
          ========================================== */}
          <div style={styles.rightColumn}>
            {/* Scannability Badge */}
            <div style={styles.scannabilityBadge}>
              <ShieldCheck size={16} style={{ color: '#10B981' }} />
              <span>100% Scannable · High Error Recovery (Level H)</span>
            </div>

            {/* QR Card Container */}
            <div style={styles.previewCanvasWrapper}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  style={{
                    width: '100%',
                    maxWidth: 360,
                    height: 'auto',
                    borderRadius: 14,
                    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                  }}
                />
              ) : (
                <div style={styles.loadingPlaceholder}>
                  <QrCode size={56} style={{ color: '#4A5568' }} />
                  <span style={{ marginTop: 12, color: '#A0AEC0', fontSize: '0.88rem' }}>Generating QR Code...</span>
                </div>
              )}

              {errorMessage && (
                <div style={styles.errorBanner}>
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Live Data Inspector Box */}
            <div style={styles.inspectorBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>Camera will scan:</span>
                <span style={{ fontSize: '0.72rem', color: '#8B5CF6', fontWeight: 600 }}>{mode.toUpperCase()}</span>
              </div>
              <div style={styles.payloadTextSnippet}>
                {payloadString}
              </div>
            </div>

            {/* Export Buttons */}
            <div style={styles.exportGrid}>
              <button type="button" onClick={downloadPng} style={styles.primaryExportBtn}>
                <Download size={16} />
                <span>Download PNG</span>
              </button>
              <button type="button" onClick={downloadSvg} style={styles.secondaryExportBtn}>
                <Layers size={16} />
                <span>Download SVG</span>
              </button>
              <button type="button" onClick={copyImageToClipboard} style={styles.secondaryExportBtn}>
                {copied ? <Check size={16} style={{ color: '#10B981' }} /> : <Copy size={16} />}
                <span>{copied ? 'Copied Image!' : 'Copy Image'}</span>
              </button>
              <button type="button" onClick={printQrCode} style={styles.secondaryExportBtn}>
                <Printer size={16} />
                <span>Print Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hidden internal canvas for compositing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

// ==========================================
// STYLES (Dark Mode Glassmorphism)
// ==========================================
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: '#090D16',
    color: '#F3F4F6',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  toast: {
    position: 'fixed',
    top: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 11000,
    background: 'rgba(17, 24, 39, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(12px)',
    padding: '10px 20px',
    borderRadius: 99,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.88rem',
    color: '#E5E7EB',
    animation: 'fadeIn 0.2s ease',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    maxWidth: 1280,
    margin: '0 auto',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    background: '#0F172A',
    borderBottom: '1px solid #1E293B',
    flexShrink: 0,
  },
  headerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'rgba(139, 92, 246, 0.15)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: 800,
    fontSize: '1.15rem',
    letterSpacing: -0.4,
    color: '#FFFFFF',
    lineHeight: 1.15,
  },
  headerSubtitle: {
    fontSize: '0.75rem',
    color: '#94A3B8',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#94A3B8',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
    gap: 24,
  },
  leftColumn: {
    flex: '1 1 540px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    overflowY: 'auto',
    paddingRight: 6,
  },
  rightColumn: {
    flex: '1 1 400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0F172A',
    borderRadius: 18,
    border: '1px solid #1E293B',
    padding: 24,
    gap: 16,
    maxHeight: '100%',
    overflowY: 'auto',
  },
  modeTabsNav: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
    gap: 6,
    background: '#0F172A',
    padding: 6,
    borderRadius: 12,
    border: '1px solid #1E293B',
  },
  modeTabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 12px',
    borderRadius: 8,
    background: 'transparent',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 500,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  modeTabBtnActive: {
    background: '#1E293B',
    color: '#FFFFFF',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  cardSection: {
    background: '#0F172A',
    borderRadius: 14,
    border: '1px solid #1E293B',
    padding: '16px 18px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#F1F5F9',
    letterSpacing: -0.2,
  },
  sectionBadge: {
    fontSize: '0.7rem',
    padding: '2px 8px',
    borderRadius: 99,
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#C084FC',
    fontWeight: 500,
  },
  inputLabel: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#94A3B8',
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: '0.72rem',
    color: '#64748B',
    marginTop: 5,
  },
  textInput: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 8,
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#F1F5F9',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  selectInput: {
    width: '100%',
    padding: '9px 10px',
    borderRadius: 8,
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#F1F5F9',
    fontSize: '0.88rem',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  presetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
    marginTop: 10,
  },
  presetCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 10,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  swatchPair: {
    display: 'flex',
    alignItems: 'center',
  },
  swatchBlock: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  colorPickerField: {
    background: '#1E293B',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #334155',
  },
  colorInput: {
    width: 32,
    height: 30,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
  },
  hexText: {
    background: 'transparent',
    border: 'none',
    color: '#F1F5F9',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    fontWeight: 600,
    outline: 'none',
    width: '100%',
  },
  logoChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid',
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  uploadLogoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 14px',
    borderRadius: 8,
    background: '#1E293B',
    border: '1px dashed #475569',
    color: '#CBD5E1',
    cursor: 'pointer',
    fontSize: '0.82rem',
    width: '100%',
    boxSizing: 'border-box',
    justifyContent: 'center',
  },
  removeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    borderRadius: 6,
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#EF4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    cursor: 'pointer',
    fontSize: '0.72rem',
    fontWeight: 600,
  },
  frameChip: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  scannabilityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    borderRadius: 99,
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34D399',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
  previewCanvasWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
    width: '100%',
  },
  loadingPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#F87171',
    fontSize: '0.8rem',
    marginTop: 10,
    background: 'rgba(239, 68, 68, 0.15)',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  inspectorBox: {
    width: '100%',
    background: '#1E293B',
    borderRadius: 10,
    border: '1px solid #334155',
    padding: '10px 14px',
    boxSizing: 'border-box',
  },
  payloadTextSnippet: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: '#CBD5E1',
    wordBreak: 'break-all',
    maxHeight: 60,
    overflowY: 'auto',
  },
  exportGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    width: '100%',
  },
  primaryExportBtn: {
    gridColumn: 'span 2',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '11px 18px',
    borderRadius: 10,
    background: '#8B5CF6',
    border: 'none',
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
    transition: 'all 0.15s ease',
  },
  secondaryExportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '9px 12px',
    borderRadius: 8,
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#E2E8F0',
    fontWeight: 500,
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
