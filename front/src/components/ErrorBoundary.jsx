import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  render() {
    if (this.state.erro) {
      return (
        <div className={styles.container}>
          <span className={styles.icone}>⚠</span>
          <h1 className={styles.titulo}>Algo deu errado</h1>
          <p className={styles.descricao}>
            Um erro inesperado aconteceu. Recarregue a página para continuar.
          </p>
          <button className={styles.btnRecarregar} onClick={() => window.location.reload()}>
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
