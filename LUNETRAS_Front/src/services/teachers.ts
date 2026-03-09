import { apiRequest } from './api';

export interface TeacherApiPayload {
  id?: number | string;
  nome?: string;
  email?: string;
  perfil?: string;
  ativo?: boolean;
}

export interface Teacher {
  id: string;
  nome: string;
  email: string;
  perfil: 'PROFESSOR';
  ativo: boolean;
  senhaInicial?: string;
}

export interface CreateTeacherPayload {
  nome: string;
  email: string;
  senha: string;
}

function normalizeTeacher(payload: TeacherApiPayload): Teacher {
  return {
    id: String(payload.id ?? `prof-${Date.now()}`),
    nome: payload.nome ?? 'Professor(a) sem nome',
    email: payload.email ?? '',
    perfil: 'PROFESSOR',
    ativo: payload.ativo ?? true,
  };
}

export async function listTeachers(): Promise<Teacher[]> {
  const payload = await apiRequest<TeacherApiPayload[]>('/admin/usuarios', { method: 'GET' });
  return payload
    .filter((item) => item.perfil === 'PROFESSOR')
    .map((item) => normalizeTeacher(item));
}

export async function createTeacher(payload: CreateTeacherPayload): Promise<Teacher> {
  // O backend atual usa senha inicial automática (RF005), então envia apenas os campos aceitos.
  const created = await apiRequest<TeacherApiPayload>('/admin/usuarios/professores', {
    method: 'POST',
    body: {
      nome: payload.nome,
      email: payload.email,
    },
  });

  return normalizeTeacher(created);
}

export async function disableTeacher(teacherId: string): Promise<void> {
  await apiRequest<void>(`/admin/usuarios/${teacherId}/desativar`, {
    method: 'PATCH',
  });
}

export async function activateTeacher(teacherId: string): Promise<void> {
  await apiRequest<void>(`/admin/usuarios/${teacherId}/ativar`, {
    method: 'PATCH',
  });
}
