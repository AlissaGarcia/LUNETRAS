import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { AdminClassStudentsPage } from './pages/admin/AdminClassStudentsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { literacyStageFactor, type ClassRoom, type LiteracyStage } from './pages/admin/metrics';
import { buildStudentsForNewClass, type Student } from './pages/admin/mockData';
import type { CreateClassInput } from './pages/admin/types';
import { Login } from './pages/login/Login';
import { logout } from './services/auth';
import {
  createClass,
  createStudent,
  hydrateClassesAndStudents,
  removeClass,
  removeStudent,
  updateStudent,
} from './services/classes';

type AdminView = 'DASHBOARD' | 'CLASS_STUDENTS' | 'REPORTS';
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

function statusByLevel(level: LiteracyStage) {
  if (level === 'SEM_DADOS') {
    return 'PENDING' as const;
  }

  if (
    level === 'ICONICA' ||
    level === 'GARATUJA' ||
    level === 'PRE_SILABICO' ||
    level === 'SILABICO_SEM_VALOR_SONORO'
  ) {
    return 'NEEDS_ATTENTION' as const;
  }

  if (level === 'SILABICO_COM_VALOR_SONORO') {
    return 'MONITORING' as const;
  }

  return 'EVALUATED' as const;
}

function resolveUserName() {
  const rawUser = localStorage.getItem('lunetras_usuario');

  if (!rawUser) {
    return 'Administrador(a)';
  }

  try {
    const parsed = JSON.parse(rawUser) as { nome?: string };
    return parsed.nome ?? 'Administrador(a)';
  } catch {
    return 'Administrador(a)';
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('lunetras_auth') === 'true');
  const [adminView, setAdminView] = useState<AdminView>('DASHBOARD');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, Student[]>>({});
  const [isHydrating, setIsHydrating] = useState(false);

  const userName = resolveUserName();

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
        const payload = await hydrateClassesAndStudents();
        if (cancelled) {
          return;
        }

        setClasses(payload.classes);
        setStudentsByClass(payload.studentsByClass);

        if (payload.classes.length > 0) {
          setSelectedClassId((current) => current || payload.classes[0].id);
        }
      } catch {
        if (!cancelled) {
          setClasses([]);
          setStudentsByClass({});
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
        const pendencias = students.filter((student) => student.status !== 'EVALUATED').length;

        return {
          ...classRoom,
          totalAlunos,
          alunosAlfabeticos,
          pendencias,
        };
      }),
    [classes, studentsByClass],
  );

  const selectedClass = useMemo(
    () => classesWithDerivedMetrics.find((classRoom) => classRoom.id === selectedClassId) ?? classesWithDerivedMetrics[0],
    [classesWithDerivedMetrics, selectedClassId],
  );

  const levelDistribution = useMemo(() => {
    const activeClassIds = new Set(classesWithDerivedMetrics.filter((item) => item.ativa).map((item) => item.id));
    const allStudents = Object.entries(studentsByClass)
      .filter(([classId]) => activeClassIds.has(classId))
      .flatMap(([, students]) => students);
@@ -123,191 +176,262 @@ function App() {
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
    [classesWithDerivedMetrics, studentsByClass],
  );

  function handleAuthSuccess() {
    setIsAuthenticated(localStorage.getItem('lunetras_auth') === 'true');
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
  }

  async function handleCreateClass(input: CreateClassInput) {
    if (!isAuthenticated) {
      return;
    }

    try {
      const createdClass = await createClass({
        nome: input.nome,
        professor: input.professor,
      });

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

      setClasses((current) => [createdClass, ...current]);
      setStudentsByClass((current) => ({
        ...current,
        [createdClass.id]: persistedStudents,
      }));
      setSelectedClassId(createdClass.id);
    } catch {
      // Falha da API não interrompe o restante da navegação.
    }
  }

  async function handleAddStudentToClass(
    classId: string,
    payload: { nome: string; dataNascimento: string; nivel: LiteracyStage },
  ) {
    if (!isAuthenticated) {
      return;
    }

    const status = statusByLevel(payload.nivel);

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
    } catch {
      // Falha da API não interrompe o restante da navegação.
    }
  }

  async function handleUpdateStudentInClass(
    classId: string,
    studentId: string,
    payload: { nivel: LiteracyStage; observacoes: string; status: Student['status'] },
  ) {
    if (!isAuthenticated) {
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

    try {
      await removeStudent(classId, studentId);

      setStudentsByClass((current) => {
        const currentStudents = current[classId] ?? [];
        return {
          ...current,
          [classId]: currentStudents.filter((student) => student.id !== studentId),
        };
      });
    } catch {
      // Falha da API não interrompe o restante da navegação.
    }
  }

  async function handleRemoveClass(classId: string) {
    if (!isAuthenticated) {
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
    setAdminView('CLASS_STUDENTS');
  }

  function handleGoToClasses() {
    if (classesWithDerivedMetrics.length > 0) {
      setSelectedClassId(classesWithDerivedMetrics[0].id);
    }
    setAdminView('CLASS_STUDENTS');
  }

  function handleBackToDashboard() {
    setAdminView('DASHBOARD');
  }

  function handleGoToReports() {
    setAdminView('REPORTS');
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleAuthSuccess} />;
  }

  if (isHydrating) {
    return <main style={{ padding: 24 }}>Carregando dados...</main>;
  }

  if (adminView === 'CLASS_STUDENTS') {
    return (
      <AdminClassStudentsPage
        userName={userName}
        classes={classesWithDerivedMetrics}
        classRoom={selectedClass ?? null}
        students={selectedClass ? studentsByClass[selectedClass.id] ?? [] : []}
        onSelectClass={handleOpenClass}
        onCreateClass={handleCreateClass}
        onAddStudentToClass={handleAddStudentToClass}
        onUpdateStudentInClass={handleUpdateStudentInClass}
        onRemoveClass={handleRemoveClass}
        onRemoveStudentFromClass={handleRemoveStudentFromClass}
        onBackToDashboard={handleBackToDashboard}
        onGoToReports={handleGoToReports}
        onLogout={handleLogout}
      />
    );
  }

  if (adminView === 'REPORTS') {
    return (
      <AdminReportsPage
        userName={userName}
        classes={classesWithDerivedMetrics}