import type { ClassRoom, LiteracyStage } from './metrics';
import type { StudentStatus } from './types';

export interface Student {
  id: string;
  nome: string;
  dataNascimento: string;
  nivel: LiteracyStage;
  status: StudentStatus;
  observacoes?: string;
}

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 't1',
    nome: '1 Ano A',
    professor: 'Carla',
    totalAlunos: 7,
    alunosAlfabeticos: 3,
    pendencias: 5,
    ativa: true,
  },
];

export const INITIAL_STUDENTS_BY_CLASS: Record<string, Student[]> = {
  t1: [
    {
      id: 'a1',
      nome: 'Enzo Almeida',
      dataNascimento: '2017-06-10',
      nivel: 'ICONICA',
      status: 'NEEDS_ATTENTION',
    },
    {
      id: 'a2',
      nome: 'Beatriz Gonçalves',
      dataNascimento: '2017-01-24',
      nivel: 'GARATUJA',
      status: 'NEEDS_ATTENTION',
    },
    {
      id: 'a3',
      nome: 'Pedro Souza',
      dataNascimento: '2018-03-15',
      nivel: 'PRE_SILABICO',
      status: 'PENDING',
    },
    {
      id: 'a4',
      nome: 'Marina Martins',
      dataNascimento: '2017-04-02',
      nivel: 'SILABICO_SEM_VALOR_SONORO',
      status: 'PENDING',
    },
    {
      id: 'a5',
      nome: 'Cauã Ribeiro',
      dataNascimento: '2017-07-08',
      nivel: 'SILABICO_COM_VALOR_SONORO',
      status: 'MONITORING',
    },
    {
      id: 'a6',
      nome: 'Laura Silva',
      dataNascimento: '2017-09-21',
      nivel: 'ALFABETICO',
      status: 'EVALUATED',
    },
    {
      id: 'a7',
      nome: 'Rafael Costa',
      dataNascimento: '2017-11-03',
      nivel: 'ORTOGRAFICO',
      status: 'EVALUATED',
    },
  ],
};

const NAME_POOL = [
  'Ana Paula',
  'Carlos Henrique',
  'Júlia Fernanda',
  'Miguel Santos',
  'Laura Beatriz',
  'Heitor Nunes',
  'Alice Rocha',
  'Arthur Melo',
  'Valentina Lima',
  'Theo Oliveira',
  'Sofia Duarte',
  'Davi Monteiro',
];

export function levelToStatus(level: LiteracyStage): StudentStatus {
  if (level === 'SEM_DADOS') {
    return 'PENDING';
  }

  if (
    level === 'ICONICA' ||
    level === 'GARATUJA' ||
    level === 'PRE_SILABICO' ||
    level === 'SILABICO_SEM_VALOR_SONORO'
  ) {
    return 'NEEDS_ATTENTION';
  }

  if (level === 'SILABICO_COM_VALOR_SONORO') {
    return 'MONITORING';
  }

  return 'EVALUATED';
}

function resolveGeneratedLevel(index: number, cutoff: number): LiteracyStage {
  if (index < cutoff) {
    return 'ORTOGRAFICO';
  }

  const cycle = index % 6;
  if (cycle === 0) {
    return 'ICONICA';
  }
  if (cycle === 1) {
    return 'GARATUJA';
  }
  if (cycle === 2) {
    return 'PRE_SILABICO';
  }
  if (cycle === 3) {
    return 'SILABICO_SEM_VALOR_SONORO';
  }
  if (cycle === 4) {
    return 'SILABICO_COM_VALOR_SONORO';
  }

  return 'ALFABETICO';
}

export function buildStudentsForNewClass(
  classId: string,
  totalAlunos: number,
  percentualAlfabetizacao: number,
): Student[] {
  const safeTotal = Math.max(1, totalAlunos);
  const ortograficos = Math.round((Math.max(0, Math.min(100, percentualAlfabetizacao)) / 100) * safeTotal);

  return Array.from({ length: safeTotal }, (_, index) => {
    const id = `${classId}-a${index + 1}`;
    const nome = NAME_POOL[index % NAME_POOL.length];
    const year = 2016 + (index % 3);
    const month = String((index % 12) + 1).padStart(2, '0');
    const day = String((index % 27) + 1).padStart(2, '0');
    const nivel: LiteracyStage = resolveGeneratedLevel(index, ortograficos);

    return {
      id,
      nome: `${nome} ${index + 1}`,
      dataNascimento: `${year}-${month}-${day}`,
      nivel,
      status: levelToStatus(nivel),
    };
  });
}
