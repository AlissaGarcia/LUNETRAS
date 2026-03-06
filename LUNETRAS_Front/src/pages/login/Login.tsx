import { useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../../services/api';
import { login } from '../../services/auth';
import styles from './Login.module.css';

interface LoginProps {
  onLoginSuccess?: () => void;
}

const DEV_BYPASS = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_LOGIN !== 'false';

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

      if (rememberMe) {
        localStorage.setItem('lunetras_email', email);
      } else {
        localStorage.removeItem('lunetras_email');
      }

      setIsError(false);
      setMessage(`Login realizado com sucesso. Bem-vinda(o), ${response.usuario.nome}.`);
      onLoginSuccess?.();
    } catch (error) {
      setIsError(true);

      if (error instanceof ApiError) {
        setMessage(`Falha ao autenticar (${error.status}). Verifique os dados e tente novamente.`);
      } else {
        setMessage('Nao foi possivel conectar com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleDevAccess() {
    localStorage.setItem('lunetras_token', 'token-dev-lunetras');
    localStorage.setItem(
      'lunetras_usuario',
      JSON.stringify({
        id: 'dev-admin',
        nome: 'Administrador(a) Dev',
        perfil: 'ADMINISTRADOR',
      }),
    );

    setIsError(false);
    setMessage('Modo desenvolvimento ativo. Acesso liberado para o painel.');
    onLoginSuccess?.();
  }

  return (
    <main className={styles.page}>
      <section className={styles.loginShell}>
        <aside className={styles.visualPanel} aria-label="Ilustracao de apoio ao login" />

        <form className={styles.formPanel} onSubmit={handleSubmit}>
          <h1>Bem-vindo(a) ao LUNETRAS!</h1>
          <p className={styles.lead}>Faca login para acessar sua conta de Professor(a) ou Administrador(a).</p>

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seuemail@escola.com"
            autoComplete="email"
            required
          />

          <div className={styles.passwordLabelRow}>
            <label htmlFor="senha">Senha</label>
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <div className={styles.passwordField}>
            <input
              id="senha"
              type={showPassword ? 'text' : 'password'}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
            <span className={styles.eyeIcon} aria-hidden="true">
              o
            </span>
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {DEV_BYPASS ? (
            <button type="button" className={styles.devButton} onClick={handleDevAccess}>
              Entrar em modo desenvolvimento
            </button>
          ) : null}

          <a className={styles.forgotPassword} href="#">
            Esqueceu sua senha?
          </a>

          {message ? (
            <p className={isError ? styles.errorMessage : styles.successMessage}>{message}</p>
          ) : null}

          <div className={styles.divider} />

          <label className={styles.rememberRow}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Lembrar-me</span>
          </label>

          <p className={styles.helperText}>
            Este sistema e para uso exclusivo de professores e administradores. Proteja suas credenciais.
          </p>
        </form>
      </section>

      <img
        className={styles.brandCredit}
        src="/DESBRAV-Technology-todos-os-direitos-reservados-sem-fundo.png"
        alt="Desbrav Technology"
      />
    </main>
  );
}
