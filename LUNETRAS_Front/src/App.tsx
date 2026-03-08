import './App.css';
import { useMemo, useState } from 'react';
import { AdminClassStudentsPage } from './pages/admin/AdminClassStudentsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { literacyStageFactor, type ClassRoom, type LiteracyStage } from './pages/admin/metrics';
import { INITIAL_CLASSES, INITIAL_STUDENTS_BY_CLASS, buildStudentsForNewClass, type Student } from './pages/admin/mockData';
import type { CreateClassInput } from './pages/admin/types';
import { Login } from './pages/login/Login';

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

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('lunetras_token'));
  const [adminView, setAdminView] = useState<AdminView>('DASHBOARD');
  const [selectedClassId, setSelectedClassId] = useState<string>('t1');
  const [classes, setClasses] = useState<ClassRoom[]>(INITIAL_CLASSES);
  const [studentsByClass, setStudentsByClass] = useState(INITIAL_STUDENTS_BY_CLASS);

  const userName = useMemo(() => {
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
  }, [token]);

  const classesWithDerivedMetrics = useMemo(
    () =>
      classes.map((classRoom) => {
        const students = studentsByClass[classRoom.id];
        if (!students) {
          return classRoom;
        }

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
  }, [classesWithDerivedMetrics, studentsByClass]);

  const classLevelDistribution = useMemo(
    () =>
      classesWithDerivedMetrics.map((classRoom) => {
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
    [classesWithDerivedMetrics, studentsByClass],
  );

  function handleAuthSuccess() {
    setToken(localStorage.getItem('lunetras_token'));
  }

  function handleLogout() {
    localStorage.removeItem('lunetras_token');
    localStorage.removeItem('lunetras_usuario');
    setToken(null);
    setAdminView('DASHBOARD');
  }

  function handleCreateClass(input: CreateClassInput) {
    const classId = `t-${Date.now()}`;
    const hasManualStudents = Boolean(input.students && input.students.length > 0);
    const totalAlunosInput = input.totalAlunos ?? 0;
    const percentualInput = input.percentualAlfabetizacao ?? 0;

    const normalizedStudents: Student[] = hasManualStudents
      ? input.students!.map((student, index) => ({
          id: `${classId}-a${index + 1}`,
          ...student,
        }))
      : totalAlunosInput > 0
        ? buildStudentsForNewClass(classId, totalAlunosInput, percentualInput)
        : [];

    const newClass: ClassRoom = {
      id: classId,
      nome: input.nome,
      professor: input.professor ?? 'A definir',
      totalAlunos: normalizedStudents.length,
      alunosAlfabeticos: normalizedStudents.reduce((total, student) => total + literacyStageFactor(student.nivel), 0),
      pendencias: normalizedStudents.filter((student) => student.status !== 'EVALUATED').length,
      ativa: true,
    };

    setClasses((current) => [newClass, ...current]);
    setStudentsByClass((current) => ({
      ...current,
      [classId]: normalizedStudents,
    }));
    setSelectedClassId(classId);
  }

  function handleAddStudentToClass(
    classId: string,
    payload: { nome: string; dataNascimento: string; nivel: LiteracyStage },
  ) {
    const studentId = `${classId}-a${Date.now()}`;
    const normalizedLevel = payload.nivel;
    const status = statusByLevel(normalizedLevel);

    setStudentsByClass((current) => {
      const currentStudents = current[classId] ?? [];
      return {
        ...current,
        [classId]: [
          ...currentStudents,
          {
            id: studentId,
            nome: payload.nome,
            dataNascimento: payload.dataNascimento,
            nivel: normalizedLevel,
            status,
            observacoes: '',
          },
        ],
      };
    });
  }

  function handleUpdateStudentInClass(
    classId: string,
    studentId: string,
    payload: { nivel: LiteracyStage; observacoes: string; status: Student['status'] },
  ) {
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
  }

  function handleRemoveStudentFromClass(classId: string, studentId: string) {
    setStudentsByClass((current) => {
      const currentStudents = current[classId] ?? [];
      return {
        ...current,
        [classId]: currentStudents.filter((student) => student.id !== studentId),
      };
    });
  }

  function handleRemoveClass(classId: string) {
    setClasses((current) => current.filter((classRoom) => classRoom.id !== classId));
    setStudentsByClass((current) => {
      const next = { ...current };
      delete next[classId];
      return next;
    });

    if (selectedClassId === classId) {
      setAdminView('DASHBOARD');
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

  if (!token) {
    return <Login onLoginSuccess={handleAuthSuccess} />;
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
        studentsByClass={studentsByClass}
        onBackToDashboard={handleBackToDashboard}
        onGoToClasses={handleGoToClasses}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AdminDashboard
      userName={userName}
      onLogout={handleLogout}
      classes={classesWithDerivedMetrics}
      levelDistribution={levelDistribution}
      classLevelDistribution={classLevelDistribution}
      onRemoveClass={handleRemoveClass}
      onOpenClass={handleOpenClass}
      onGoToClasses={handleGoToClasses}
      onGoToReports={handleGoToReports}
    />
  );
}

export default App;
