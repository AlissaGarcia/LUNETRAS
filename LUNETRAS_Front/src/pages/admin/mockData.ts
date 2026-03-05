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
    totalAlunos: 5,
    alunosAlfabeticos: 1,
    pendencias: 3,
    ativa: true,
  },
];

export const INITIAL_STUDENTS_BY_CLASS: Record<string, Student[]> = {
  t1: [
    {
      id: 'a1',
      nome: 'Enzo Almeida',
      dataNascimento: '2017-06-10',
      nivel: 'ICONICO',
      status: 'NEEDS_ATTENTION',
    },
    {
      id: 'a2',
      nome: 'Beatriz Goncalves',
      dataNascimento: '2017-01-24',
      nivel: 'GARATUJA',
      status: 'NEEDS_ATTENTION',
    },
    {
      id: 'a3',
      nome: 'Pedro Souza',
      dataNascimento: '2018-03-15',
      nivel: 'SILABICO',
      status: 'PENDING',
    },
    {
      id: 'a4',
      nome: 'Marina Martins',
      dataNascimento: '2017-04-02',
      nivel: 'SILABICO_ALFABETICO',
      status: 'MONITORING',
    },
    {
      id: 'a5',
      nome: 'Caua Ribeiro',
      dataNascimento: '2017-07-08',
      nivel: 'ALFABETICO',
      status: 'REASSESS',
    },
  ],
};

const NAME_POOL = [
  'Ana Paula',
  'Carlos Henrique',
  'Julia Fernanda',
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
  if (level === 'ICONICO' || level === 'GARATUJA' || level === 'PRE_SILABICO') {
    return 'NEEDS_ATTENTION';
  }

  if (level === 'SILABICO') {
    return 'PENDING';
  }

  if (level === 'SILABICO_ALFABETICO') {
    return 'MONITORING';
  }

  return 'EVALUATED';
}

export function buildStudentsForNewClass(
  classId: string,
  totalAlunos: number,
  percentualAlfabetizacao: number,
): Student[] {
  const safeTotal = Math.max(1, totalAlunos);
  const alfabeticos = Math.round((Math.max(0, Math.min(100, percentualAlfabetizacao)) / 100) * safeTotal);

  return Array.from({ length: safeTotal }, (_, index) => {
    const id = `${classId}-a${index + 1}`;
    const nome = NAME_POOL[index % NAME_POOL.length];
    const year = 2016 + (index % 3);
    const month = String((index % 12) + 1).padStart(2, '0');
    const day = String((index % 27) + 1).padStart(2, '0');
    const nivel: LiteracyStage = index < alfabeticos ? 'ALFABETICO' : index % 3 === 0 ? 'SILABICO_ALFABETICO' : 'PRE_SILABICO';

    return {
      id,
      nome: `${nome} ${index + 1}`,
      dataNascimento: `${year}-${month}-${day}`,
      nivel,
      status: levelToStatus(nivel),
    };
  });
}
