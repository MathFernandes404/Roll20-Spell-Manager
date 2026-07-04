import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  characterName?: string;
  spellCount?: number;
  onClearCharacter?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  characterName,
  spellCount = 0,
  onClearCharacter,
}) => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoGroup}>
            <img src="/logo.png" alt="Logo" style={styles.logoImg} />
            <h1 style={styles.title}>
              Roll20 <span style={styles.titleHighlight}>Spell Manager</span>
            </h1>
          </div>
          
          {characterName && (
            <div style={styles.charBadge}>
              <span style={styles.charIcon}>👤</span>
              <div style={styles.charInfo}>
                <span style={styles.charName}>{characterName}</span>
                <span style={styles.charMeta}>{spellCount} spells loaded</span>
              </div>
              {onClearCharacter && (
                <button 
                  onClick={onClearCharacter} 
                  style={styles.clearBtn} 
                  title="Unload character"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      
      <main style={styles.main}>
        <div style={styles.banner}>
          <span style={styles.bannerIcon}>⚠️</span>
          <span style={styles.bannerText}>
            <strong>Ficha de Personagem Clássica:</strong> Esta ferramenta foi desenvolvida exclusivamente para o modelo de ficha oficial clássico <strong>D&D 5e (2014/OGL)</strong> no Roll20 (não compatível com a nova ficha de 2024 do Roll20).
          </span>
        </div>
        {children}
      </main>
      
      <footer style={styles.footer}>
        <p>Roll20 Spell Manager © {new Date().getFullYear()} — Built for VTT Tabletop Productivity</p>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    borderRadius: 'var(--radius-lg)',
    padding: '0.75rem 1.25rem',
    marginBottom: '1.5rem',
    textAlign: 'left',
  },
  bannerIcon: {
    fontSize: '1.25rem',
  },
  bannerText: {
    fontSize: '0.825rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
  },
  header: {
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-muted)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(8px)',
  },
  headerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoImg: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(233, 30, 99, 0.4)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: 0,
  },
  titleHighlight: {
    color: 'var(--color-primary)',
    background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  charBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-lg)',
    padding: '0.5rem 1rem',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s ease',
  },
  charIcon: {
    fontSize: '1.25rem',
  },
  charInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  charName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  charMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  clearBtn: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    marginLeft: '0.5rem',
    padding: '0.25rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    maxWidth: '1280px',
    width: '100%',
    margin: '0 auto',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
  },
  footer: {
    padding: '1.5rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border-muted)',
    backgroundColor: 'var(--bg-secondary)',
  },
};
