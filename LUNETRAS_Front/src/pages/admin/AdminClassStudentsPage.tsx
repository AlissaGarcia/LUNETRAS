import { useMemo, useState } from 'react';
import styles from './AdminClassStudentsPage.module.css';
import type { Bimester, StudentEvaluation } from './evaluations';
import { stageLabel, type ClassRoom, type LiteracyStage } from './metrics';
import type { Student } from './mockData';
import type { CreateClassInput, StudentStatus } from './types';

interface AdminClassStudentsPageProps {
  userName: string;
  classes: ClassRoom[];
  classRoom: ClassRoom | null;
  students: Student[];
  evaluationsByStudent: Record<string, StudentEvaluation[]>;
  onSelectClass: (classId: string) => void;
  onCreateClass: (input: CreateClassInput) => Promise<boolean>;
  onAddStudentToClass: (
    classId: string,
    payload: { nome: string; dataNascimento: string; nivel: LiteracyStage },
  ) => Promise<boolean>;
  onUpdateStudentInClass: (
    classId: string,
    studentId: string,
    payload: { nivel: LiteracyStage; observacoes: string; status: StudentStatus; bimestre: Bimester },
  ) => void;
  onRemoveClass: (classId: string) => void;
  onRemoveStudentFromClass: (classId: string, studentId: string) => void;
  onBackToDashboard: () => void;
  onGoToTeachers?: () => void;
  onGoToReports: () => void;
  onLogout: () => void | Promise<void>;
  showTeachersNav?: boolean;
  allowClassManagement?: boolean;
  allowStudentRemoval?: boolean;
  userRoleLabel?: string;
}

type FilterMode = 'ALL' | 'PENDING' | 'EVALUATED';

const WRITING_LEVEL_OPTIONS: LiteracyStage[] = [
  'SEM_DADOS',
  'ICONICA',
  'GARATUJA',
  'PRE_SILABICO',
  'SILABICO_SEM_VALOR_SONORO',
  'SILABICO_COM_VALOR_SONORO',
  'ALFABETICO',
  'ORTOGRAFICO',
];
const BIMESTER_OPTIONS: Bimester[] = ['B1', 'B2', 'B3', 'B4'];

function formatBirthDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function statusMeta(status: Student['status']) {
  switch (status) {
    case 'SEM_AVALIACAO':
      return { text: 'Sem avaliação', tone: 'warn' };
    case 'AVALIADO':
      return { text: 'Avaliado', tone: 'ok' };
    case 'REAVALIAR':
      return { text: 'Reavaliar', tone: 'info' };
    default:
      return { text: 'Sem status', tone: 'info' };
  }
}

