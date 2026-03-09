import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { AdminClassStudentsPage } from './pages/admin/AdminClassStudentsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminTeachersPage } from './pages/admin/AdminTeachersPage';
import { ProfessorClassStudentsPage } from './pages/professor/ProfessorClassStudentsPage';
import { ProfessorDashboard } from './pages/professor/ProfessorDashboard';
import { ProfessorReportsPage } from './pages/professor/ProfessorReportsPage';
import type { Bimester, StudentEvaluation } from './pages/admin/evaluations';
import { literacyStageFactor, type ClassRoom, type LiteracyStage } from './pages/admin/metrics';
import { buildStudentsForNewClass, INITIAL_CLASSES, INITIAL_STUDENTS_BY_CLASS, type Student } from './pages/admin/mockData';
import type { CreateClassInput } from './pages/admin/types';
import { Login } from './pages/login/Login';
import { logout } from './services/auth';
import {
  assignTeacherToClass,
  createClass,
  createStudent,
  hydrateClassesAndStudents,
  removeClass,
  removeStudent,
  updateStudent,
} from './services/classes';
import { activateTeacher, createTeacher, disableTeacher, listTeachers, type Teacher } from './services/teachers';

type AdminView = 'DASHBOARD' | 'CLASS_STUDENTS' | 'REPORTS' | 'TEACHERS';
type ProfessorView = 'DASHBOARD' | 'CLASS_STUDENTS' | 'REPORTS';
// TODO: Trocar para false quando backend estiver estavel em execucao local.
const TEMP_FRONT_ONLY_MODE = true;

const LITERACY_STAGE_ORDER: LiteracyStage[] = [
  'SEM_DADOS',
  'ICONICA',
  'GARATUJA',
  'PRE_SILABICO',
  'SILABICO_SEM_VALOR_SONORO',
  'SILABICO_COM_VALOR_SONORO',
  'ALFABETICO',
  'ORTOGRAFICO',
];

const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'prof-carla',
    nome: 'Carla',
    email: 'carla.prof@escola.com',
    perfil: 'PROFESSOR',
    ativo: true,
    senhaInicial: '123456',
  },
  {
    id: 'prof-renata',
    nome: 'Renata',
    email: 'renata.prof@escola.com',
    perfil: 'PROFESSOR',
    ativo: true,
    senhaInicial: '123456',
  },
  {
    id: 'prof-marcos',
    nome: 'Marcos',
    email: 'marcos.prof@escola.com',
    perfil: 'PROFESSOR',
    ativo: true,
    senhaInicial: '123456',
  },
];

const BIMESTER_ORDER: Bimester[] = ['B1', 'B2', 'B3', 'B4'];

const LITERACY_PROGRESS_ORDER: LiteracyStage[] = [
  'SEM_DADOS',
  'ICONICA',
  'GARATUJA',
  'PRE_SILABICO',
  'SILABICO_SEM_VALOR_SONORO',
  'SILABICO_COM_VALOR_SONORO',
  'ALFABETICO',
  'ORTOGRAFICO',
];

function statusByLevel(level: LiteracyStage) {
  if (level === 'SEM_DADOS') {
    return 'SEM_AVALIACAO' as const;
  }

  if (level === 'ALFABETICO' || level === 'ORTOGRAFICO') {
    return 'AVALIADO' as const;
  }

  return 'REAVALIAR' as const;
}

