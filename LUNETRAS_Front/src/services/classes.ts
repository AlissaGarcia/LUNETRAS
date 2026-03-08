import { API_URL } from '../config/env';
import type { ClassRoom, LiteracyStage } from '../pages/admin/metrics';
import type { Student } from '../pages/admin/mockData';
import type { StudentStatus } from '../pages/admin/types';

interface ClassApiPayload {
  id?: string | number;
  nome?: string;
  professor?: string;
  professorNome?: string;
  totalAlunos?: number;
  alunosAlfabeticos?: number;
  pendencias?: number;
  ativa?: boolean;
}

interface StudentApiPayload {
  id?: string | number;
  nome?: string;
  dataNascimento?: string;
  nivel?: LiteracyStage;
  status?: StudentStatus;
  observacoes?: string;
  nomeTurma?: string;
}

interface CollectionPayload<T> {
  data?: T[];
  content?: T[];
}

const CLASS_ENDPOINTS = ['/turmas', '/classes'];

function toStringId(value: string | number | undefined, fallback: string): string {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return String(value);
}

function normalizeClass(payload: ClassApiPayload, fallbackId: string): ClassRoom {
  return {
    id: toStringId(payload.id, fallbackId),
    nome: payload.nome ?? 'Turma sem nome',
    professor: payload.professor ?? payload.professorNome ?? 'A definir',
    totalAlunos: payload.totalAlunos ?? 0,
    alunosAlfabeticos: payload.alunosAlfabeticos ?? 0,
    pendencias: payload.pendencias ?? 0,
    ativa: payload.ativa ?? true,
  };
}

function normalizeStudent(payload: StudentApiPayload, fallbackId: string): Student {
  return {
    id: toStringId(payload.id, fallbackId),
    nome: payload.nome ?? 'Aluno sem nome',
    dataNascimento: payload.dataNascimento ?? '2017-01-01',
    nivel: payload.nivel ?? 'SEM_DADOS',
    status: payload.status ?? 'PENDING',
    observacoes: payload.observacoes ?? '',
  };
}

async function requestWithFallback<T>(endpoints: string[], init: RequestInit): Promise<T> {
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...init,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
      });

      if (response.status === 404) {
        continue;
      }

      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao acessar ${endpoint}`);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Falha de comunicação com a API.');
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Nenhum endpoint disponível para a operação solicitada.');
}

function extractCollection<T>(payload: T[] | CollectionPayload<T>): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.content)) {
    return payload.content;
  }

  return [];
}

export async function listClasses(): Promise<ClassRoom[]> {
  const payload = await requestWithFallback<ClassApiPayload[] | CollectionPayload<ClassApiPayload>>(CLASS_ENDPOINTS, {
    method: 'GET',
  });

  const rawClasses = extractCollection(payload);
  return rawClasses.map((item, index) => normalizeClass(item, `turma-${index + 1}`));
}

export async function createClass(input: { nome: string; professor?: string }): Promise<ClassRoom> {
  const payload = await requestWithFallback<ClassApiPayload>(CLASS_ENDPOINTS, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return normalizeClass(payload, `turma-${Date.now()}`);
}

export async function removeClass(classId: string): Promise<void> {
  await requestWithFallback<void>([`/turmas/${classId}`, `/classes/${classId}`], {
    method: 'DELETE',
  });
}

export async function listStudentsByClass(classId: string): Promise<Student[]> {
  const payload = await requestWithFallback<StudentApiPayload[] | CollectionPayload<StudentApiPayload>>(
    [`/turmas/${classId}/alunos`, `/classes/${classId}/students`, `/alunos?turmaId=${classId}`],
    {
      method: 'GET',
    },
  );

  const rawStudents = extractCollection(payload);
  return rawStudents.map((item, index) => normalizeStudent(item, `${classId}-aluno-${index + 1}`));
}

export async function createStudent(
  classId: string,
  payload: { nome: string; dataNascimento: string; nivel: LiteracyStage; status: StudentStatus; observacoes?: string },
): Promise<Student> {
  const fallbackEmail = `${payload.nome.toLowerCase().replace(/\s+/g, '.')}@lunetras.local`;

  const created = await requestWithFallback<StudentApiPayload>(
    [`/turmas/${classId}/alunos`, `/classes/${classId}/students`, '/alunos'],
    {
      method: 'POST',
      body: JSON.stringify({
        nome: payload.nome,
        dataNascimento: payload.dataNascimento,
        nivel: payload.nivel,
        status: payload.status,
        observacoes: payload.observacoes,
        turmaId: Number.isNaN(Number(classId)) ? undefined : Number(classId),
        email: fallbackEmail,
      }),
    },
  );

  return normalizeStudent(created, `${classId}-aluno-${Date.now()}`);
}

export async function updateStudent(
  classId: string,
  studentId: string,
  payload: { nivel: LiteracyStage; observacoes: string; status: StudentStatus },
): Promise<Student | null> {
  const updated = await requestWithFallback<StudentApiPayload | null>(
    [`/turmas/${classId}/alunos/${studentId}`, `/classes/${classId}/students/${studentId}`, `/alunos/${studentId}`],
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );

  if (!updated) {
    return null;
  }

  return normalizeStudent(updated, studentId);
}

export async function removeStudent(classId: string, studentId: string): Promise<void> {
  await requestWithFallback<void>(
    [`/turmas/${classId}/alunos/${studentId}`, `/classes/${classId}/students/${studentId}`, `/alunos/${studentId}`],
    {
      method: 'DELETE',
    },
  );
}

export async function hydrateClassesAndStudents(): Promise<{
  classes: ClassRoom[];
  studentsByClass: Record<string, Student[]>;
}> {
  const classes = await listClasses();

  const studentsEntries = await Promise.all(
    classes.map(async (item) => {
      const students = await listStudentsByClass(item.id);
      return [item.id, students] as const;
    }),
  );

  return {
    classes,
    studentsByClass: Object.fromEntries(studentsEntries),
  };
}