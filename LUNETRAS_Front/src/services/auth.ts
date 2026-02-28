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

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}
