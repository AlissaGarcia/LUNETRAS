export type LiteracyStage =
  | 'SEM_DADOS'
  | 'ICONICA'
  | 'GARATUJA'
  | 'PRE_SILABICO'
  | 'SILABICO_SEM_VALOR_SONORO'
  | 'SILABICO_COM_VALOR_SONORO'
  | 'ALFABETICO'
  | 'ORTOGRAFICO';

export interface ClassRoom {
  id: string;
  nome: string;
  professor: string;
  totalAlunos: number;
  alunosAlfabeticos: number;
  pendencias: number;
  ativa: boolean;
}

export interface DashboardSummary {
  totalTurmasAtivas: number;
  totalAlunos: number;
  percentualAlfabetizacao: number;
  nivelGeral: LiteracyStage;
}

export type ProgressTone = 'LOW' | 'MEDIUM' | 'HIGH';

export function literacyStageFactor(stage: LiteracyStage): number {
  switch (stage) {
    case 'SEM_DADOS':
      return 0;
    case 'ICONICA':
      return 0;
    case 'GARATUJA':
      return 0.15;
    case 'PRE_SILABICO':
      return 0.3;
    case 'SILABICO_SEM_VALOR_SONORO':
      return 0.45;
    case 'SILABICO_COM_VALOR_SONORO':
      return 0.6;
    case 'ALFABETICO':
      return 0.8;
    case 'ORTOGRAFICO':
      return 1;
    default:
      return 0;
  }
}

export function calculateClassProgress(classRoom: ClassRoom): number {
  if (classRoom.totalAlunos <= 0) {
    return 0;
  }

  return Math.round((classRoom.alunosAlfabeticos / classRoom.totalAlunos) * 100);
}

export function resolveLiteracyStage(progress: number): LiteracyStage {
  if (progress < 10) {
    return 'ICONICA';
  }

  if (progress < 22) {
    return 'GARATUJA';
  }

  if (progress < 35) {
    return 'PRE_SILABICO';
  }

  if (progress < 50) {
    return 'SILABICO_SEM_VALOR_SONORO';
  }

  if (progress < 68) {
    return 'SILABICO_COM_VALOR_SONORO';
  }

  if (progress < 85) {
    return 'ALFABETICO';
  }

  return 'ORTOGRAFICO';
}

export function calculateSummary(classes: ClassRoom[]): DashboardSummary {
  const activeClasses = classes.filter((item) => item.ativa);
  const totalStudents = activeClasses.reduce((total, item) => total + item.totalAlunos, 0);
  const totalAlphabetized = activeClasses.reduce((total, item) => total + item.alunosAlfabeticos, 0);
  const literacyPercent = totalStudents > 0 ? Math.round((totalAlphabetized / totalStudents) * 100) : 0;

  return {
    totalTurmasAtivas: activeClasses.length,
    totalAlunos: totalStudents,
    percentualAlfabetizacao: literacyPercent,
    nivelGeral: resolveLiteracyStage(literacyPercent),
  };
}

export function stageLabel(stage: LiteracyStage): string {
  switch (stage) {
    case 'SEM_DADOS':
      return 'Sem dados';
    case 'ICONICA':
      return 'Icônica';
    case 'GARATUJA':
      return 'Garatuja';
    case 'PRE_SILABICO':
      return 'Pré-silábico';
    case 'SILABICO_SEM_VALOR_SONORO':
      return 'Silábico sem valor sonoro';
    case 'SILABICO_COM_VALOR_SONORO':
      return 'Silábico com valor sonoro';
    case 'ALFABETICO':
      return 'Alfabético';
    case 'ORTOGRAFICO':
      return 'Ortográfico';
    default:
      return 'Sem dados';
  }
}

export function resolveProgressTone(progress: number): ProgressTone {
  if (progress < 40) {
    return 'LOW';
  }

  if (progress < 70) {
    return 'MEDIUM';
  }

  return 'HIGH';
}
