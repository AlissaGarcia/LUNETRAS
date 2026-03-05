import { useEffect, useMemo, useState } from 'react';
import styles from './AdminDashboard.module.css';
import { calculateClassProgress, calculateSummary, resolveLiteracyStage, stageLabel, type ClassRoom } from './metrics';

interface AdminDashboardProps {
  userName: string;
  onLogout: () => void;
  classes: ClassRoom[];
  onRemoveClass: (classId: string) => void;
  onOpenClass: (classId: string) => void;
  onGoToClasses: () => void;
}

function todayLabel() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function mixHexColor(colorA: string, colorB: string, weight: number) {
  const safeWeight = Math.max(0, Math.min(1, weight));
  const parse = (value: string) => parseInt(value, 16);
  const aR = parse(colorA.slice(1, 3));
  const aG = parse(colorA.slice(3, 5));
  const aB = parse(colorA.slice(5, 7));
  const bR = parse(colorB.slice(1, 3));
  const bG = parse(colorB.slice(3, 5));
  const bB = parse(colorB.slice(5, 7));

  const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0');
  const r = aR + (bR - aR) * safeWeight;
  const g = aG + (bG - aG) * safeWeight;
  const b = aB + (bB - aB) * safeWeight;

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function resolveProgressColor(progress: number) {
  const clamped = Math.max(0, Math.min(100, progress));
  const lowColor = '#e55656';
  const mediumColor = '#e6a63f';
  const highColor = '#37c977';

  if (clamped <= 50) {
    return mixHexColor(lowColor, mediumColor, clamped / 50);
  }

  return mixHexColor(mediumColor, highColor, (clamped - 50) / 50);
}

export function AdminDashboard({
  userName,
  onLogout,
  classes,
  onRemoveClass,
  onOpenClass,
  onGoToClasses,
}: AdminDashboardProps) {
  const [animationProgress, setAnimationProgress] = useState(0);

  const summary = useMemo(() => calculateSummary(classes), [classes]);
  const animatedSummaryProgress = Math.round(summary.percentualAlfabetizacao * animationProgress);
  const pendingTasks = useMemo(
    () =>
      classes
        .filter((item) => item.pendencias > 0)
        .map((item) => ({
          id: item.id,
          text: `Corrigir ${item.pendencias} avaliacoes da turma ${item.nome}`,
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
          <button>Relatórios</button>
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
          <article className={styles.kpiCard}>
            <div>
              <p className={styles.kpiLabel}>Nivel Geral</p>
              <p className={styles.kpiStage} style={{ color: resolveProgressColor(animatedSummaryProgress) }}>
                {stageLabel(resolveLiteracyStage(animatedSummaryProgress))}
              </p>
            </div>
            <div
              className={styles.ring}
              style={{
                ['--progress' as string]: `${animatedSummaryProgress}`,
                ['--tone-color' as string]: resolveProgressColor(animatedSummaryProgress),
              }}
            >
              <span>{animatedSummaryProgress}%</span>
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
                const classProgress = Math.round(calculateClassProgress(item) * animationProgress);
                const literacyStage = resolveLiteracyStage(classProgress);
                const classColor = resolveProgressColor(classProgress);

                return (
                  <article key={item.id} className={styles.classCard}>
                    <header>
                      <strong>{item.nome}</strong>
                      <span>{classProgress}%</span>
                    </header>
                    <p style={{ color: classColor }}>{stageLabel(literacyStage)}</p>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${classProgress}%`,
                          ['--bar-color' as string]: classColor,
                        }}
                      />
                    </div>
                    <small>
                      Índice médio de escrita da turma: {classProgress}%
                    </small>
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
              <h3>Pendencias</h3>
              <span>{pendingTasks.length} itens</span>
            </div>

            <ul className={styles.pendingList}>
              {pendingTasks.length === 0 ? (
                <li className={styles.empty}>Sem pendencias no momento.</li>
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
