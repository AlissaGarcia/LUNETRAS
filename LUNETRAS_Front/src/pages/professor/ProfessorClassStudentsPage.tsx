import { AdminClassStudentsPage } from '../admin/AdminClassStudentsPage';
import type { Bimester, StudentEvaluation } from '../admin/evaluations';
import type { ClassRoom, LiteracyStage } from '../admin/metrics';
import type { Student } from '../admin/mockData';
import type { StudentStatus } from '../admin/types';

interface ProfessorClassStudentsPageProps {
  userName: string;
  classes: ClassRoom[];
  classRoom: ClassRoom | null;
  students: Student[];
  evaluationsByStudent: Record<string, StudentEvaluation[]>;
  onSelectClass: (classId: string) => void;
  onUpdateStudentInClass: (
    classId: string,
    studentId: string,
    payload: { nivel: LiteracyStage; observacoes: string; status: StudentStatus; bimestre: Bimester },
  ) => void;
  onBackToDashboard: () => void;
  onGoToReports: () => void;
  onLogout: () => void;
}

export function ProfessorClassStudentsPage(props: ProfessorClassStudentsPageProps) {
  return (
    <AdminClassStudentsPage
      userName={props.userName}
      classes={props.classes}
      classRoom={props.classRoom}
      students={props.students}
      evaluationsByStudent={props.evaluationsByStudent}
      onSelectClass={props.onSelectClass}
      onCreateClass={async () => false}
      onAddStudentToClass={async () => false}
      onUpdateStudentInClass={props.onUpdateStudentInClass}
      onRemoveClass={() => undefined}
      onRemoveStudentFromClass={() => undefined}
      onBackToDashboard={props.onBackToDashboard}
      onGoToReports={props.onGoToReports}
      onLogout={props.onLogout}
      showTeachersNav={false}
      allowClassManagement={false}
      allowStudentRemoval={false}
      userRoleLabel="Professor(a)"
    />
  );
}
