import { useEffect, useMemo, useState } from 'react';
import type { Bimester, StudentEvaluation } from './evaluations';
import styles from './AdminReportsPage.module.css';
import { STAGE_COLORS, stageLabel, type ClassRoom, type LiteracyStage } from './metrics';
import type { Student } from './mockData';

interface AdminReportsPageProps {
  userName: string;
  classes: ClassRoom[];
  studentsByClass: Record<string, Student[]>;
  evaluationsByStudent: Record<string, StudentEvaluation[]>;
  onBackToDashboard: () => void;
  onGoToClasses: () => void;
  onGoToTeachers?: () => void;
  onLogout: () => void | Promise<void>;
  showTeachersNav?: boolean;
  userRoleLabel?: string;
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

const BIMESTERS: Bimester[] = ['B1', 'B2', 'B3', 'B4'];

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path fill="currentColor" d="M6 2h8l4 4v16H6z" opacity="0.22" />
      <path fill="currentColor" d="M14 2v4h4z" />
      <path fill="currentColor" d="M8 11h8v2H8zm0 4h8v2H8z" />
    </svg>
  );
}

function ChartUpIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path fill="currentColor" d="M4 18h16v2H2V4h2z" />
      <path fill="currentColor" d="M8 14l3-3 2 2 5-5 1.4 1.4L13 16l-2-2-3 3z" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.22" />
      <path fill="currentColor" d="M11 7h2v6h-2zm0 8h2v2h-2z" />
    </svg>
  );
}

function todayLabel() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function statusLabel(status: Student['status']): string {
  if (status === 'AVALIADO') {
    return 'Avaliado';
  }

  if (status === 'REAVALIAR') {
    return 'Reavaliar';
  }

  return 'Sem avaliação';
}

function bimesterLabel(bimester: Bimester): string {
  if (bimester === 'B1') {
    return '1º bimestre';
  }
  if (bimester === 'B2') {
    return '2º bimestre';
  }
  if (bimester === 'B3') {
    return '3º bimestre';
  }

  return '4º bimestre';
}

