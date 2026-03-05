export type LiteracyStage =
  | 'ICONICO'
  | 'GARATUJA'
  | 'PRE_SILABICO'
  | 'SILABICO'
  | 'SILABICO_ALFABETICO'
  | 'ALFABETICO';

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
    case 'ICONICO':
      return 0;
    case 'GARATUJA':
      return 0.2;
    case 'PRE_SILABICO':
      return 0.4;
    case 'SILABICO':
      return 0.6;
    case 'SILABICO_ALFABETICO':
      return 0.8;
    case 'ALFABETICO':
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
    return 'ICONICO';
  }

  if (progress < 30) {
    return 'GARATUJA';
  }

  if (progress < 50) {
    return 'PRE_SILABICO';
  }

  if (progress < 70) {
    return 'SILABICO';
  }

  if (progress < 90) {
    return 'SILABICO_ALFABETICO';
  }

  return 'ALFABETICO';
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
    case 'ICONICO':
      return 'Icônico';
    case 'GARATUJA':
      return 'Garatuja';
    case 'PRE_SILABICO':
      return 'Pré-silábico';
    case 'SILABICO':
      return 'Silábico';
    case 'SILABICO_ALFABETICO':
      return 'Silábico-Alfabético';
    case 'ALFABETICO':
      return 'Alfabético';
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
