'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Download, Search, ExternalLink, RefreshCw, Loader2, LogOut, Palette } from 'lucide-react';
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
  const [showPresets, setShowPresets] = useState(false);
  const [newTitle, setNewTitle] = useState('');

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
      if (data.design?.urls?.edit_url) {
        window.open(data.design.urls.edit_url, '_blank');
      }
      setNewTitle('');
      setShowPresets(false);
      setTimeout(() => fetchDesigns(), 2000);
    } catch (err) {
      console.error('Create design error:', err);
    }
    setCreating(false);
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
      if (data.job?.id) {
        pollExport(data.job.id);
      }
    } catch (err) {
      console.error('Export error:', err);
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '95vw', maxWidth: 1000, height: '90vh', maxHeight: 700,
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
          {/* Not connected — show connect button */}
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

          {/* Connected — show designs */}
          {connected && (
            <>
              {/* Action bar */}
              <div style={{
                display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
              }}>
                <button onClick={() => setShowPresets(!showPresets)} style={{
                  background: 'linear-gradient(135deg, #00c4cc, #7b2ff7)',
                  border: 'none', borderRadius: 10, padding: '10px 20px',
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

              {/* Create design panel */}
              {showPresets && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.06)', padding: 20, marginBottom: 20,
                }}>
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
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
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
                          color: '#e2e8f0', fontSize: 12, cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(123,47,247,0.15)';
                          e.currentTarget.style.borderColor = 'rgba(123,47,247,0.4)';
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
                      {/* Thumbnail */}
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
                      {/* Info */}
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
                        {/* Actions */}
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
                              color: '#34d399', fontSize: 11, fontWeight: 600,
                              cursor: 'pointer',
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
                              color: '#60a5fa', fontSize: 11, fontWeight: 600,
                              cursor: 'pointer',
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