function buildPlaceholderEvaluations(
  classes: ClassRoom[],
  studentsByClass: Record<string, Student[]>,
): Record<string, StudentEvaluation[]> {
  const entries: Array<[string, StudentEvaluation[]]> = [];
  const bimesterMeta = [
    { code: 'B1' as const, monthDay: '03-15', note: 'Diagnóstico inicial e reconhecimento de padrões de escrita.' },
    { code: 'B2' as const, monthDay: '05-20', note: 'Consolidação de hipóteses e correspondência fonética.' },
    { code: 'B3' as const, monthDay: '08-25', note: 'Avanço com atividades de leitura e escrita orientada.' },
    { code: 'B4' as const, monthDay: '11-18', note: 'Fechamento anual com síntese de desenvolvimento.' },
  ];

  Object.entries(studentsByClass).forEach(([classId, students]) => {
    const classRoom = classes.find((item) => item.id === classId);
    const professorNome = classRoom?.professor ?? 'A definir';

    students.forEach((student) => {
      const finalLevelIndex = Math.max(0, LITERACY_PROGRESS_ORDER.indexOf(student.nivel));

      const evaluations = bimesterMeta.map((meta, index) => {
        const offset = BIMESTER_ORDER.length - (index + 1);
        const stageIndex = Math.max(0, finalLevelIndex - offset);
        const nivel = LITERACY_PROGRESS_ORDER[stageIndex] ?? 'SEM_DADOS';
        const dataAvaliacao = `2026-${meta.monthDay}`;

        return {
          id: `${student.id}-${meta.code}`,
          studentId: student.id,
          classId,
          bimestre: meta.code,
          nivel,
          status: statusByLevel(nivel),
          observacoes: `${meta.note} Nivel observado: ${nivel}.`,
          dataAvaliacao,
          professorNome,
        } satisfies StudentEvaluation;
      });

      entries.push([student.id, evaluations]);
    });
  });

  return Object.fromEntries(entries);
}

