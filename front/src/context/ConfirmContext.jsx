import { createContext, useContext, useRef, useState } from 'react';
import styles from './ConfirmContext.module.css';

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
        <div className={styles.overlay} onClick={() => responder(false)}>
          <div className={styles.dialog} onClick={e => e.stopPropagation()}>
            <p className={styles.mensagem}>{estado.mensagem}</p>
            <div className={styles.acoes}>
              <button className={styles.btnCancelar} onClick={() => responder(false)}>
                Cancelar
              </button>
              <button className={styles.btnConfirmar} onClick={() => responder(true)}>
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
