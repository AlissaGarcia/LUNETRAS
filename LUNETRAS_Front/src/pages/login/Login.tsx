import { useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../../services/api';
import { login } from '../../services/auth';
import styles from './Login.module.css';

interface LoginProps {
  onLoginSuccess?: () => void;
}

const LOCAL_LOGIN_USERS = [
  {
    id: 'admin-local',
    nome: 'Administrador(a)',
    email: 'admin@lunetras.com',
    senha: 'admin',
    perfil: 'ADMINISTRADOR' as const,
  },
  {
    id: 'prof-carla',
    nome: 'Carla',
    email: 'carla.prof@escola.com',
    senha: '123456',
    perfil: 'PROFESSOR' as const,
  },
  {
    id: 'prof-renata',
    nome: 'Renata',
    email: 'renata.prof@escola.com',
    senha: '123456',
    perfil: 'PROFESSOR' as const,
  },
  {
    id: 'prof-marcos',
    nome: 'Marcos',
    email: 'marcos.prof@escola.com',
    senha: '123456',
    perfil: 'PROFESSOR' as const,
  },
];

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

      localStorage.setItem('lunetras_usuario', JSON.stringify(response.usuario));

      if (rememberMe) {
        localStorage.setItem('lunetras_email', email);
      } else {
        localStorage.removeItem('lunetras_email');
      }

      setIsError(false);
       localStorage.setItem('lunetras_auth', 'true');
      setMessage(`Login realizado com sucesso. Bem-vinda(o), ${response.usuario.nome}.`);
      onLoginSuccess?.();
    } catch (error) {
      const localUser = LOCAL_LOGIN_USERS.find(
        (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.senha === senha,
      );

      if (localUser) {
        localStorage.setItem(
          'lunetras_usuario',
          JSON.stringify({
            id: localUser.id,
            nome: localUser.nome,
            perfil: localUser.perfil,
            email: localUser.email,
          }),
        );
        localStorage.setItem('lunetras_auth', 'true');
        setIsError(false);
        setMessage(`Login local realizado com sucesso. Bem-vinda(o), ${localUser.nome}.`);
        onLoginSuccess?.();
      } else {
        setIsError(true);

        if (error instanceof ApiError) {
          setMessage(`Falha ao autenticar (${error.status}). Verifique os dados e tente novamente.`);
        } else {
          setMessage('Não foi possível conectar com o servidor.');
        }
      }
    } finally {
      setLoading(false);
    }
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
    </main>
  );
}
