import { apiRequest } from './api';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface User {
  id: string;
  nome: string;
  perfil: 'ADMINISTRADOR' | 'PROFESSOR';
}

export interface LoginResponse {
  token: string;
  usuario: User;
}

interface BackendLoginResponse {
  token: string;
  nome: string;
  perfil: User['perfil'];
}

function isFrontendLoginResponse(response: LoginResponse | BackendLoginResponse): response is LoginResponse {
  return 'usuario' in response;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse | BackendLoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });

  if (isFrontendLoginResponse(response)) {
    return response;
  }

  return {
    token: response.token,
    usuario: {
      id: '',
      nome: response.nome,
      perfil: response.perfil,
    },
  };
}
