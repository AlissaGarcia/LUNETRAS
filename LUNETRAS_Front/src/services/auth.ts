import { apiRequest } from './api';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface User {
  id: string;
  nome: string;
  perfil: 'ADMINISTRADOR' | 'PROFESSOR';
  email?: string;
}

export interface LoginResponse {
  usuario: User;
  token: string;
}

interface BackendLoginResponse {
  token: string;
  nome: string;
  perfil: string;
  id: number | string;
}

function normalizeProfile(perfil: string): User['perfil'] {
  if (perfil === 'PROFESSOR') {
    return 'PROFESSOR';
  }

  return 'ADMINISTRADOR';
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiRequest<BackendLoginResponse>('/auth/login', {
    method: 'POST',
    body: {
      email: payload.email,
      senha: payload.senha,
    },
  });

  // O backend agora usa JWT: salvamos o token para autorizar as próximas requisições.
  localStorage.setItem('lunetras_token', response.token);

  return {
    token: response.token,
    usuario: {
      id: String(response.id ?? ''),
      nome: response.nome ?? '',
      perfil: normalizeProfile(response.perfil ?? ''),
      email: payload.email,
    },
  };
}

export async function logout(): Promise<void> {
  // Backend JWT não precisa de logout server-side para invalidar o token local.
  localStorage.removeItem('lunetras_token');
}

