import { AdminDashboard } from '../admin/AdminDashboard';
import type { ClassRoom, LiteracyStage } from '../admin/metrics';

interface LevelDistributionItem {
  stage: LiteracyStage;
  count: number;
  percent: number;
}

interface ClassLevelDistributionItem {
  classId: string;
  total: number;
  levels: LevelDistributionItem[];
}

interface ProfessorDashboardProps {
  userName: string;
  onLogout: () => void;
  classes: ClassRoom[];
  levelDistribution: LevelDistributionItem[];
  classLevelDistribution: ClassLevelDistributionItem[];
  onOpenClass: (classId: string) => void;
  onGoToClasses: () => void;
  onGoToReports: () => void;
}

export function ProfessorDashboard(props: ProfessorDashboardProps) {
  return (
    <AdminDashboard
      userName={props.userName}
      onLogout={props.onLogout}
      classes={props.classes}
      levelDistribution={props.levelDistribution}
      classLevelDistribution={props.classLevelDistribution}
      onRemoveClass={() => undefined}
      onOpenClass={props.onOpenClass}
      onGoToClasses={props.onGoToClasses}
      onGoToReports={props.onGoToReports}
      showTeachersNav={false}
      allowRemoveClass={false}
      pageTitle="Painel do Professor"
      userRoleLabel="Professor(a)"
    />
  );
}
