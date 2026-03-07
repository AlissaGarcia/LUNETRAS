import { useEffect, useMemo, useState } from 'react';
import styles from './AdminDashboard.module.css';
import { calculateSummary, stageLabel, type ClassRoom, type LiteracyStage } from './metrics';

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

interface AdminDashboardProps {
  userName: string;
  onLogout: () => void;
  classes: ClassRoom[];
  levelDistribution: LevelDistributionItem[];
  classLevelDistribution: ClassLevelDistributionItem[];
  onRemoveClass: (classId: string) => void;
  onOpenClass: (classId: string) => void;
  onGoToClasses: () => void;
  onGoToReports: () => void;
}

function todayLabel() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function AdminDashboard({
  userName,
  onLogout,
  classes,
  levelDistribution,
  classLevelDistribution,
  onRemoveClass,
  onOpenClass,
  onGoToClasses,
  onGoToReports,
}: AdminDashboardProps) {
  const [animationProgress, setAnimationProgress] = useState(0);

  const summary = useMemo(() => calculateSummary(classes), [classes]);
  const pendingTasks = useMemo(
    () =>
      classes
        .filter((item) => item.pendencias > 0)
        .map((item) => ({
          id: item.id,
          text: `Corrigir ${item.pendencias} avaliações da turma ${item.nome}`,
          urgency: item.pendencias >= 4 ? 'URGENTE' : 'NORMAL',
        })),
    [classes],
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
          <button className={styles.active}>Painel</button>
          <button onClick={onGoToClasses}>Minhas Turmas</button>
          <button onClick={onGoToReports}>Relatórios</button>
        </nav>

        <button className={styles.logout} onClick={onLogout}>
          Sair
        </button>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <h1>Painel do Administrador</h1>
            <p>Visão geral do dia {todayLabel()}</p>
          </div>
          <div className={styles.userBadge}>
            <span>Olá, {userName}</span>
            <small>Administrador(a)</small>
          </div>
        </header>

        <article className={styles.highlight}>
          <div>
            <h2>Painel geral do sistema de alfabetização</h2>
            <p>Use os indicadores abaixo para acompanhar o desempenho das turmas e priorizar ações.</p>
          </div>
        </article>

        <section className={styles.kpis}>
          <article className={styles.kpiCard}>
            <p className={styles.kpiValue}>{summary.totalTurmasAtivas}</p>
            <p className={styles.kpiLabel}>Turmas Ativas</p>
          </article>
          <article className={styles.kpiCard}>
            <p className={styles.kpiValue}>{summary.totalAlunos}</p>
            <p className={styles.kpiLabel}>Total de Alunos</p>
          </article>
          <article className={`${styles.kpiCard} ${styles.chartCard}`}>
            <div className={styles.chartHeader}>
              <p className={styles.kpiLabel}>Distribuição geral por nível de escrita</p>
            </div>
            <div className={styles.towerChart}>
              {levelDistribution.map((item) => (
                <div key={item.stage} className={styles.towerItem}>
                  <span className={styles.towerValue}>{Math.round(item.percent * animationProgress)}%</span>
                  <div className={styles.towerTrack}>
                    <div
                      className={styles.towerFill}
                      style={{ height: `${Math.max(4, item.percent * animationProgress)}%` }}
                    />
                  </div>
                  <small className={styles.towerLabel}>{stageLabel(item.stage)}</small>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.grid}>
          <article className={styles.block}>
            <div className={styles.blockHeader}>
              <h3>Progresso das Turmas</h3>
              <span>{classes.length} turmas</span>
            </div>

            <div className={styles.classList}>
              {classes.map((item) => {
                const classData = classLevelDistribution.find((entry) => entry.classId === item.id);
                const classLevels = classData?.levels ?? [];

                return (
                  <article key={item.id} className={styles.classCard}>
                    <header>
                      <strong>{item.nome}</strong>
                      <span>{classData?.total ?? 0} alunos</span>
                    </header>

                    <div className={styles.classCategoryList}>
                      {classLevels.map((level) => (
                        <div key={`${item.id}-${level.stage}`} className={styles.classCategoryRow}>
                          <small>{stageLabel(level.stage)}</small>
                          <span>{Math.round(level.percent * animationProgress)}%</span>
                          <div className={styles.progressTrack}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${Math.max(0, level.percent * animationProgress)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={styles.classActions}>
                      <button type="button" className={styles.openClassButton} onClick={() => onOpenClass(item.id)}>
                        Ver turma
                      </button>
                      <button type="button" className={styles.removeClassButton} onClick={() => onRemoveClass(item.id)}>
                        Remover turma
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </article>

          <article className={`${styles.block} ${styles.pendingBlock}`}>
            <div className={styles.blockHeader}>
              <h3>Pendências</h3>
              <span>{pendingTasks.length} itens</span>
            </div>

            <ul className={styles.pendingList}>
              {pendingTasks.length === 0 ? (
                <li className={styles.empty}>Sem pendências no momento.</li>
              ) : (
                pendingTasks.map((task) => (
                  <li key={task.id}>
                    <span>{task.text}</span>
                    {task.urgency === 'URGENTE' ? <strong>URGENTE</strong> : null}
                  </li>
                ))
              )}
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
