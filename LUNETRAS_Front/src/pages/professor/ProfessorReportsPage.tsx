import { AdminReportsPage } from '../admin/AdminReportsPage';
import type { StudentEvaluation } from '../admin/evaluations';
import type { ClassRoom } from '../admin/metrics';
import type { Student } from '../admin/mockData';

interface ProfessorReportsPageProps {
  userName: string;
  classes: ClassRoom[];
  studentsByClass: Record<string, Student[]>;
  evaluationsByStudent: Record<string, StudentEvaluation[]>;
  onBackToDashboard: () => void;
  onGoToClasses: () => void;
  onLogout: () => void | Promise<void>;
}

export function ProfessorReportsPage(props: ProfessorReportsPageProps) {
  return (
    <AdminReportsPage
      userName={props.userName}
      classes={props.classes}
      studentsByClass={props.studentsByClass}
      evaluationsByStudent={props.evaluationsByStudent}
      onBackToDashboard={props.onBackToDashboard}
      onGoToClasses={props.onGoToClasses}
      onLogout={props.onLogout}
      showTeachersNav={false}
      userRoleLabel="Professor(a)"
    />
  );
}
