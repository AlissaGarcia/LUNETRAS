import type { LiteracyStage } from './metrics';

export type StudentStatus = 'SEM_AVALIACAO' | 'AVALIADO' | 'REAVALIAR';

export interface NewStudentInput {
  nome: string;
  dataNascimento: string;
  nivel: LiteracyStage;
  status: StudentStatus;
}

export interface CreateClassInput {
  nome: string;
  professor?: string;
  professorId?: string;
  totalAlunos?: number;
  percentualAlfabetizacao?: number;
  pendencias?: number;
  students?: NewStudentInput[];
}