export function AdminClassStudentsPage({
  userName,
  classes,
  classRoom,
  students,
  evaluationsByStudent,
  onSelectClass,
  onCreateClass,
  onAddStudentToClass,
  onUpdateStudentInClass,
  onRemoveClass,
  onRemoveStudentFromClass,
  onBackToDashboard,
  onGoToTeachers,
  onGoToReports,
  onLogout,
  showTeachersNav = true,
  allowClassManagement = true,
  allowStudentRemoval = true,
  userRoleLabel = 'Administrador(a)',
}: AdminClassStudentsPageProps) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isStudentDetailsModalOpen, setIsStudentDetailsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentLevel, setSelectedStudentLevel] = useState<LiteracyStage>('SEM_DADOS');
  const [selectedStudentStatus, setSelectedStudentStatus] = useState<StudentStatus>('SEM_AVALIACAO');
  const [selectedStudentNotes, setSelectedStudentNotes] = useState('');
  const [selectedBimester, setSelectedBimester] = useState<Bimester>('B1');

  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentBirthDate, setNewStudentBirthDate] = useState('');
  const [formError, setFormError] = useState('');
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const visibleStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesName = student.nome.toLowerCase().includes(normalizedSearch);
      if (!matchesName) {
        return false;
      }

      if (filterMode === 'PENDING') {
        return student.status !== 'AVALIADO';
      }

      if (filterMode === 'EVALUATED') {
        return student.status === 'AVALIADO';
      }

      return true;
    });
  }, [filterMode, search, students]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [selectedStudentId, students],
  );
  const selectedStudentEvaluations = useMemo(
    () => (selectedStudentId ? evaluationsByStudent[selectedStudentId] ?? [] : []),
    [evaluationsByStudent, selectedStudentId],
  );

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

  function applyEvaluationForBimester(studentId: string, bimester: Bimester, fallbackStudent: Student) {
    const evaluation = (evaluationsByStudent[studentId] ?? []).find((item) => item.bimestre === bimester);

    if (!evaluation) {
      setSelectedStudentLevel(fallbackStudent.nivel);
      setSelectedStudentStatus(fallbackStudent.status);
      setSelectedStudentNotes(fallbackStudent.observacoes ?? '');
      return;
    }

    setSelectedStudentLevel(evaluation.nivel);
    setSelectedStudentStatus(evaluation.status);
    setSelectedStudentNotes(evaluation.observacoes ?? '');
  }

  async function handleCreateClass() {
    if (!newClassName.trim()) {
      setFormError('Informe o nome da turma.');
      return;
    }

    setIsCreatingClass(true);
    setFormError('');
    const created = await onCreateClass({
      nome: newClassName.trim(),
      professor: 'A definir',
    });

    if (created) {
      setNewClassName('');
      setIsCreateClassModalOpen(false);
    } else {
      setFormError('Não foi possível criar a turma no backend. Verifique se a API está ativa.');
    }
    setIsCreatingClass(false);
  }

  async function handleAddStudentToCurrentClass() {
    if (!classRoom || !newStudentName.trim() || !newStudentBirthDate) {
      setFormError('Preencha nome e data de nascimento do aluno.');
      return;
    }

    setIsAddingStudent(true);
    setFormError('');
    const added = await onAddStudentToClass(classRoom.id, {
      nome: newStudentName.trim(),
      dataNascimento: newStudentBirthDate,
      nivel: 'SEM_DADOS',
    });

    if (added) {
      setNewStudentName('');
      setNewStudentBirthDate('');
      setIsAddStudentModalOpen(false);
    } else {
      setFormError('Não foi possível adicionar o aluno no backend.');
    }
    setIsAddingStudent(false);
  }

  function handleRemoveCurrentClass() {
    if (!classRoom) {
      return;
    }

    const confirmed = window.confirm(`Deseja remover a turma ${classRoom.nome}?`);
    if (!confirmed) {
      return;
    }

    onRemoveClass(classRoom.id);
  }

  function openStudentDetails(student: Student) {
    setSelectedStudentId(student.id);
    setSelectedBimester('B1');
    applyEvaluationForBimester(student.id, 'B1', student);
    setIsStudentDetailsModalOpen(true);
  }

  function handleBimesterChange(bimester: Bimester) {
    setSelectedBimester(bimester);

    if (!selectedStudentId || !selectedStudent) {
      return;
    }

    applyEvaluationForBimester(selectedStudentId, bimester, selectedStudent);
  }

  function handleSaveStudentDetails() {
    if (!classRoom || !selectedStudentId) {
      return;
    }

    onUpdateStudentInClass(classRoom.id, selectedStudentId, {
      nivel: selectedStudentLevel,
      observacoes: selectedStudentNotes.trim(),
      status: selectedStudentStatus,
      bimestre: selectedBimester,
    });

    setIsStudentDetailsModalOpen(false);
  }

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="/Logo-colorida-lunetras-sem-fundo.png" alt="Lunetras" />
          <strong>LUNETRAS</strong>
        </div>

        <nav className={styles.nav}>
          <button onClick={onBackToDashboard}>Painel</button>
          <button className={styles.active}>Minhas Turmas</button>
          {showTeachersNav ? <button onClick={onGoToTeachers}>Professores</button> : null}
          <button onClick={onGoToReports}>Relatórios</button>
        </nav>

        <button className={styles.logout} onClick={handleLogoutClick} disabled={isLoggingOut}>
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </button>
      </aside>

      <section className={styles.content}>
        <div
          className={isCreateClassModalOpen || isAddStudentModalOpen || isStudentDetailsModalOpen ? styles.contentBlur : undefined}
        >
          <header className={styles.header}>
            <div>
              <h1>Turma {classRoom?.nome ?? '-'}</h1>
              <p className={styles.classTeacherLabel}>Professor(a): {classRoom?.professor ?? 'A definir'}</p>
            </div>
            <div className={styles.userBadge}>
              <span>Olá, {userName}</span>
              <small>{userRoleLabel}</small>
            </div>
          </header>

          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <select value={classRoom?.id ?? ''} onChange={(event) => onSelectClass(event.target.value)}>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    Turma {item.nome}
                  </option>
                ))}
              </select>

              <select value={filterMode} onChange={(event) => setFilterMode(event.target.value as FilterMode)}>
                <option value="ALL">Visualizando: Todos os Alunos</option>
                <option value="PENDING">Visualizando: Com pendências</option>
                <option value="EVALUATED">Visualizando: Avaliados</option>
              </select>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.primaryAction} onClick={onGoToReports}>
                Gerar Relatório
              </button>
              {allowClassManagement ? (
                <>
                  <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() => setIsAddStudentModalOpen(true)}
                    disabled={!classRoom}
                  >
                    Adicionar aluno
                  </button>
                  <button
                    type="button"
                    className={styles.dangerAction}
                    onClick={handleRemoveCurrentClass}
                    disabled={!classRoom}
                  >
                    Remover turma
                  </button>
                  <button type="button" className={styles.primaryAction} onClick={() => setIsCreateClassModalOpen(true)}>
                    Criar turma
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className={styles.searchRow}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar aluno..."
            />
          </div>

          <section className={styles.tableShell}>
            <div className={styles.tableHeader}>
              <span>Aluno</span>
              <span>Data de Nascimento</span>
              <span>Nível de escrita</span>
              <span>Status</span>
            </div>

            {visibleStudents.map((student) => {
              const status = statusMeta(student.status);
              return (
                <article key={student.id} className={styles.tableRow} onClick={() => openStudentDetails(student)}>
                  <div className={styles.studentCell}>
                    <span className={styles.avatar}>{student.nome.slice(0, 1)}</span>
                    <strong>{student.nome}</strong>
                  </div>
                  <span>{formatBirthDate(student.dataNascimento)}</span>
                  <span className={styles.levelTag}>{stageLabel(student.nivel)}</span>
                  <div className={styles.statusCell}>
                    <span className={`${styles.statusTag} ${styles[`status_${status.tone}`]}`}>{status.text}</span>
                    {allowStudentRemoval ? (
                      <button
                        type="button"
                        className={styles.removeStudentButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (classRoom) {
                            onRemoveStudentFromClass(classRoom.id, student.id);
                          }
                        }}
                      >
                        Remover
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}

            {visibleStudents.length === 0 ? <p className={styles.empty}>Nenhum aluno encontrado para esse filtro.</p> : null}
          </section>
        </div>

        {allowClassManagement && isCreateClassModalOpen ? (
          <div className={styles.modalOverlay} onClick={() => setIsCreateClassModalOpen(false)}>
            <article className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
              <header className={styles.modalHeader}>
                <h2>Criar nova turma</h2>
                <button type="button" onClick={() => setIsCreateClassModalOpen(false)}>
                  X
                </button>
              </header>

              <div className={styles.modalGrid}>
                <label>
                  Nome da turma
                  <input value={newClassName} onChange={(event) => setNewClassName(event.target.value)} placeholder="" />
                </label>
              </div>
              {formError ? <p className={styles.formError}>{formError}</p> : null}

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.secondaryAction} onClick={() => setIsCreateClassModalOpen(false)}>
                  Cancelar
                </button>
                <button type="button" className={styles.primaryAction} onClick={handleCreateClass} disabled={isCreatingClass}>
                  {isCreatingClass ? 'Criando...' : 'Criar turma'}
                </button>
              </footer>
            </article>
          </div>
        ) : null}

        {allowClassManagement && isAddStudentModalOpen ? (
          <div className={styles.modalOverlay} onClick={() => setIsAddStudentModalOpen(false)}>
            <article className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
              <header className={styles.modalHeader}>
                <h2>Adicionar aluno</h2>
                <button type="button" onClick={() => setIsAddStudentModalOpen(false)}>
                  X
                </button>
              </header>

              <div className={styles.modalGrid}>
                <label>
                  Nome do aluno
                  <input
                    value={newStudentName}
                    onChange={(event) => setNewStudentName(event.target.value)}
                    placeholder="Ex.: Lucas Martins"
                  />
                </label>
                <label>
                  Data de nascimento
                  <input
                    type="date"
                    value={newStudentBirthDate}
                    onChange={(event) => setNewStudentBirthDate(event.target.value)}
                  />
                </label>
                <p>O nível de escrita inicial será salvo como "Sem dados".</p>
              </div>
              {formError ? <p className={styles.formError}>{formError}</p> : null}

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.secondaryAction} onClick={() => setIsAddStudentModalOpen(false)}>
                  Cancelar
                </button>
                <button type="button" className={styles.primaryAction} onClick={handleAddStudentToCurrentClass} disabled={isAddingStudent}>
                  {isAddingStudent ? 'Registrando...' : 'Registrar aluno'}
                </button>
              </footer>
            </article>
          </div>
        ) : null}

        {isStudentDetailsModalOpen && selectedStudent ? (
          <div className={styles.modalOverlay} onClick={() => setIsStudentDetailsModalOpen(false)}>
            <article className={`${styles.modalCard} ${styles.studentDetailsModal}`} onClick={(event) => event.stopPropagation()}>
              <header className={styles.modalHeader}>
                <h2>Nova Avaliação</h2>
                <button type="button" onClick={() => setIsStudentDetailsModalOpen(false)}>
                  X
                </button>
              </header>

              <section className={styles.studentInfoCard}>
                <div className={styles.studentInfoAvatar}>{selectedStudent.nome.slice(0, 1)}</div>
                <div>
                  <strong>{selectedStudent.nome}</strong>
                  <p>
                    Turma {classRoom?.nome} | Data de nasc: {formatBirthDate(selectedStudent.dataNascimento)}
                  </p>
                </div>
              </section>

              <section className={styles.levelSection}>
                <h3>Bimestre</h3>
                <select
                  className={styles.statusSelect}
                  value={selectedBimester}
                  onChange={(event) => handleBimesterChange(event.target.value as Bimester)}
                >
                  <option value="B1">1º Bimestre</option>
                  <option value="B2">2º Bimestre</option>
                  <option value="B3">3º Bimestre</option>
                  <option value="B4">4º Bimestre</option>
                </select>
              </section>

              <section className={styles.levelSection}>
                <h3>Nível de escrita</h3>
                <div className={styles.levelOptions}>
                  {WRITING_LEVEL_OPTIONS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`${styles.levelOption} ${selectedStudentLevel === level ? styles.levelOptionActive : ''}`}
                      onClick={() => setSelectedStudentLevel(level)}
                    >
                      {stageLabel(level)}
                    </button>
                  ))}
                </div>
              </section>

              <section className={styles.levelSection}>
                <h3>Status</h3>
                <select
                  className={styles.statusSelect}
                  value={selectedStudentStatus}
                  onChange={(event) => setSelectedStudentStatus(event.target.value as StudentStatus)}
                >
                  <option value="SEM_AVALIACAO">Sem avaliação</option>
                  <option value="AVALIADO">Avaliado</option>
                  <option value="REAVALIAR">Reavaliar</option>
                </select>
              </section>

              <section className={styles.notesSection}>
                <h3>Adicionar observações</h3>
                <textarea
                  value={selectedStudentNotes}
                  onChange={(event) => setSelectedStudentNotes(event.target.value)}
                  placeholder="Registre observações sobre o progresso do aluno..."
                />
              </section>

              <section className={styles.historySection}>
                <h3>Histórico por bimestre</h3>
                <div className={styles.historyGrid}>
                  {BIMESTER_OPTIONS.map((bimester) => {
                    const entry = selectedStudentEvaluations.find((item) => item.bimestre === bimester);

                    return (
                      <article key={bimester} className={styles.historyCard}>
                        <strong>
                          {bimester === 'B1'
                            ? '1º Bimestre'
                            : bimester === 'B2'
                              ? '2º Bimestre'
                              : bimester === 'B3'
                                ? '3º Bimestre'
                                : '4º Bimestre'}
                        </strong>
                        {entry ? (
                          <>
                            <span>{stageLabel(entry.nivel)}</span>
                            <small>{statusMeta(entry.status).text}</small>
                            <small>{formatBirthDate(entry.dataAvaliacao)}</small>
                          </>
                        ) : (
                          <small>Sem avaliação registrada</small>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.secondaryAction} onClick={() => setIsStudentDetailsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="button" className={styles.primaryAction} onClick={handleSaveStudentDetails}>
                  Salvar avaliação
                </button>
              </footer>
            </article>
          </div>
        ) : null}

      </section>
    </main>
  );
}
