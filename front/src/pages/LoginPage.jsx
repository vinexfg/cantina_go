import { useState } from 'react';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [isAluno, setIsAluno] = useState(true);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        
        <header className={styles.loginHeader}>
          <h1>CantinaGO</h1>
          <p>Reserve seu lanche com antecedência</p>
        </header>

        <div className={styles.tabsList}>
          <button 
            className={`${styles.tabTrigger} ${isAluno ? styles.activeTab : ''}`}
            onClick={() => setIsAluno(true)}
          >
            Aluno
          </button>
          <button 
            className={`${styles.tabTrigger} ${!isAluno ? styles.activeTab : ''}`}
            onClick={() => setIsAluno(false)}
          >
            Vendedor
          </button>
        </div>

        <main className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{isAluno ? 'Login de Aluno' : 'Login de Vendedor'}</h2>
            <p>
              {isAluno 
                ? 'Entre para ver o menu e fazer reservas' 
                : 'Acesse o painel para gerenciar o menu'}
            </p>
          </div>

          <form>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input 
                id="email" 
                type="email" 
                placeholder={isAluno ? "seu.email@escola.br" : "vendedor@cantinago.br"} 
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="senha">Senha</label>
              <input 
                id="senha" 
                type="password" 
                placeholder="••••••••" 
              />
            </div>

            <button type="submit" className={styles.btnSubmit}>
              Entrar
            </button>
          </form>
        </main>

      </div>
    </div>
  );
}