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
  usuario: User;
}

interface BackendMeResponse  {
  nome: string;
  perfil:string;
}

function normalizeProfile(perfil: string): User['perfil'] {
  if (perfil === 'PROFESSOR') {
    return 'PROFESSOR';
  }

  return 'ADMINISTRADOR';
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  await apiRequest<void>('/auth/login', {
     method: 'POST',
     body: new URLSearchParams({
       username: payload.email,
       password: payload.senha,
     }),
  });

  const me = await apiRequest<BackendMeResponse>('/auth/me', {
     method: 'GET',
   });

   return {
     usuario: {
       id: '',
       nome: me.nome,
       perfil: normalizeProfile(me.perfil),
     },
   };
 }

 export async function logout(): Promise<void> {
   await apiRequest<void>('/auth/logout', {
     method: 'POST',
   });
 }