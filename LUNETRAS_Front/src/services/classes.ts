import { API_URL } from '../config/env';
import type { ClassRoom, LiteracyStage } from '../pages/admin/metrics';
import type { Student } from '../pages/admin/mockData';
import type { StudentStatus } from '../pages/admin/types';

interface ClassApiPayload {
  id?: string | number;
  turmaId?: string | number;
  nome?: string;
  nomeTurma?: string;
  professor?: string;
  professorNome?: string;
  anoEscolar?: string;
  turno?: string;
  totalAlunos?: number;
  alunosAlfabeticos?: number;
  pendencias?: number;
  ativa?: boolean;
}

interface StudentApiPayload {
  id?: string | number;
  nome?: string;
  email?: string;
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
const REQUEST_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function toStringId(value: string | number | undefined, fallback: string): string {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return String(value);
}

function normalizeClass(payload: ClassApiPayload, fallbackId: string): ClassRoom {
  return {
    id: toStringId(payload.id ?? payload.turmaId, fallbackId),
    nome: payload.nome ?? payload.nomeTurma ?? 'Turma sem nome',
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
    status: payload.status ?? 'SEM_AVALIACAO',
    observacoes: payload.observacoes ?? '',
  };
}

async function requestWithFallback<T>(endpoints: string[], init: RequestInit): Promise<T> {
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
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
  const storedUser = localStorage.getItem('lunetras_usuario');
  let professorId: number | undefined;

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser) as { id?: number | string; perfil?: string };
      const maybeId = Number(parsed.id);
      if (!Number.isNaN(maybeId) && parsed.perfil === 'PROFESSOR') {
        professorId = maybeId;
      }
    } catch {
      professorId = undefined;
    }
  }

  const endpointConfigs: Array<{ endpoint: string; body: Record<string, unknown> }> = [
    {
      endpoint: '/turmas',
      body: {
        nome: input.nome,
        ano: 1,
        turno: 'MANHA',
        ...(professorId ? { professorId } : {}),
      },
    },
    {
      endpoint: '/turmas',
      body: {
        nomeTurma: input.nome,
        ano: 1,
        turno: 'MANHA',
        ...(professorId ? { professorId } : {}),
      },
    },
    {
      endpoint: '/turmas',
      body: {
        nome: input.nome,
      },
    },
    {
      endpoint: '/classes',
      body: {
        nome: input.nome,
      },
    },
    {
      endpoint: '/classes',
      body: {
        nomeTurma: input.nome,
      },
    },
  ];

  let lastError: Error | null = null;

  for (const config of endpointConfigs) {
    try {
      const response = await fetchWithTimeout(`${API_URL}${config.endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config.body),
      });

      if (response.status === 404) {
        continue;
      }

      if (!response.ok) {
        lastError = new Error(`Erro ${response.status} ao acessar ${config.endpoint}`);
        continue;
      }

      if (response.status === 204) {
        return normalizeClass({ nome: input.nome }, `turma-${Date.now()}`);
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        return normalizeClass({ nome: input.nome }, `turma-${Date.now()}`);
      }

      const payload = (await response.json()) as ClassApiPayload;
      return normalizeClass(payload, `turma-${Date.now()}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Falha de comunicação com a API.');
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Nenhum endpoint disponível para criar turma.');
}

export async function removeClass(classId: string): Promise<void> {
  await requestWithFallback<void>([`/turmas/${classId}`, `/classes/${classId}`], {
    method: 'DELETE',
  });
}

export async function assignTeacherToClass(classId: string, teacherId: string): Promise<ClassRoom> {
  const updated = await requestWithFallback<ClassApiPayload>([`/turmas/${classId}/professor/${teacherId}`], {
    method: 'PATCH',
  });

  return normalizeClass(updated, classId);
}

export async function listStudentsByClass(classId: string): Promise<Student[]> {
  const payload = await requestWithFallback<StudentApiPayload[] | CollectionPayload<StudentApiPayload>>(
    [
      `/turmas/${classId}/alunos`,
      `/classes/${classId}/students`,
      `/alunos?turmaId=${classId}`,
      `/alunos?turma_id=${classId}`,
      `/alunos?turma=${classId}`,
    ],
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
  const numericClassId = Number.isNaN(Number(classId)) ? undefined : Number(classId);
  const generatedEmail = `${payload.nome
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/(^\.+|\.+$)/g, '') || 'aluno'}.${Date.now()}@lunetras.local`;

  const endpointConfigs: Array<{ endpoint: string; body: Record<string, unknown> }> = [
    {
      endpoint: `/turmas/${classId}/alunos`,
      body: {
        nome: payload.nome,
        dataNascimento: payload.dataNascimento,
        email: generatedEmail,
      },
    },
    {
      endpoint: '/alunos',
      body: {
        nome: payload.nome,
        email: generatedEmail,
        dataNascimento: payload.dataNascimento,
        turmaId: numericClassId,
      },
    },
    {
      endpoint: '/alunos',
      body: {
        nome: payload.nome,
        email: generatedEmail,
        data_nascimento: payload.dataNascimento,
        turma_id: numericClassId,
      },
    },
    {
      endpoint: '/alunos',
      body: {
        nome: payload.nome,
        email: generatedEmail,
        dataNascimento: payload.dataNascimento,
        turma: numericClassId ? { id: numericClassId } : undefined,
      },
    },
    {
      endpoint: `/classes/${classId}/students`,
      body: {
        nome: payload.nome,
        dataNascimento: payload.dataNascimento,
        email: generatedEmail,
      },
    },
  ];

  let lastError: Error | null = null;

  for (const config of endpointConfigs) {
    try {
      const response = await fetchWithTimeout(`${API_URL}${config.endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config.body),
      });

      if (response.status === 404) {
        continue;
      }

      if (!response.ok) {
        lastError = new Error(`Erro ${response.status} ao acessar ${config.endpoint}`);
        continue;
      }

      if (response.status === 204) {
        return normalizeStudent(
          { nome: payload.nome, dataNascimento: payload.dataNascimento, nivel: payload.nivel, status: payload.status },
          `${classId}-aluno-${Date.now()}`,
        );
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        return normalizeStudent(
          { nome: payload.nome, dataNascimento: payload.dataNascimento, nivel: payload.nivel, status: payload.status },
          `${classId}-aluno-${Date.now()}`,
        );
      }

      const created = (await response.json()) as StudentApiPayload;
      return normalizeStudent(created, `${classId}-aluno-${Date.now()}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Falha de comunicação com a API.');
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Nenhum endpoint disponível para cadastrar aluno.');
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
      let students: Student[] = [];
      try {
        students = await listStudentsByClass(item.id);
      } catch {
        students = [];
      }
      return [item.id, students] as const;
    }),
  );

  return {
    classes,
    studentsByClass: Object.fromEntries(studentsEntries),
  };
}
