import type { LiteracyStage } from './metrics';
import type { Student } from './mockData';

export type Bimester = 'B1' | 'B2' | 'B3' | 'B4';

export interface StudentEvaluation {
  id: string;
  studentId: string;
  classId: string;
  bimestre: Bimester;
  nivel: LiteracyStage;
  status: Student['status'];
  observacoes: string;
  dataAvaliacao: string;
  professorNome: string;
}

