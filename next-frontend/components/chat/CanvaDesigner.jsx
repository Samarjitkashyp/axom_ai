'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Download, Search, ExternalLink, RefreshCw, Loader2, LogOut, Palette, Sparkles, Send, Copy, Check } from 'lucide-react';
import { getCsrfToken } from './utils/security';

const DESIGN_PRESETS = [
  { name: 'doc', label: 'Document', icon: '📄' },
  { name: 'presentation', label: 'Presentation', icon: '📊' },
  { name: 'whiteboard', label: 'Whiteboard', icon: '🎨' },
  { name: 'instagram_post', label: 'Instagram Post', icon: '📷' },
  { name: 'facebook_post', label: 'Facebook Post', icon: '👥' },
  { name: 'youtube_thumbnail', label: 'YouTube Thumbnail', icon: '▶️' },
  { name: 'logo', label: 'Logo', icon: '✏️' },
  { name: 'poster', label: 'Poster', icon: '🖼️' },
  { name: 'flyer', label: 'Flyer', icon: '📰' },
  { name: 'resume', label: 'Resume', icon: '📋' },
  { name: 'business_card', label: 'Business Card', icon: '💼' },
  { name: 'invitation', label: 'Invitation', icon: '💌' },
];

export default function CanvaDesigner({ onClose }) {
  const [connected, setConnected] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [showNewDesign, setShowNewDesign] = useState(false);
  const [newDesignTab, setNewDesignTab] = useState('design');
  const [newTitle, setNewTitle] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [presetResult, setPresetResult] = useState(null);
  const [copied, setCopied] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/canva/status/', { credentials: 'include' });
      const data = await res.json();
      setConnected(data.connected);
      if (data.connected) fetchDesigns();
      else setLoading(false);
    } catch {
      setConnected(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const params = new URLSearchParams(window.location.search);
    if (params.get('canva_connected') === '1') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkStatus]);

  const fetchDesigns = async (query) => {
    setLoading(true);
    try {
      const params = query ? `?query=${encodeURIComponent(query)}` : '';
      const res = await fetch(`/api/canva/designs/${params}`, { credentials: 'include' });
      const data = await res.json();
      setDesigns(data.items || []);
    } catch {
      setDesigns([]);
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/canva/auth/', { credentials: 'include' });
      const data = await res.json();
      if (data.auth_url) window.location.href = data.auth_url;
    } catch (err) {
      console.error('Canva auth error:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/canva/disconnect/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': getCsrfToken() },
      });
      setConnected(false);
      setDesigns([]);
    } catch {}
  };

  const handleCreateDesign = async (presetName) => {
    setCreating(true);
    try {
      const res = await fetch('/api/canva/create/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({
          design_type: { type: 'preset', name: presetName },
          title: newTitle || undefined,
        }),
      });
      const data = await res.json();
      setPresetResult(data);
      setNewTitle('');
      setTimeout(() => fetchDesigns(), 2000);
    } catch (err) {
      console.error('Create design error:', err);
    }
    setCreating(false);
  };

  const handleAiDesign = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/canva/ai-design/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.error) {
        setAiResult({ error: data.error });
      } else {
        setAiResult(data);
        setTimeout(() => fetchDesigns(), 2000);
      }
    } catch (err) {
      setAiResult({ error: 'Failed to generate design' });
    }
    setAiGenerating(false);
  };

  const handleCopyContent = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleExport = async (designId, format = 'png') => {
    setExporting(designId);
    try {
      const res = await fetch('/api/canva/export/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ design_id: designId, format }),
      });
      const data = await res.json();
      if (data.job?.id) pollExport(data.job.id);
    } catch {
      setExporting(null);
    }
  };

  const pollExport = async (exportId) => {
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await fetch(`/api/canva/export/${exportId}/`, { credentials: 'include' });
        const data = await res.json();
        if (data.job?.status === 'success' && data.job?.urls) {
          data.job.urls.forEach((u) => window.open(u.url, '_blank'));
          setExporting(null);
        } else if (data.job?.status === 'failed') {
          setExporting(null);
        } else if (attempts < 30) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setExporting(null);
        }
      } catch {
        setExporting(null);
      }
    };
    poll();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDesigns(searchQuery);
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '10px 0', border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    background: active ? 'linear-gradient(135deg, #00c4cc, #7b2ff7)' : 'rgba(255,255,255,0.04)',
    color: active ? '#fff' : '#94a3b8',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '95vw', maxWidth: 1000, height: '90vh', maxHeight: 750,
        background: 'linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 100%)',
        borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #00c4cc 0%, #7b2ff7 50%, #ff6f61 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: '#fff',
            }}>C</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Canva Designer</div>
              <div style={{ color: '#94a3b8', fontSize: 11 }}>
                {connected ? 'Connected — Create & manage designs' : 'Connect your Canva account'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {connected && (
              <button onClick={handleDisconnect} title="Disconnect Canva" style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                color: '#ef4444', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <LogOut size={13} /> Disconnect
              </button>
            )}
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8,
              padding: '6px 10px', cursor: 'pointer', color: '#94a3b8',
            }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Not connected */}
          {connected === false && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: 20,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: 'linear-gradient(135deg, #00c4cc 0%, #7b2ff7 50%, #ff6f61 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontWeight: 800, color: '#fff',
              }}>C</div>
              <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>
                Connect Canva to Axom AI
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', maxWidth: 400 }}>
                Create presentations, social media posts, logos, posters and more — right inside Axom AI Tools.
              </p>
              <button onClick={handleConnect} style={{
                background: 'linear-gradient(135deg, #00c4cc, #7b2ff7)',
                border: 'none', borderRadius: 12, padding: '14px 36px',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(123,47,247,0.3)',
              }}>
                Connect with Canva
              </button>
            </div>
          )}

          {/* Loading */}
          {connected === null && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Loader2 size={28} style={{ color: '#7b2ff7', animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {/* Connected */}
          {connected && (
            <>
              {/* Action bar */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <button onClick={() => { setShowNewDesign(!showNewDesign); setAiResult(null); setPresetResult(null); }} style={{
                  background: showNewDesign
                    ? 'rgba(123,47,247,0.25)'
                    : 'linear-gradient(135deg, #00c4cc, #7b2ff7)',
                  border: showNewDesign ? '1px solid rgba(123,47,247,0.5)' : 'none',
                  borderRadius: 10, padding: '10px 20px',
                  color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Plus size={15} /> New Design
                </button>
                <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 200, display: 'flex', gap: 8 }}>
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.05)', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)', padding: '0 12px',
                  }}>
                    <Search size={14} style={{ color: '#64748b' }} />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search designs..."
                      style={{
                        flex: 1, background: 'none', border: 'none', outline: 'none',
                        color: '#fff', fontSize: 13, padding: '10px 0',
                      }}
                    />
                  </div>
                  <button type="submit" style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, padding: '0 14px', color: '#94a3b8', cursor: 'pointer',
                  }}>
                    <Search size={14} />
                  </button>
                </form>
                <button onClick={() => fetchDesigns(searchQuery)} title="Refresh" style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '0 12px', color: '#94a3b8', cursor: 'pointer',
                }}>
                  <RefreshCw size={14} />
                </button>
              </div>

              {/* New Design Panel with Tabs */}
              {showNewDesign && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.06)', padding: 20, marginBottom: 20,
                }}>
                  {/* Tab switcher */}
                  <div style={{
                    display: 'flex', gap: 6, marginBottom: 16,
                    background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4,
                  }}>
                    <button onClick={() => setNewDesignTab('design')} style={tabStyle(newDesignTab === 'design')}>
                      <Palette size={14} /> Design
                    </button>
                    <button onClick={() => setNewDesignTab('prompt')} style={tabStyle(newDesignTab === 'prompt')}>
                      <Sparkles size={14} /> Design by Prompt
                    </button>
                  </div>

                  {/* Tab: Design (presets) */}
                  {newDesignTab === 'design' && (
                    <>
                      <div style={{ marginBottom: 12 }}>
                        <input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Design title (optional)"
                          style={{
                            width: '100%', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                            padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: 10,
                      }}>
                        {DESIGN_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => handleCreateDesign(preset.name)}
                            disabled={creating}
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: 10, padding: '14px 10px',
                              color: '#e2e8f0', fontSize: 12, cursor: creating ? 'wait' : 'pointer',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                              transition: 'all 0.2s',
                              opacity: creating ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!creating) {
                                e.currentTarget.style.background = 'rgba(123,47,247,0.15)';
                                e.currentTarget.style.borderColor = 'rgba(123,47,247,0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            }}
                          >
                            <span style={{ fontSize: 22 }}>{preset.icon}</span>
                            <span style={{ fontWeight: 500 }}>{preset.label}</span>
                          </button>
                        ))}
                      </div>
                      {creating && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          color: '#7b2ff7', fontSize: 12, marginTop: 12,
                        }}>
                          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          Creating design in Canva...
                        </div>
                      )}
                      {presetResult?.design?.urls?.edit_url && !creating && (
                        <div style={{
                          marginTop: 14, padding: 14, background: 'rgba(16,185,129,0.1)',
                          border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Check size={16} style={{ color: '#34d399' }} />
                            <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>
                              Design created! — {presetResult.design.title || 'Untitled'}
                            </span>
                          </div>
                          <a
                            href={presetResult.design.urls.edit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: 'linear-gradient(135deg, #00c4cc, #7b2ff7)',
                              border: 'none', borderRadius: 8, padding: '8px 16px',
                              color: '#fff', fontSize: 12, fontWeight: 600,
                              textDecoration: 'none',
                              display: 'flex', alignItems: 'center', gap: 6,
                            }}
                          >
                            <ExternalLink size={13} /> Edit in Canva
                          </a>
                        </div>
                      )}
                    </>
                  )}

                  {/* Tab: Design by Prompt */}
                  {newDesignTab === 'prompt' && (
                    <>
                      <div style={{ marginBottom: 4 }}>
                        <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 12px' }}>
                          Describe what you want to create — AI will pick the best design type, generate content, and open it in Canva for editing.
                        </p>
                        <div style={{
                          display: 'flex', gap: 8,
                          background: 'rgba(255,255,255,0.05)', borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.08)', padding: '4px 4px 4px 14px',
                        }}>
                          <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAiDesign();
                              }
                            }}
                            placeholder="e.g. Create an Instagram post for a coffee shop grand opening with warm colors and a modern vibe..."
                            rows={3}
                            style={{
                              flex: 1, background: 'none', border: 'none', outline: 'none',
                              color: '#fff', fontSize: 13, resize: 'none', padding: '8px 0',
                              fontFamily: 'inherit',
                            }}
                          />
                          <button
                            onClick={handleAiDesign}
                            disabled={aiGenerating || !aiPrompt.trim()}
                            style={{
                              alignSelf: 'flex-end',
                              background: aiPrompt.trim()
                                ? 'linear-gradient(135deg, #00c4cc, #7b2ff7)'
                                : 'rgba(255,255,255,0.06)',
                              border: 'none', borderRadius: 10, padding: '10px 16px',
                              color: '#fff', cursor: aiGenerating || !aiPrompt.trim() ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', gap: 6,
                              fontSize: 12, fontWeight: 600, marginBottom: 4,
                            }}
                          >
                            {aiGenerating ? (
                              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Send size={14} />
                            )}
                            {aiGenerating ? 'Generating...' : 'Generate'}
                          </button>
                        </div>
                      </div>

                      {/* AI Result */}
                      {aiGenerating && (
                        <div style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          gap: 10, padding: 30, color: '#7b2ff7',
                        }}>
                          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
                          <span style={{ fontSize: 13 }}>AI is designing your template...</span>
                        </div>
                      )}

                      {aiResult && !aiResult.error && (
                        <div style={{
                          marginTop: 16, background: 'rgba(123,47,247,0.08)',
                          border: '1px solid rgba(123,47,247,0.2)', borderRadius: 12, padding: 16,
                        }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: 12,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Sparkles size={16} style={{ color: '#a78bfa' }} />
                              <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700 }}>
                                Design Created!
                              </span>
                            </div>
                            {aiResult.design?.urls?.edit_url && (
                              <a
                                href={aiResult.design.urls.edit_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: 'linear-gradient(135deg, #00c4cc, #7b2ff7)',
                                  border: 'none', borderRadius: 8, padding: '8px 16px',
                                  color: '#fff', fontSize: 12, fontWeight: 600,
                                  textDecoration: 'none',
                                  display: 'flex', alignItems: 'center', gap: 6,
                                }}
                              >
                                <ExternalLink size={13} /> Edit in Canva
                              </a>
                            )}
                          </div>

                          <div style={{
                            color: '#94a3b8', fontSize: 11, marginBottom: 12,
                          }}>
                            Type: <span style={{ color: '#a78bfa' }}>{aiResult.ai_design_type}</span>
                          </div>

                          {/* AI Generated Content — copy to use in Canva */}
                          {aiResult.ai_content && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>
                                Step 1: Copy the content below, then click "Edit in Canva" to paste it:
                              </div>
                              {aiResult.ai_content.heading && (
                                <ContentRow
                                  label="Heading"
                                  text={aiResult.ai_content.heading}
                                  copied={copied}
                                  onCopy={handleCopyContent}
                                />
                              )}
                              {aiResult.ai_content.subheading && (
                                <ContentRow
                                  label="Subheading"
                                  text={aiResult.ai_content.subheading}
                                  copied={copied}
                                  onCopy={handleCopyContent}
                                />
                              )}
                              {aiResult.ai_content.body && (
                                <ContentRow
                                  label="Body"
                                  text={aiResult.ai_content.body}
                                  copied={copied}
                                  onCopy={handleCopyContent}
                                />
                              )}
                              {aiResult.ai_content.color_scheme && (
                                <div style={{
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8,
                                }}>
                                  <span style={{ color: '#64748b', fontSize: 11, minWidth: 80 }}>Colors:</span>
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    {aiResult.ai_content.color_scheme.map((c, i) => (
                                      <button
                                        key={i}
                                        onClick={() => handleCopyContent(c, `color-${i}`)}
                                        title={`Click to copy ${c}`}
                                        style={{
                                          width: 28, height: 28, borderRadius: 6,
                                          background: c, border: '2px solid rgba(255,255,255,0.15)',
                                          cursor: 'pointer', position: 'relative',
                                        }}
                                      >
                                        {copied === `color-${i}` && (
                                          <Check size={12} style={{
                                            position: 'absolute', top: '50%', left: '50%',
                                            transform: 'translate(-50%, -50%)', color: '#fff',
                                            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))',
                                          }} />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {aiResult.ai_content.style_notes && (
                                <div style={{
                                  padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8,
                                  color: '#94a3b8', fontSize: 11, fontStyle: 'italic',
                                }}>
                                  💡 {aiResult.ai_content.style_notes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {aiResult?.error && (
                        <div style={{
                          marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                          color: '#ef4444', fontSize: 12,
                        }}>
                          {aiResult.error}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Designs grid */}
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <Loader2 size={24} style={{ color: '#7b2ff7', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : designs.length === 0 ? (
                <div style={{
                  textAlign: 'center', color: '#64748b', padding: 60, fontSize: 14,
                }}>
                  <Palette size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <div>No designs found. Create your first design above!</div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 16,
                }}>
                  {designs.map((design) => (
                    <div key={design.id} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 14, overflow: 'hidden', transition: 'all 0.2s',
                    }}>
                      <div style={{
                        width: '100%', aspectRatio: '4/3',
                        background: 'rgba(255,255,255,0.02)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        {design.thumbnail?.url ? (
                          <img
                            src={design.thumbnail.url}
                            alt={design.title || 'Design'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Palette size={30} style={{ color: '#334155' }} />
                        )}
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{
                          color: '#e2e8f0', fontSize: 13, fontWeight: 600,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {design.title || 'Untitled'}
                        </div>
                        <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                          {design.created_at ? new Date(design.created_at * 1000).toLocaleDateString() : ''}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          {design.urls?.edit_url && (
                            <a
                              href={design.urls.edit_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                flex: 1, background: 'rgba(123,47,247,0.15)',
                                border: '1px solid rgba(123,47,247,0.3)',
                                borderRadius: 6, padding: '6px 0',
                                color: '#a78bfa', fontSize: 11, fontWeight: 600,
                                textDecoration: 'none', textAlign: 'center',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                              }}
                            >
                              <ExternalLink size={11} /> Edit
                            </a>
                          )}
                          <button
                            onClick={() => handleExport(design.id, 'png')}
                            disabled={exporting === design.id}
                            style={{
                              flex: 1, background: 'rgba(16,185,129,0.12)',
                              border: '1px solid rgba(16,185,129,0.3)',
                              borderRadius: 6, padding: '6px 0',
                              color: '#34d399', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            }}
                          >
                            {exporting === design.id ? (
                              <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Download size={11} />
                            )}
                            PNG
                          </button>
                          <button
                            onClick={() => handleExport(design.id, 'pdf')}
                            disabled={exporting === design.id}
                            style={{
                              flex: 1, background: 'rgba(59,130,246,0.12)',
                              border: '1px solid rgba(59,130,246,0.3)',
                              borderRadius: 6, padding: '6px 0',
                              color: '#60a5fa', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            }}
                          >
                            {exporting === design.id ? (
                              <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Download size={11} />
                            )}
                            PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ContentRow({ label, text, copied, onCopy }) {
  const key = `content-${label}`;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 8,
      padding: '8px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8,
    }}>
      <span style={{ color: '#64748b', fontSize: 11, minWidth: 80, paddingTop: 2 }}>{label}:</span>
      <span style={{ color: '#e2e8f0', fontSize: 12, flex: 1, lineHeight: 1.4 }}>{text}</span>
      <button
        onClick={() => onCopy(text, key)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: copied === key ? '#34d399' : '#64748b', padding: 2, flexShrink: 0,
        }}
        title="Copy"
      >
        {copied === key ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
}