export function AdminReportsPage({
  userName,
  classes,
  studentsByClass,
  evaluationsByStudent,
  onBackToDashboard,
  onGoToClasses,
  onGoToTeachers,
  onLogout,
  showTeachersNav = true,
  userRoleLabel = 'Administrador(a)',
}: AdminReportsPageProps) {
  const [selectedClassId, setSelectedClassId] = useState<'ALL' | string>('ALL');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportClassId, setExportClassId] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        return total + students.filter((student) => student.status !== 'AVALIADO').length;
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

  function exportClassPdf(classId: string) {
    const scopeClasses = classes.filter((item) => item.id === classId);
    if (scopeClasses.length === 0) {
      window.alert('Turma inválida para exportação.');
      return;
    }

    const popup = window.open('', '_blank', 'width=1200,height=760');
    if (!popup) {
      window.alert('Não foi possível abrir a janela de exportação.');
      return;
    }

    const htmlByBimester = BIMESTERS.map((bimester) => {
      const rows = scopeClasses.flatMap((classItem) => {
        const students = studentsByClass[classItem.id] ?? [];

        return students.map((student) => {
          const evaluations = evaluationsByStudent[student.id] ?? [];
          const evaluation = evaluations.find((item) => item.bimestre === bimester);

          return {
            className: classItem.nome,
            studentName: student.nome,
            nivel: stageLabel(evaluation?.nivel ?? 'SEM_DADOS'),
            status: statusLabel(evaluation?.status ?? 'SEM_AVALIACAO'),
            professor: evaluation?.professorNome ?? classItem.professor ?? 'A definir',
            date: evaluation?.dataAvaliacao ?? '-',
            notes: evaluation?.observacoes?.trim() || '-',
          };
        });
      });

      const tableRows = rows
        .map(
          (row) => `
            <tr>
              <td>${row.className}</td>
              <td>${row.studentName}</td>
              <td>${row.nivel}</td>
              <td>${row.status}</td>
              <td>${row.professor}</td>
              <td>${row.date}</td>
              <td>${row.notes}</td>
            </tr>
          `,
        )
        .join('');

      return `
        <section class="bimester-section">
          <h2>${bimesterLabel(bimester)}</h2>
          <table>
            <thead>
              <tr>
                <th>Turma</th>
                <th>Aluno</th>
                <th>Nível</th>
                <th>Status</th>
                <th>Professor</th>
                <th>Data</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </section>
      `;
    }).join('');

    popup.document.write(`
      <html>
        <head>
          <title>Relatório Lunetras</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #1f293b; }
            h1 { margin: 0 0 8px; }
            p { margin: 0 0 16px; color: #475569; }
            h2 { margin: 0 0 10px; color: #2b3b56; font-size: 18px; text-transform: capitalize; }
            .bimester-section { margin-top: 18px; padding-top: 14px; border-top: 2px dashed #c5d5ee; }
            .bimester-section:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d0d7e5; padding: 8px; text-align: left; vertical-align: top; }
            th { background: #eef3fb; }
          </style>
        </head>
        <body>
          <h1>Relatório Pedagógico - Lunetras</h1>
          <p>Gerado em ${todayLabel()} | Filtro turma: ${scopeClasses[0].nome}</p>
          ${htmlByBimester}
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  }

  function handleOpenExportModal() {
    if (classes.length === 0) {
      window.alert('Não há turmas cadastradas para exportar.');
      return;
    }

    if (selectedClassId !== 'ALL' && classes.some((item) => item.id === selectedClassId)) {
      setExportClassId(selectedClassId);
    } else {
      setExportClassId(classes[0].id);
    }
    setIsExportModalOpen(true);
  }

  function handleConfirmExportPdf() {
    if (!exportClassId) {
      window.alert('Selecione uma turma para exportar.');
      return;
    }

    exportClassPdf(exportClassId);
    setIsExportModalOpen(false);
  }

  async function handleLogoutClick() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await Promise.resolve(onLogout());
    } finally {
      setIsLoggingOut(false);
    }
  }

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
          {showTeachersNav ? <button onClick={onGoToTeachers}>Professores</button> : null}
          <button className={styles.active}>Relatórios</button>
        </nav>

        <button className={styles.logout} onClick={handleLogoutClick} disabled={isLoggingOut}>
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </button>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <h1>Relatórios Pedagógicos</h1>
            <p>Acompanhamento geral da evolução da escrita em {todayLabel()}</p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userBadge}>
              <span>Olá, {userName}</span>
              <small>{userRoleLabel}</small>
            </div>
          </div>
        </header>

        <section className={styles.kpis}>
          <article className={styles.kpiCard}>
            <div className={styles.kpiIcon}>
              <DocumentIcon />
            </div>
            <div>
              <p className={styles.kpiValue}>{evaluationsDone}</p>
              <p className={styles.kpiLabel}>Avaliações realizadas</p>
            </div>
          </article>

          <article className={styles.kpiCard}>
            <div className={styles.kpiIconBlue}>
              <ChartUpIcon />
            </div>
            <div>
              <p className={styles.kpiValueBlue}>+{Math.round(evolutionPercent * animationProgress)}%</p>
              <p className={styles.kpiLabel}>Evolução da escrita</p>
            </div>
          </article>

          <article className={styles.kpiCard}>
            <div className={styles.kpiIconRed}>
              <PendingIcon />
            </div>
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
            <button type="button" className={styles.exportButton} onClick={handleOpenExportModal}>
              Exportar PDF da turma
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

      {isExportModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Exportar relatório por turma">
          <div className={styles.modalCard}>
            <h3>Exportar PDF da turma</h3>
            <p>Selecione qual turma deseja exportar.</p>

            <label htmlFor="export-class-select" className={styles.modalLabel}>
              Turma
            </label>
            <select
              id="export-class-select"
              value={exportClassId}
              className={styles.modalSelect}
              onChange={(event) => setExportClassId(event.target.value)}
            >
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>

            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancel} onClick={() => setIsExportModalOpen(false)}>
                Cancelar
              </button>
              <button type="button" className={styles.modalConfirm} onClick={handleConfirmExportPdf}>
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}




