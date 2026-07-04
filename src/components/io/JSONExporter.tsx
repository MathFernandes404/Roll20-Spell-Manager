import React from 'react';
import type { Roll20Character } from '../../types/roll20';

interface JSONExporterProps {
  characterName: string;
  spellCount: number;
  onExport: () => Roll20Character | null;
}

export const JSONExporter: React.FC<JSONExporterProps> = ({
  characterName,
  spellCount,
  onExport,
}) => {
  const triggerDownload = () => {
    const exportedJson = onExport();
    if (!exportedJson) return;

    const dataStr = JSON.stringify(exportedJson, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${characterName.replace(/\s+/g, '_')}_spellbook_edited.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div style={styles.card}>
      <div style={styles.content}>
        <div style={styles.stats}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Character</span>
            <span style={styles.statValue}>{characterName}</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Total Spells</span>
            <span style={styles.statValue}>{spellCount}</span>
          </div>
        </div>

        <button onClick={triggerDownload} style={styles.exportBtn}>
          💾 Export Roll20 Character JSON
        </button>

        <p style={styles.infoTip}>
          This JSON file is ready to be uploaded back into Roll20.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-md)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
  },
  statBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  statValue: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    textAlign: 'center',
  },
  exportBtn: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--color-success)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.2s ease',
  },
  infoTip: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    margin: 0,
  },
};
