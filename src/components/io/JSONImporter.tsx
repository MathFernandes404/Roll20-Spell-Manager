import React, { useState, useRef } from 'react';
import type { Roll20Character } from '../../types/roll20';

interface JSONImporterProps {
  onImport: (json: Roll20Character) => void;
  error: string | null;
}

export const JSONImporter: React.FC<JSONImporterProps> = ({ onImport, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processJson = (text: string) => {
    try {
      setLocalError(null);
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure. Must be a valid object.');
      }
      if (!Array.isArray(parsed.attribs) && !Array.isArray(parsed.attributes)) {
        throw new Error('Invalid format: Roll20 characters must contain an "attribs" or "attributes" array.');
      }
      onImport(parsed);
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to parse JSON. Please check the file formatting.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processJson(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processJson(text);
      };
      reader.readAsText(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePasteSubmit = () => {
    processJson(jsonText);
  };

  const displayError = error || localError;

  return (
    <div style={styles.card} className="fade-in">
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>Import Roll20 Character</h2>
        <p style={styles.cardSubtitle}>
          Import the exported JSON file from your Roll20 character sheet.
        </p>
      </div>

      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tabBtn,
            ...(pasteMode ? {} : styles.activeTabBtn),
          }}
          onClick={() => setPasteMode(false)}
        >
          📂 File Upload
        </button>
        <button
          style={{
            ...styles.tabBtn,
            ...(pasteMode ? styles.activeTabBtn : {}),
          }}
          onClick={() => setPasteMode(true)}
        >
          📝 Paste JSON Text
        </button>
      </div>

      {displayError && (
        <div style={styles.errorAlert}>
          <span style={styles.errorIcon}>⚠️</span>
          <div style={styles.errorContent}>
            <strong>Import Error</strong>
            <p style={styles.errorText}>{displayError}</p>
          </div>
        </div>
      )}

      {!pasteMode ? (
        <div
          style={{
            ...styles.dropzone,
            ...(dragActive ? styles.dropzoneActive : {}),
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={styles.hiddenInput}
          />
          <span style={styles.uploadIcon}>📥</span>
          <p style={styles.uploadText}>
            Drag and drop your character <strong>.json</strong> file here, or{' '}
            <span style={styles.browseText}>browse your computer</span>
          </p>
          <span style={styles.uploadTip}>Compatible with VTT Enhancement Suite and Roll20 Character Vault exports</span>
        </div>
      ) : (
        <div style={styles.pasteContainer}>
          <textarea
            style={styles.textarea}
            placeholder="Paste character JSON text here..."
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          <button
            onClick={handlePasteSubmit}
            disabled={!jsonText.trim()}
            style={{
              ...styles.submitBtn,
              ...(!jsonText.trim() ? styles.disabledBtn : {}),
            }}
          >
            Load Character Spells
          </button>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-xl)',
    padding: '2rem',
    boxShadow: 'var(--shadow-lg)',
    maxWidth: '640px',
    width: '100%',
    margin: '3rem auto',
    textAlign: 'center',
  },
  cardHeader: {
    marginBottom: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.5rem',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  cardSubtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  tabContainer: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-muted)',
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
  },
  tabBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
  },
  activeTabBtn: {
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-muted)',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--color-danger)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem',
    marginBottom: '1.5rem',
    textAlign: 'left',
  },
  errorIcon: {
    fontSize: '1.25rem',
  },
  errorContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  errorText: {
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    margin: 0,
  },
  dropzone: {
    border: '2px dashed var(--border-muted)',
    borderRadius: 'var(--radius-lg)',
    padding: '3rem 2rem',
    cursor: 'pointer',
    backgroundColor: 'var(--bg-tertiary)',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  dropzoneActive: {
    borderColor: 'var(--color-primary)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  hiddenInput: {
    display: 'none',
  },
  uploadIcon: {
    fontSize: '3rem',
    lineHeight: 1,
  },
  uploadText: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
  },
  browseText: {
    color: 'var(--color-primary)',
    textDecoration: 'underline',
    fontWeight: 600,
  },
  uploadTip: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  pasteContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  textarea: {
    width: '100%',
    height: '180px',
    resize: 'vertical',
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
  },
  submitBtn: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-muted)',
    color: 'var(--text-muted)',
  },
};
