import { createContext, useContext, useRef, useState } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [estado, setEstado] = useState(null);
  const resolveRef = useRef(null);

  function confirm(mensagem) {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setEstado({ mensagem });
    });
  }

  function responder(resultado) {
    resolveRef.current?.(resultado);
    setEstado(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {estado && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 24,
          }}
          onClick={() => responder(false)}
        >
          <div
            style={{
              background: 'var(--card, #fff)', borderRadius: 16,
              padding: '24px 28px', maxWidth: 360, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ margin: '0 0 20px', fontSize: '1rem', color: 'var(--text, #1e293b)', lineHeight: 1.5 }}>
              {estado.mensagem}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => responder(false)}
                style={{
                  padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: 'transparent', color: 'var(--text, #1e293b)',
                  cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => responder(true)}
                style={{
                  padding: '8px 18px', borderRadius: 8, border: 'none',
                  background: '#f97316', color: '#fff',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm deve ser usado dentro de ConfirmProvider');
  return ctx;
}
