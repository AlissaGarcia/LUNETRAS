import { useState } from 'react';
import type { FormEvent } from 'react';
import { API_URL } from '../../config/env';
import { ApiError } from '../../services/api';
import { login } from '../../services/auth';
import styles from './Login.module.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await login({ email, senha });

      localStorage.setItem('lunetras_token', response.token);
      localStorage.setItem('lunetras_usuario', JSON.stringify(response.usuario));

      setIsError(false);
      setMessage(`Login realizado com sucesso. Bem-vinda(o), ${response.usuario.nome}.`);
    } catch (error) {
      setIsError(true);

      if (error instanceof ApiError) {
        setMessage(`Falha ao autenticar (${error.status}). Verifique os dados e tente novamente.`);
      } else {
        setMessage('Não foi possível conectar com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>LUNETRAS</h1>
        <p className={styles.subtitle}>Conectado com API em: {API_URL}</p>

        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="professor@escola.com"
          autoComplete="email"
          required
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        {message ? (
          <p className={isError ? styles.errorMessage : styles.successMessage}>{message}</p>
        ) : null}
      </form>
    </div>
  );
}
