import { API_URL } from '../config/env';
import type { StudentEvaluation } from '../pages/admin/evaluations';
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

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('lunetras_token');
  } catch {
    return null;
  }
}

function buildAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

function inferStatusByLevel(level: LiteracyStage): StudentStatus {
  if (level === 'SEM_DADOS') {
    return 'SEM_AVALIACAO';
  }

  if (level === 'ALFABETICO' || level === 'ORTOGRAFICO') {
    return 'AVALIADO';
  }

  return 'REAVALIAR';
}

function normalizeStudent(payload: StudentApiPayload, fallbackId: string): Student {
  return {
    id: toStringId(payload.id, fallbackId),
    nome: payload.nome ?? 'Aluno sem nome',
    dataNascimento: payload.dataNascimento ?? '2017-01-01',
    nivel: payload.nivel ?? 'SEM_DADOS',
    status: payload.status ?? inferStatusByLevel(payload.nivel ?? 'SEM_DADOS'),
    observacoes: payload.observacoes ?? '',
  };
}

async function requestWithFallback<T>(endpoints: string[], init: RequestInit): Promise<T> {
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
        ...init,
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
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

export async function createClass(input: { nome: string; professorId?: string | number }): Promise<ClassRoom> {
  const professorId =
    input.professorId === undefined || input.professorId === null || input.professorId === ''
      ? undefined
      : Number(input.professorId);

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
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
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
        nivel: payload.nivel,
        status: payload.status,
        observacoes: payload.observacoes ?? '',
      },
    },
    {
      endpoint: '/alunos',
      body: {
        nome: payload.nome,
        email: generatedEmail,
        data_nascimento: payload.dataNascimento,
        turma_id: numericClassId,
        nivel: payload.nivel,
        status: payload.status,
        observacoes: payload.observacoes ?? '',
      },
    },
    {
      endpoint: '/alunos',
      body: {
        nome: payload.nome,
        email: generatedEmail,
        dataNascimento: payload.dataNascimento,
        turma: numericClassId ? { id: numericClassId } : undefined,
        nivel: payload.nivel,
        status: payload.status,
        observacoes: payload.observacoes ?? '',
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
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
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
          {
            nome: payload.nome,
            dataNascimento: payload.dataNascimento,
            nivel: payload.nivel,
            status: payload.status,
            observacoes: payload.observacoes ?? '',
          },
          `${classId}-aluno-${Date.now()}`,
        );
      }

      const created = (await response.json()) as StudentApiPayload;
      return normalizeStudent(
        {
          ...created,
          nome: created.nome ?? payload.nome,
          dataNascimento: created.dataNascimento ?? payload.dataNascimento,
          nivel: created.nivel ?? payload.nivel,
          status: created.status ?? payload.status,
          observacoes: created.observacoes ?? payload.observacoes ?? '',
        },
        `${classId}-aluno-${Date.now()}`,
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Falha de comunicação com a API.');
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Nenhum endpoint disponível para cadastrar aluno.');
}
export async function createEvaluation(
  payload: {
    alunoId: number;
    estado: string;
    nivel: LiteracyStage;
    observacoes?: string;
    dataAvaliacao: string;
    bimestre: 'B1' | 'B2' | 'B3' | 'B4';
  }
): Promise<{ id: string }> {
  const endpointConfigs: Array<{ endpoint: string; body: Record<string, unknown> }> = [
    {
      endpoint: '/avaliacoes',
      body: {
        alunoId: payload.alunoId,
        estado: payload.estado,
        nivel: payload.nivel,
        observacoes: payload.observacoes ?? '',
        dataAvaliacao: payload.dataAvaliacao,
        bimestre: payload.bimestre,
      },
    },
  ];

  let lastError: Error | null = null;

  for (const config of endpointConfigs) {
    try {
      const response = await fetchWithTimeout(`${API_URL}${config.endpoint}`, {
        method: 'POST',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
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
        return { id: `eval-${Date.now()}` };
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        return { id: `eval-${Date.now()}` };
      }

      const result = (await response.json()) as { id: number | string };
      return {
        id: String(result.id ?? Date.now()),
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Falha de comunicação com a API.');
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Nenhum endpoint disponível para criar avaliação.');
}

export async function listEvaluationsByStudent(studentId: string): Promise<Array<{
  id: string;
  nivel: LiteracyStage;
  bimestre: string;
  dataAvaliacao: string;
  observacoes: string;
}>> {
  try {
    const payload = await requestWithFallback<Array<{
      id?: number | string;
      nivel?: LiteracyStage;
      bimestre?: string;
      dataAvaliacao?: string;
      observacoes?: string;
    }>>([`/avaliacoes/aluno/${studentId}`], {
      method: 'GET',
    });

    const rawEvaluations = Array.isArray(payload) ? payload : [];

    return rawEvaluations.map((item, index) => ({
      id: String(item.id ?? `eval-${studentId}-${index}`),
      nivel: item.nivel ?? 'SEM_DADOS',
      bimestre: item.bimestre ?? 'B1',
      dataAvaliacao: item.dataAvaliacao ?? new Date().toISOString().split('T')[0],
      observacoes: item.observacoes ?? '',
    }));
  } catch {
    return [];
  }
}

export async function fetchReportByTurmaAndBimestre(
  turmaId: string,
  bimestre: number,
  periodoLetivo: number = 2026,
): Promise<Array<{
  id: string;
  alunoNome: string;
  nivel: LiteracyStage;
  status: string;
  observacoes: string;
}>> {
  try {
    const payload = await requestWithFallback<Array<{
      id?: number | string;
      aluno?: { nome?: string };
      alunoNome?: string;
      nivel?: LiteracyStage;
      status?: string;
      observacoes?: string;
    }>>([
      `/relatorios/turma/${turmaId}/bimestre/${bimestre}/periodo/${periodoLetivo}`,
    ], {
      method: 'GET',
    });

    const rawData = Array.isArray(payload) ? payload : [];

    return rawData.map((item, index) => ({
      id: String(item.id ?? index),
      alunoNome: item.alunoNome ?? item.aluno?.nome ?? 'Aluno',
      nivel: item.nivel ?? 'SEM_DADOS',
      status: item.status ?? 'SEM_AVALIACAO',
      observacoes: item.observacoes ?? '',
    }));
  } catch {
    return [];
  }
}

export async function fetchRelatorioEstatisticas(
  turmaId: string,
  bimestre: number,
  periodoLetivo: number = 2026,
): Promise<Array<{
  nivel: LiteracyStage;
  quantidade: number;
  percentual: number;
}>> {
  try {
    const payload = await requestWithFallback<Array<{
      nivel?: LiteracyStage;
      quantidade?: number;
      percentual?: number;
    }>>([
      `/relatorios/turma/${turmaId}/bimestre/${bimestre}/periodo/${periodoLetivo}/niveis`,
    ], {
      method: 'GET',
    });

    const rawData = Array.isArray(payload) ? payload : [];

    return rawData.map((item) => ({
      nivel: item.nivel ?? 'SEM_DADOS',
      quantidade: item.quantidade ?? 0,
      percentual: item.percentual ?? 0,
    }));
  } catch {
    return [];
  }
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
  evaluationsByStudent: Record<string, StudentEvaluation[]>;
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

      const evaluationsByStudentEntry: Record<string, StudentEvaluation[]> = {};

      for (const student of students) {
        try {
          const evaluations = await listEvaluationsByStudent(student.id);
          if (evaluations.length > 0) {
            const latestEvaluation = [...evaluations].sort((left, right) => {
              const leftNumber = Number.parseInt(left.bimestre.replace('B', ''), 10) || 0;
              const rightNumber = Number.parseInt(right.bimestre.replace('B', ''), 10) || 0;
              return rightNumber - leftNumber;
            })[0];

            if (latestEvaluation) {
              evaluationsByStudentEntry[student.id] = evaluations.map((evaluation) => ({
                id: evaluation.id,
                studentId: student.id,
                classId: item.id,
                bimestre: evaluation.bimestre as StudentEvaluation['bimestre'],
                nivel: evaluation.nivel,
                status: inferStatusByLevel(evaluation.nivel),
                observacoes: evaluation.observacoes,
                dataAvaliacao: evaluation.dataAvaliacao,
                professorNome: 'A definir',
              }));

              students = students.map((currentStudent) =>
                currentStudent.id === student.id
                  ? {
                      ...currentStudent,
                      nivel: latestEvaluation.nivel,
                      status: inferStatusByLevel(latestEvaluation.nivel),
                      observacoes: latestEvaluation.observacoes,
                    }
                  : currentStudent,
              );
            }
          }
        } catch {
          // Mantém o aluno com os dados básicos caso não haja avaliações disponíveis.
        }
      }

      return [item.id, students, evaluationsByStudentEntry] as const;
    }),
  );

  const studentsByClass = Object.fromEntries(studentsEntries.map(([classId, students]) => [classId, students])) as Record<
    string,
    Student[]
  >;
  const evaluationsByStudent = Object.fromEntries(
    studentsEntries.flatMap(([, , evaluationsByStudentEntry]) => Object.entries(evaluationsByStudentEntry)),
  ) as Record<string, StudentEvaluation[]>;

  return {
    classes,
    studentsByClass,
    evaluationsByStudent,
  };
}
