import { useEffect, useMemo, useState } from 'react';
import styles from './AdminReportsPage.module.css';
import { stageLabel, type ClassRoom, type LiteracyStage } from './metrics';
import type { Student } from './mockData';

interface AdminReportsPageProps {
  userName: string;
  classes: ClassRoom[];
  studentsByClass: Record<string, Student[]>;
  onBackToDashboard: () => void;
  onGoToClasses: () => void;
  onLogout: () => void;
}

const STAGE_ORDER: LiteracyStage[] = [
  'SEM_DADOS',
  'ICONICA',
  'GARATUJA',
  'PRE_SILABICO',
  'SILABICO_SEM_VALOR_SONORO',
  'SILABICO_COM_VALOR_SONORO',
  'ALFABETICO',
  'ORTOGRAFICO',
];

const STAGE_COLORS: Record<LiteracyStage, string> = {
  SEM_DADOS: '#9ba6ba',
  ICONICA: '#b392f0',
  GARATUJA: '#f59e0b',
  PRE_SILABICO: '#eab308',
  SILABICO_SEM_VALOR_SONORO: '#60a5fa',
  SILABICO_COM_VALOR_SONORO: '#3b82f6',
  ALFABETICO: '#34d399',
  ORTOGRAFICO: '#10b981',
};

function todayLabel() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function AdminReportsPage({
  userName,
  classes,
  studentsByClass,
  onBackToDashboard,
  onGoToClasses,
  onLogout,
}: AdminReportsPageProps) {
  const [selectedClassId, setSelectedClassId] = useState<'ALL' | string>('ALL');
  const [animationProgress, setAnimationProgress] = useState(0);

  const studentsScope = useMemo(() => {
    if (selectedClassId === 'ALL') {
      return classes.flatMap((item) => studentsByClass[item.id] ?? []);
    }

    return studentsByClass[selectedClassId] ?? [];
  }, [classes, selectedClassId, studentsByClass]);

  const distribution = useMemo(() => {
    const total = studentsScope.length;
    const counts = STAGE_ORDER.reduce((acc, stage) => ({ ...acc, [stage]: 0 }), {} as Record<LiteracyStage, number>);

    studentsScope.forEach((student) => {
      if (student.nivel in counts) {
        counts[student.nivel] += 1;
      }
    });

    return STAGE_ORDER.map((stage) => ({
      stage,
      count: counts[stage],
      percent: total > 0 ? Math.round((counts[stage] / total) * 100) : 0,
    }));
  }, [studentsScope]);

  const evaluationsDone = useMemo(
    () => studentsScope.filter((student) => student.nivel !== 'SEM_DADOS').length,
    [studentsScope],
  );

  const evolutionPercent = useMemo(() => {
    if (studentsScope.length === 0) {
      return 0;
    }

    const advanced = studentsScope.filter(
      (student) =>
        student.nivel === 'SILABICO_COM_VALOR_SONORO' || student.nivel === 'ALFABETICO' || student.nivel === 'ORTOGRAFICO',
    ).length;

    return Math.round((advanced / studentsScope.length) * 100);
  }, [studentsScope]);

  const pendingReports = useMemo(
    () =>
      classes.reduce((total, item) => {
        const students = studentsByClass[item.id] ?? [];
        return total + students.filter((student) => student.status !== 'EVALUATED').length;
      }, 0),
    [classes, studentsByClass],
  );

  const classPerformance = useMemo(
    () =>
      classes.map((item) => {
        const students = studentsByClass[item.id] ?? [];
        const total = students.length;
        const advanced = students.filter(
          (student) => student.nivel === 'ALFABETICO' || student.nivel === 'ORTOGRAFICO',
        ).length;

        return {
          classId: item.id,
          className: item.nome,
          students: total,
          percent: total > 0 ? Math.round((advanced / total) * 100) : 0,
        };
      }),
    [classes, studentsByClass],
  );

  useEffect(() => {
    let frameId = 0;
    const durationMs = 1200;
    const start = performance.now();

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / durationMs);
      setAnimationProgress(progress);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="/Logo-colorida-lunetras-sem-fundo.png" alt="Lunetras" />
          <strong>LUNETRAS</strong>
        </div>

        <nav className={styles.nav}>
          <button onClick={onBackToDashboard}>Painel</button>
          <button onClick={onGoToClasses}>Minhas Turmas</button>
          <button className={styles.active}>Relatórios</button>
        </nav>

        <button className={styles.logout} onClick={onLogout}>
          Sair
        </button>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <h1>Relatórios Pedagógicos</h1>
            <p>Acompanhamento geral da evolução da escrita em {todayLabel()}</p>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.roundIcon}>⌕</span>
            <span className={styles.roundIcon}>◔</span>
            <div className={styles.userBadge}>
              <span>Olá, {userName}</span>
              <small>Administrador(a)</small>
            </div>
          </div>
        </header>

        <section className={styles.kpis}>
          <article className={styles.kpiCard}>
            <div className={styles.kpiIcon}>▤</div>
            <div>
              <p className={styles.kpiValue}>{evaluationsDone}</p>
              <p className={styles.kpiLabel}>Avaliações realizadas</p>
            </div>
          </article>

          <article className={styles.kpiCard}>
            <div className={styles.kpiIconBlue}>↗</div>
            <div>
              <p className={styles.kpiValueBlue}>+{Math.round(evolutionPercent * animationProgress)}%</p>
              <p className={styles.kpiLabel}>Evolução da escrita</p>
            </div>
          </article>

          <article className={styles.kpiCard}>
            <div className={styles.kpiIconRed}>◷</div>
            <div>
              <p className={styles.kpiValue}>{pendingReports}</p>
              <p className={styles.kpiLabel}>Relatórios pendentes</p>
            </div>
          </article>
        </section>

        <article className={styles.block}>
          <div className={styles.blockHeader}>
            <h3>Distribuição dos níveis de escrita</h3>
            <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
              <option value="ALL">Todas as turmas</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.rows}>
            {distribution.map((item) => (
              <div className={styles.row} key={item.stage}>
                <div className={styles.rowInfo}>
                  <span>{stageLabel(item.stage)}</span>
                  <strong>{Math.round(item.percent * animationProgress)}%</strong>
                </div>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{
                      width: `${item.percent * animationProgress}%`,
                      backgroundColor: STAGE_COLORS[item.stage],
                    }}
                  />
                </div>
                <small className={styles.rowMeta}>
                  {item.count} aluno{item.count === 1 ? '' : 's'}
                </small>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.block}>
          <div className={styles.blockHeader}>
            <h3>Desempenho por turma</h3>
            <button type="button" className={styles.exportButton}>
              Exportar PDF
            </button>
          </div>

          <div className={styles.rows}>
            {classPerformance.map((item) => (
              <div className={styles.row} key={item.classId}>
                <div className={styles.rowInfo}>
                  <span>{item.className}</span>
                  <strong>{Math.round(item.percent * animationProgress)}%</strong>
                </div>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{ width: `${item.percent * animationProgress}%`, backgroundColor: '#4d79d8' }}
                  />
                </div>
                <small className={styles.rowMeta}>{item.students} alunos na turma</small>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
