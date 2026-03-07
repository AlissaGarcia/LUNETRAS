import type { LiteracyStage } from './metrics';

export type StudentStatus = 'NEEDS_ATTENTION' | 'MONITORING' | 'PENDING' | 'EVALUATED' | 'REASSESS';

export interface NewStudentInput {
  nome: string;
  dataNascimento: string;
  nivel: LiteracyStage;
  status: StudentStatus;
}

export interface CreateClassInput {
  nome: string;
  professor?: string;
  totalAlunos?: number;
  percentualAlfabetizacao?: number;
  pendencias?: number;
  students?: NewStudentInput[];
}
