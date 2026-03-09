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
    totalAlunos: 10,
    alunosAlfabeticos: 4,
    pendencias: 5,
    ativa: true,
  },
  {
    id: 't2',
    nome: '2 Ano B',
    professor: 'Renata',
    totalAlunos: 8,
    alunosAlfabeticos: 5,
    pendencias: 3,
    ativa: true,
  },
  {
    id: 't3',
    nome: '3 Ano C',
    professor: 'Marcos',
    totalAlunos: 9,
    alunosAlfabeticos: 6,
    pendencias: 2,
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
      status: 'REAVALIAR',
    },
    {
      id: 'a2',
      nome: 'Beatriz Goncalves',
      dataNascimento: '2017-01-24',
      nivel: 'GARATUJA',
      status: 'REAVALIAR',
    },
    {
      id: 'a3',
      nome: 'Pedro Souza',
      dataNascimento: '2018-03-15',
      nivel: 'PRE_SILABICO',
      status: 'SEM_AVALIACAO',
    },
    {
      id: 'a4',
      nome: 'Marina Martins',
      dataNascimento: '2017-04-02',
      nivel: 'SILABICO_SEM_VALOR_SONORO',
      status: 'SEM_AVALIACAO',
    },
    {
      id: 'a5',
      nome: 'Caua Ribeiro',
      dataNascimento: '2017-07-08',
      nivel: 'SILABICO_COM_VALOR_SONORO',
      status: 'REAVALIAR',
    },
    {
      id: 'a6',
      nome: 'Laura Silva',
      dataNascimento: '2017-09-21',
      nivel: 'ALFABETICO',
      status: 'AVALIADO',
    },
    {
      id: 'a7',
      nome: 'Rafael Costa',
      dataNascimento: '2017-11-03',
      nivel: 'ORTOGRAFICO',
      status: 'AVALIADO',
    },
    {
      id: 'a8',
      nome: 'Leticia Moura',
      dataNascimento: '2017-10-05',
      nivel: 'PRE_SILABICO',
      status: 'REAVALIAR',
    },
    {
      id: 'a9',
      nome: 'Tiago Nascimento',
      dataNascimento: '2017-12-01',
      nivel: 'SILABICO_SEM_VALOR_SONORO',
      status: 'REAVALIAR',
    },
    {
      id: 'a10',
      nome: 'Bianca Teixeira',
      dataNascimento: '2017-08-18',
      nivel: 'SEM_DADOS',
      status: 'SEM_AVALIACAO',
    },
  ],
  t2: [
    {
      id: 'b1',
      nome: 'Samuel Barros',
      dataNascimento: '2016-05-09',
      nivel: 'GARATUJA',
      status: 'REAVALIAR',
    },
    {
      id: 'b2',
      nome: 'Vitoria Lopes',
      dataNascimento: '2016-02-23',
      nivel: 'PRE_SILABICO',
      status: 'REAVALIAR',
    },
    {
      id: 'b3',
      nome: 'Yasmin Araujo',
      dataNascimento: '2016-09-12',
      nivel: 'SILABICO_SEM_VALOR_SONORO',
      status: 'REAVALIAR',
    },
    {
      id: 'b4',
      nome: 'Mateus Ferreira',
      dataNascimento: '2016-07-29',
      nivel: 'SILABICO_COM_VALOR_SONORO',
      status: 'REAVALIAR',
    },
    {
      id: 'b5',
      nome: 'Gabriela Lima',
      dataNascimento: '2016-03-14',
      nivel: 'ALFABETICO',
      status: 'AVALIADO',
    },
    {
      id: 'b6',
      nome: 'Lucas Azevedo',
      dataNascimento: '2016-11-17',
      nivel: 'ORTOGRAFICO',
      status: 'AVALIADO',
    },
    {
      id: 'b7',
      nome: 'Nina Medeiros',
      dataNascimento: '2016-01-30',
      nivel: 'ALFABETICO',
      status: 'AVALIADO',
    },
    {
      id: 'b8',
      nome: 'Pedro Gomes',
      dataNascimento: '2016-06-06',
      nivel: 'SEM_DADOS',
      status: 'SEM_AVALIACAO',
    },
  ],
  t3: [
    {
      id: 'c1',
      nome: 'Isabela Cruz',
      dataNascimento: '2015-04-04',
      nivel: 'PRE_SILABICO',
      status: 'REAVALIAR',
    },
    {
      id: 'c2',
      nome: 'Joao Pedro Alves',
      dataNascimento: '2015-07-07',
      nivel: 'SILABICO_SEM_VALOR_SONORO',
      status: 'REAVALIAR',
    },
    {
      id: 'c3',
      nome: 'Marcos Vinicius',
      dataNascimento: '2015-10-10',
      nivel: 'SILABICO_COM_VALOR_SONORO',
      status: 'REAVALIAR',
    },
    {
      id: 'c4',
      nome: 'Helena Torres',
      dataNascimento: '2015-02-21',
      nivel: 'ALFABETICO',
      status: 'AVALIADO',
    },
    {
      id: 'c5',
      nome: 'Lara Nogueira',
      dataNascimento: '2015-09-03',
      nivel: 'ORTOGRAFICO',
      status: 'AVALIADO',
    },
    {
      id: 'c6',
      nome: 'Arthur Campos',
      dataNascimento: '2015-12-16',
      nivel: 'ORTOGRAFICO',
      status: 'AVALIADO',
    },
    {
      id: 'c7',
      nome: 'Julia Freitas',
      dataNascimento: '2015-06-25',
      nivel: 'ALFABETICO',
      status: 'AVALIADO',
    },
    {
      id: 'c8',
      nome: 'Ruan Melo',
      dataNascimento: '2015-08-11',
      nivel: 'GARATUJA',
      status: 'REAVALIAR',
    },
    {
      id: 'c9',
      nome: 'Cecilia Rocha',
      dataNascimento: '2015-01-19',
      nivel: 'SEM_DADOS',
      status: 'SEM_AVALIACAO',
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
  if (level === 'SEM_DADOS') {
    return 'SEM_AVALIACAO';
  }

  if (level === 'ALFABETICO' || level === 'ORTOGRAFICO') {
    return 'AVALIADO';
  }

  return 'REAVALIAR';
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