function resolveCurrentUser() {
  const rawUser = localStorage.getItem('lunetras_usuario');

  if (!rawUser) {
    return {
      id: '',
      nome: 'Administrador(a)',
      perfil: 'ADMINISTRADOR' as const,
      email: '',
    };
  }

  try {
    const parsed = JSON.parse(rawUser) as { id?: string; nome?: string; perfil?: 'ADMINISTRADOR' | 'PROFESSOR'; email?: string };
    return {
      id: parsed.id ?? '',
      nome: parsed.nome ?? 'Administrador(a)',
      perfil: parsed.perfil ?? 'ADMINISTRADOR',
      email: parsed.email ?? '',
    };
  } catch {
    return {
      id: '',
      nome: 'Administrador(a)',
      perfil: 'ADMINISTRADOR' as const,
      email: '',
    };
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('lunetras_auth') === 'true');
  const [adminView, setAdminView] = useState<AdminView>('DASHBOARD');
  const [professorView, setProfessorView] = useState<ProfessorView>('DASHBOARD');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, Student[]>>({});
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [evaluationsByStudent, setEvaluationsByStudent] = useState<Record<string, StudentEvaluation[]>>({});
  const [isHydrating, setIsHydrating] = useState(false);

  const currentUser = resolveCurrentUser();
  const userName = currentUser.nome;
  const userProfile = currentUser.perfil;

  function loadFallbackData() {
    setClasses(INITIAL_CLASSES);
    setStudentsByClass(INITIAL_STUDENTS_BY_CLASS);
    setTeachers(DEFAULT_TEACHERS);
    setEvaluationsByStudent(buildPlaceholderEvaluations(INITIAL_CLASSES, INITIAL_STUDENTS_BY_CLASS));
    setSelectedClassId(INITIAL_CLASSES[0]?.id ?? '');
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setClasses([]);
      setStudentsByClass({});
      setSelectedClassId('');
      return;
    }

    let cancelled = false;

    async function loadInitialData() {
      setIsHydrating(true);

      try {
        if (TEMP_FRONT_ONLY_MODE) {
          loadFallbackData();
          return;
        }

        const [payload, teachersPayload] = await Promise.all([hydrateClassesAndStudents(), listTeachers()]);
        if (cancelled) {
          return;
        }

        setClasses(payload.classes);
        setStudentsByClass(payload.studentsByClass);
        setTeachers(teachersPayload);
        setEvaluationsByStudent({});

        if (payload.classes.length > 0) {
          setSelectedClassId((current) => current || payload.classes[0].id);
        }
      } catch {
        if (!cancelled) {
          loadFallbackData();
        }
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const classesWithDerivedMetrics = useMemo(
    () =>
      classes.map((classRoom) => {
        const students = studentsByClass[classRoom.id] ?? [];

        const totalAlunos = students.length;
        const alunosAlfabeticos = students.reduce((total, student) => total + literacyStageFactor(student.nivel), 0);
        const pendencias = students.filter((student) => student.status !== 'AVALIADO').length;

        return {
          ...classRoom,
          totalAlunos,
          alunosAlfabeticos,
          pendencias,
        };
      }),
    [classes, studentsByClass],
  );

  const visibleClasses = useMemo(() => {
    if (userProfile !== 'PROFESSOR') {
      return classesWithDerivedMetrics;
    }

    const normalizedUserName = userName.trim().toLowerCase();
    return classesWithDerivedMetrics.filter((classRoom) => classRoom.professor.trim().toLowerCase() === normalizedUserName);
  }, [classesWithDerivedMetrics, userName, userProfile]);

  const selectedClass = useMemo(
    () => visibleClasses.find((classRoom) => classRoom.id === selectedClassId) ?? visibleClasses[0],
    [visibleClasses, selectedClassId],
  );

  const levelDistribution = useMemo(() => {
    const activeClassIds = new Set(visibleClasses.filter((item) => item.ativa).map((item) => item.id));
    const allStudents = Object.entries(studentsByClass)
      .filter(([classId]) => activeClassIds.has(classId))
      .flatMap(([, students]) => students);

    const total = allStudents.length;
    const counts = LITERACY_STAGE_ORDER.reduce(
      (acc, stage) => ({ ...acc, [stage]: 0 }),
      {} as Record<LiteracyStage, number>,
    );

    allStudents.forEach((student) => {
      if (student.nivel in counts) {
        counts[student.nivel] += 1;
      }
    });

    return LITERACY_STAGE_ORDER.map((stage) => ({
      stage,
      count: counts[stage],
      percent: total > 0 ? Math.round((counts[stage] / total) * 100) : 0,
    }));
  }, [visibleClasses, studentsByClass]);

  const classLevelDistribution = useMemo(
    () =>
      visibleClasses.map((classRoom) => {
        const students = studentsByClass[classRoom.id] ?? [];
        const total = students.length;
        const counts = LITERACY_STAGE_ORDER.reduce(
          (acc, stage) => ({ ...acc, [stage]: 0 }),
          {} as Record<LiteracyStage, number>,
        );

        students.forEach((student) => {
          if (student.nivel in counts) {
            counts[student.nivel] += 1;
          }
        });

        return {
          classId: classRoom.id,
          total,
          levels: LITERACY_STAGE_ORDER.map((stage) => ({
            stage,
            count: counts[stage],
            percent: total > 0 ? Math.round((counts[stage] / total) * 100) : 0,
          })),
        };
      }),
    [visibleClasses, studentsByClass],
  );

  useEffect(() => {
    if (visibleClasses.length === 0) {
      setSelectedClassId('');
      return;
    }

    const isSelectedVisible = visibleClasses.some((item) => item.id === selectedClassId);
    if (!isSelectedVisible) {
      setSelectedClassId(visibleClasses[0].id);
    }
  }, [visibleClasses, selectedClassId]);

  function handleAuthSuccess() {
    setIsAuthenticated(localStorage.getItem('lunetras_auth') === 'true');
  }

  async function refreshFromBackend(preferredClassId?: string) {
    const payload = await hydrateClassesAndStudents();
    setClasses(payload.classes);
    setStudentsByClass(payload.studentsByClass);

    if (payload.classes.length === 0) {
      setSelectedClassId('');
      return;
    }

    if (preferredClassId) {
      const matched = payload.classes.find((item) => item.id === preferredClassId);
      if (matched) {
        setSelectedClassId(matched.id);
        return;
      }
    }

    setSelectedClassId(payload.classes[0].id);
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Ignora erro de logout remoto e limpa sessão local mesmo assim.
    }

    localStorage.removeItem('lunetras_auth');
    localStorage.removeItem('lunetras_usuario');
    setIsAuthenticated(false);
    setAdminView('DASHBOARD');
    setProfessorView('DASHBOARD');
  }

  async function handleCreateClass(input: CreateClassInput): Promise<boolean> {
    if (!isAuthenticated) {
      return false;
    }

    if (TEMP_FRONT_ONLY_MODE) {
      const fallbackId = `t${Date.now()}`;
      const localClass: ClassRoom = {
        id: fallbackId,
        nome: input.nome,
        professor: input.professor ?? 'A definir',
        totalAlunos: 0,
        alunosAlfabeticos: 0,
        pendencias: 0,
        ativa: true,
      };

      setClasses((current) => [localClass, ...current]);
      setStudentsByClass((current) => ({
        ...current,
        [fallbackId]: [],
      }));
      setSelectedClassId(fallbackId);
      return true;
    }

    try {
      const createdClass = await createClass({
        nome: input.nome,
        professor: input.professor,
      });

      setClasses((current) => [createdClass, ...current]);
      setStudentsByClass((current) => ({
        ...current,
        [createdClass.id]: current[createdClass.id] ?? [],
      }));
      setSelectedClassId(createdClass.id);

      const hasManualStudents = Boolean(input.students && input.students.length > 0);
      const totalAlunosInput = input.totalAlunos ?? 0;
      const percentualInput = input.percentualAlfabetizacao ?? 0;

      const defaultStudents: Student[] = hasManualStudents
        ? input.students!.map((student, index) => ({
            id: `${createdClass.id}-a${index + 1}`,
            ...student,
          }))
        : totalAlunosInput > 0
          ? buildStudentsForNewClass(createdClass.id, totalAlunosInput, percentualInput)
          : [];

      const persistedStudents = await Promise.all(
        defaultStudents.map((student) =>
          createStudent(createdClass.id, {
            nome: student.nome,
            dataNascimento: student.dataNascimento,
            nivel: student.nivel,
            status: student.status,
            observacoes: student.observacoes,
          }),
        ),
      );

      if (persistedStudents.length > 0) {
        setStudentsByClass((current) => ({
          ...current,
          [createdClass.id]: persistedStudents,
        }));
      }

      try {
        await refreshFromBackend(createdClass.id);
      } catch {
        // Mantem estado local caso o refresh falhe.
      }
      return true;
    } catch {
      const fallbackId = `t${Date.now()}`;
      const localClass: ClassRoom = {
        id: fallbackId,
        nome: input.nome,
        professor: input.professor ?? 'A definir',
        totalAlunos: 0,
        alunosAlfabeticos: 0,
        pendencias: 0,
        ativa: true,
      };

      setClasses((current) => [localClass, ...current]);
      setStudentsByClass((current) => ({
        ...current,
        [fallbackId]: [],
      }));
      setSelectedClassId(fallbackId);
      return true;
    }
  }

  async function handleAddStudentToClass(
    classId: string,
    payload: { nome: string; dataNascimento: string; nivel: LiteracyStage },
  ): Promise<boolean> {
    if (!isAuthenticated) {
      return false;
    }

    const status = statusByLevel(payload.nivel);

    if (TEMP_FRONT_ONLY_MODE) {
      const localStudent: Student = {
        id: `${classId}-local-${Date.now()}`,
        nome: payload.nome,
        dataNascimento: payload.dataNascimento,
        nivel: payload.nivel,
        status,
        observacoes: '',
      };

      setStudentsByClass((current) => {
        const currentStudents = current[classId] ?? [];
        return {
          ...current,
          [classId]: [...currentStudents, localStudent],
        };
      });
      return true;
    }

    try {
      const createdStudent = await createStudent(classId, {
        nome: payload.nome,
        dataNascimento: payload.dataNascimento,
        nivel: payload.nivel,
        status,
        observacoes: '',
      });

      setStudentsByClass((current) => {
        const currentStudents = current[classId] ?? [];
        return {
          ...current,
          [classId]: [...currentStudents, createdStudent],
        };
      });

      try {
        await refreshFromBackend(classId);
      } catch {
        // Mantem estado local caso o refresh falhe.
      }
      return true;
    } catch {
      const fallbackStudent: Student = {
        id: `${classId}-local-${Date.now()}`,
        nome: payload.nome,
        dataNascimento: payload.dataNascimento,
        nivel: payload.nivel,
        status,
        observacoes: '',
      };

      setStudentsByClass((current) => {
        const currentStudents = current[classId] ?? [];
        return {
          ...current,
          [classId]: [...currentStudents, fallbackStudent],
        };
      });
      return true;
    }
  }

  async function handleUpdateStudentInClass(
    classId: string,
    studentId: string,
    payload: { nivel: LiteracyStage; observacoes: string; status: Student['status']; bimestre: Bimester },
  ) {
    if (!isAuthenticated) {
      return;
    }

    const classRoom = classes.find((item) => item.id === classId);
    const today = new Date().toISOString().slice(0, 10);

    setEvaluationsByStudent((current) => {
      const evaluations = current[studentId] ?? [];
      const existingIndex = evaluations.findIndex((item) => item.bimestre === payload.bimestre);
      const evaluation: StudentEvaluation = {
        id: existingIndex >= 0 ? evaluations[existingIndex].id : `${studentId}-${payload.bimestre}`,
        studentId,
        classId,
        bimestre: payload.bimestre,
        nivel: payload.nivel,
        status: payload.status,
        observacoes: payload.observacoes,
        dataAvaliacao: today,
        professorNome: classRoom?.professor ?? 'A definir',
      };

      if (existingIndex >= 0) {
        const next = [...evaluations];
        next[existingIndex] = evaluation;
        return {
          ...current,
          [studentId]: next,
        };
      }

      return {
        ...current,
        [studentId]: [...evaluations, evaluation],
      };
    });

    if (TEMP_FRONT_ONLY_MODE) {
      setStudentsByClass((current) => {
        const currentStudents = current[classId] ?? [];
        return {
          ...current,
          [classId]: currentStudents.map((student) =>
            student.id === studentId
              ? {
                  ...student,
                  nivel: payload.nivel,
                  observacoes: payload.observacoes,
                  status: payload.status,
                }
              : student,
          ),
        };
      });
      return;
    }

    try {
      const updatedStudent = await updateStudent(classId, studentId, {
        nivel: payload.nivel,
        observacoes: payload.observacoes,
        status: payload.status,
      });

      setStudentsByClass((current) => {
        const currentStudents = current[classId] ?? [];

        return {
          ...current,
          [classId]: currentStudents.map((student) => {
            if (student.id !== studentId) {
              return student;
            }

            if (!updatedStudent) {
              return {
                ...student,
                nivel: payload.nivel,
                observacoes: payload.observacoes,
                status: payload.status,
              };
            }

            return {
              ...student,
              ...updatedStudent,
            };
          }),
        };
      });
    } catch {
      // Falha da API não interrompe o restante da navegação.
    }
  }

  async function handleRemoveStudentFromClass(classId: string, studentId: string) {
    if (!isAuthenticated) {
      return;
    }

    if (TEMP_FRONT_ONLY_MODE) {
      setStudentsByClass((current) => {
        const currentStudents = current[classId] ?? [];
        return {
          ...current,
          [classId]: currentStudents.filter((student) => student.id !== studentId),
        };
      });
      setEvaluationsByStudent((current) => {
        const next = { ...current };
        delete next[studentId];
        return next;
      });
      return;
    }

    try {
      await removeStudent(classId, studentId);

      setStudentsByClass((current) => {
        const currentStudents = current[classId] ?? [];
        return {
          ...current,
          [classId]: currentStudents.filter((student) => student.id !== studentId),
        };
      });
      setEvaluationsByStudent((current) => {
        const next = { ...current };
        delete next[studentId];
        return next;
      });
    } catch {
      // Falha da API não interrompe o restante da navegação.
    }
  }

  async function handleRemoveClass(classId: string) {
    if (!isAuthenticated) {
      return;
    }

    if (TEMP_FRONT_ONLY_MODE) {
      setClasses((current) => current.filter((classRoom) => classRoom.id !== classId));
      setStudentsByClass((current) => {
        const next = { ...current };
        delete next[classId];
        return next;
      });

      if (selectedClassId === classId) {
        setAdminView('DASHBOARD');
      }
      return;
    }

    try {
      await removeClass(classId);

      setClasses((current) => current.filter((classRoom) => classRoom.id !== classId));
      setStudentsByClass((current) => {
        const next = { ...current };
        delete next[classId];
        return next;
      });

      if (selectedClassId === classId) {
        setAdminView('DASHBOARD');
      }
    } catch {
      // Falha da API não interrompe o restante da navegação.
    }
  }

  function handleOpenClass(classId: string) {
    setSelectedClassId(classId);
    if (userProfile === 'PROFESSOR') {
      setProfessorView('CLASS_STUDENTS');
      return;
    }

    setAdminView('CLASS_STUDENTS');
  }

  function handleGoToClasses() {
    if (visibleClasses.length > 0) {
      setSelectedClassId(visibleClasses[0].id);
    }

    if (userProfile === 'PROFESSOR') {
      setProfessorView('CLASS_STUDENTS');
      return;
    }

    setAdminView('CLASS_STUDENTS');
  }

  function handleBackToDashboard() {
    if (userProfile === 'PROFESSOR') {
      setProfessorView('DASHBOARD');
      return;
    }

    setAdminView('DASHBOARD');
  }

  function handleGoToReports() {
    if (userProfile === 'PROFESSOR') {
      setProfessorView('REPORTS');
      return;
    }

    setAdminView('REPORTS');
  }

  function handleGoToTeachers() {
    setAdminView('TEACHERS');
  }

  async function handleCreateTeacher(payload: { nome: string; email: string; senha: string }): Promise<boolean> {
    if (!isAuthenticated) {
      return false;
    }

    if (TEMP_FRONT_ONLY_MODE) {
      const localTeacher: Teacher = {
        id: `prof-local-${Date.now()}`,
        nome: payload.nome,
        email: payload.email,
        perfil: 'PROFESSOR',
        ativo: true,
        senhaInicial: payload.senha,
      };

      setTeachers((current) => [localTeacher, ...current]);
      return true;
    }

    try {
      const created = await createTeacher(payload);
      setTeachers((current) => [created, ...current]);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSetTeacherActive(teacherId: string, shouldActivate: boolean): Promise<boolean> {
    if (!isAuthenticated) {
      return false;
    }

    if (TEMP_FRONT_ONLY_MODE) {
      setTeachers((current) =>
        current.map((teacher) =>
          teacher.id === teacherId
            ? {
                ...teacher,
                ativo: shouldActivate,
              }
            : teacher,
        ),
      );
      return true;
    }

    try {
      if (shouldActivate) {
        await activateTeacher(teacherId);
      } else {
        await disableTeacher(teacherId);
      }
      setTeachers((current) =>
        current.map((teacher) =>
          teacher.id === teacherId
            ? {
                ...teacher,
                ativo: shouldActivate,
              }
            : teacher,
        ),
      );
      return true;
    } catch {
      return false;
    }
  }

  async function handleAssignTeacherToClass(classId: string, teacherId: string): Promise<boolean> {
    const teacher = teachers.find((item) => item.id === teacherId);

    if (!teacher) {
      return false;
    }

    if (TEMP_FRONT_ONLY_MODE) {
      setClasses((current) =>
        current.map((classRoom) =>
          classRoom.id === classId
            ? {
                ...classRoom,
                professor: teacher.nome,
              }
            : classRoom,
        ),
      );
      return true;
    }

    try {
      const updated = await assignTeacherToClass(classId, teacherId);
      setClasses((current) =>
        current.map((classRoom) =>
          classRoom.id === classId
            ? {
                ...classRoom,
                ...updated,
              }
            : classRoom,
        ),
      );
      return true;
    } catch {
      return false;
    }
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleAuthSuccess} />;
  }

  if (isHydrating) {
    return <main style={{ padding: 24 }}>Carregando dados...</main>;
  }

  if (userProfile === 'PROFESSOR' && professorView === 'CLASS_STUDENTS') {
    return (
      <ProfessorClassStudentsPage
        userName={userName}
        classes={visibleClasses}
        classRoom={selectedClass ?? null}
        students={selectedClass ? studentsByClass[selectedClass.id] ?? [] : []}
        evaluationsByStudent={evaluationsByStudent}
        onSelectClass={handleOpenClass}
        onUpdateStudentInClass={handleUpdateStudentInClass}
        onBackToDashboard={handleBackToDashboard}
        onGoToReports={handleGoToReports}
        onLogout={handleLogout}
      />
    );
  }

  if (userProfile === 'PROFESSOR' && professorView === 'REPORTS') {
    return (
      <ProfessorReportsPage
        userName={userName}
        classes={visibleClasses}
        studentsByClass={studentsByClass}
        evaluationsByStudent={evaluationsByStudent}
        onBackToDashboard={handleBackToDashboard}
        onGoToClasses={handleGoToClasses}
        onLogout={handleLogout}
      />
    );
  }

  if (userProfile === 'PROFESSOR') {
    return (
      <ProfessorDashboard
        userName={userName}
        onLogout={handleLogout}
        classes={visibleClasses}
        levelDistribution={levelDistribution}
        classLevelDistribution={classLevelDistribution}
        onOpenClass={handleOpenClass}
        onGoToClasses={handleGoToClasses}
        onGoToReports={handleGoToReports}
      />
    );
  }

  if (adminView === 'CLASS_STUDENTS') {
    return (
      <AdminClassStudentsPage
        userName={userName}
        classes={visibleClasses}
        classRoom={selectedClass ?? null}
        students={selectedClass ? studentsByClass[selectedClass.id] ?? [] : []}
        evaluationsByStudent={evaluationsByStudent}
        onSelectClass={handleOpenClass}
        onCreateClass={handleCreateClass}
        onAddStudentToClass={handleAddStudentToClass}
        onUpdateStudentInClass={handleUpdateStudentInClass}
        onRemoveClass={handleRemoveClass}
        onRemoveStudentFromClass={handleRemoveStudentFromClass}
        onBackToDashboard={handleBackToDashboard}
        onGoToTeachers={handleGoToTeachers}
        onGoToReports={handleGoToReports}
        onLogout={handleLogout}
      />
    );
  }

  if (adminView === 'REPORTS') {
    return (
      <AdminReportsPage
        userName={userName}
        classes={visibleClasses}
        studentsByClass={studentsByClass}
        evaluationsByStudent={evaluationsByStudent}
        onBackToDashboard={handleBackToDashboard}
        onGoToClasses={handleGoToClasses}
        onGoToTeachers={handleGoToTeachers}
        onLogout={handleLogout}
      />
    );
  }

  if (adminView === 'TEACHERS') {
    return (
      <AdminTeachersPage
        userName={userName}
        teachers={teachers}
        classes={visibleClasses}
        onCreateTeacher={handleCreateTeacher}
        onSetTeacherActive={handleSetTeacherActive}
        onAssignTeacherToClass={handleAssignTeacherToClass}
        onBackToDashboard={handleBackToDashboard}
        onGoToClasses={handleGoToClasses}
        onGoToReports={handleGoToReports}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AdminDashboard
      userName={userName}
      onLogout={handleLogout}
      classes={visibleClasses}
      levelDistribution={levelDistribution}
      classLevelDistribution={classLevelDistribution}
      onRemoveClass={handleRemoveClass}
      onOpenClass={handleOpenClass}
      onGoToClasses={handleGoToClasses}
      onGoToTeachers={handleGoToTeachers}
      onGoToReports={handleGoToReports}
    />
  );
}

export default App;
