import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Trash2, Database, Layers, HardDrive, ChevronLeft, RefreshCw } from 'lucide-react';
import { getCsrfToken } from '../utils/security';

export default function AdminPanel({ onBackToChat }) {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalChunks: 0,
    storageDisplay: '0 KB',
  });
  const [isFetching, setIsFetching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    setIsFetching(true);
    try {
      const res = await fetch('/api/documents/', {
        headers: {
          'Accept': 'application/json',
        }
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents || []);
        setStats({
          totalDocs: data.total_docs || 0,
          totalChunks: data.total_chunks || 0,
          storageDisplay: data.storage_display || '0 KB',
        });
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress('Uploading and Indexing...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken() || '',
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadProgress('Successfully Indexed!');
        setTimeout(() => setUploadProgress(null), 3000);
        // Refresh docs
        fetchDocuments();
      } else {
        setUploadError(data.error || 'Upload failed.');
        setUploadProgress(null);
      }
    } catch (err) {
      setUploadError(err.message || 'Network error occurred during upload.');
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document? All associated database chunks will be removed.')) return;

    try {
      const res = await fetch(`/api/delete-document/${docId}/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken() || '',
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchDocuments();
      } else {
        alert(data.error || 'Delete failed.');
      }
    } catch (err) {
      alert(err.message || 'Network error occurred.');
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="admin-layout" style={{ overflowY: 'auto', minHeight: '100vh', width: '100%' }}>
      {/* Admin Navbar */}
      <nav className="admin-navbar">
        <div className="admin-nav-left">
          <button className="btn-back-chat" onClick={onBackToChat}>
            <ChevronLeft size={16} />
            <span>Back to Workspace</span>
          </button>
          <span className="admin-badge">Admin Dashboard</span>
        </div>
        <button
          className="icon-btn"
          onClick={fetchDocuments}
          disabled={isFetching}
          title="Refresh Data"
          style={{ width: '36px', height: '36px', borderRadius: '10px' }}
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </nav>

      {/* Admin Body Container */}
      <div className="admin-body">
        <div className="admin-header-title">
          <h1 className="admin-main-heading">Knowledge Base Ingestion</h1>
          <p className="admin-sub-heading">Upload PDFs, spreadsheets, or text files to build the AI's internal database chunks.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-purple">
              <Database size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalDocs}</span>
              <span className="stat-label">Total Documents</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-pink">
              <Layers size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalChunks}</span>
              <span className="stat-label">Database Chunks</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-blue">
              <HardDrive size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.storageDisplay}</span>
              <span className="stat-label">Total Storage</span>
            </div>
          </div>
        </div>

        {/* Upload Dropzone Section */}
        <div className="upload-section-card">
          <div
            className={`dropzone ${isDragOver ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.jsonl,.json"
            />
            <div className="upload-cloud-icon">
              <UploadCloud size={28} />
            </div>
            <span className="upload-title">Drag & drop files here or click to upload</span>
            <p className="upload-subtitle">Supported formats: PDF, Word (DOCX), CSV, Excel (XLSX/XLS), Text, JSONL (Q&A). Files will be parsed and broken into semantic chunks.</p>
            <div className="supported-tags">
              <span className="type-tag">PDF</span>
              <span className="type-tag">DOCX</span>
              <span className="type-tag">EXCEL</span>
              <span className="type-tag">CSV</span>
              <span className="type-tag">TXT</span>
              <span className="type-tag">JSONL</span>
            </div>
          </div>

          {uploadProgress && (
            <div style={{ padding: '12px 16px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--accent-pink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="typing-dots">{uploadProgress}</span>
            </div>
          )}

          {uploadError && (
            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', fontSize: '0.85rem', color: '#f87171' }}>
              ⚠️ {uploadError}
            </div>
          )}
        </div>

        {/* Document Management Table */}
        <div className="table-section-card">
          <div className="table-header-row">
            <span className="table-title">Ingested Files</span>
          </div>

          <div className="docs-table-wrapper">
            {documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No documents found in the database. Use the dropzone above to index your first file.
              </div>
            ) : (
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Size</th>
                    <th>Type</th>
                    <th>Chunks</th>
                    <th>Status</th>
                    <th>Uploaded At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="file-name-cell">
                        <FileText size={16} style={{ color: 'var(--accent-pink)' }} />
                        <span>{doc.title}</span>
                      </td>
                      <td>{doc.file_size}</td>
                      <td>
                        <span className="type-tag" style={{ fontSize: '0.66rem', textTransform: 'uppercase' }}>
                          {doc.file_type}
                        </span>
                      </td>
                      <td>{doc.chunks_count}</td>
                      <td>
                        <span style={{
                          color: doc.status === 'Indexed' ? '#4ade80' : '#fbbf24',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          background: doc.status === 'Indexed' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {doc.status}
                        </span>
                      </td>
                      <td>{doc.uploaded_at}</td>
                      <td>
                        <button
                          className="icon-btn"
                          onClick={() => handleDelete(doc.id)}
                          style={{
                            color: '#f87171',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.15)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                            e.currentTarget.style.borderColor = '#ef4444';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                          }}
                          title="Delete File"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
