import { useMemo, useState } from 'react';
import styles from './AdminClassStudentsPage.module.css';
import { stageLabel, type ClassRoom, type LiteracyStage } from './metrics';
import type { Student } from './mockData';
import type { CreateClassInput, StudentStatus } from './types';

interface AdminClassStudentsPageProps {
  userName: string;
  classes: ClassRoom[];
  classRoom: ClassRoom | null;
  students: Student[];
  onSelectClass: (classId: string) => void;
  onCreateClass: (input: CreateClassInput) => void;
  onAddStudentToClass: (classId: string, payload: { nome: string; dataNascimento: string; nivel: LiteracyStage }) => void;
  onUpdateStudentInClass: (
    classId: string,
    studentId: string,
    payload: { nivel: LiteracyStage; observacoes: string; status: StudentStatus },
  ) => void;
  onRemoveClass: (classId: string) => void;
  onRemoveStudentFromClass: (classId: string, studentId: string) => void;
  onBackToDashboard: () => void;
  onLogout: () => void;
}

type FilterMode = 'ALL' | 'PENDING' | 'EVALUATED';

function formatBirthDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function statusMeta(status: Student['status']) {
  switch (status) {
    case 'NEEDS_ATTENTION':
      return { text: 'Necessita de atenção', tone: 'warn' };
    case 'MONITORING':
      return { text: 'Em acompanhamento', tone: 'info' };
    case 'PENDING':
      return { text: 'Avaliação pendente', tone: 'warn' };
    case 'EVALUATED':
      return { text: 'Avaliado', tone: 'ok' };
    case 'REASSESS':
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
  onSelectClass,
  onCreateClass,
  onAddStudentToClass,
  onUpdateStudentInClass,
  onRemoveClass,
  onRemoveStudentFromClass,
  onBackToDashboard,
  onLogout,
}: AdminClassStudentsPageProps) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isStudentDetailsModalOpen, setIsStudentDetailsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentLevel, setSelectedStudentLevel] = useState<LiteracyStage>('SILABICO');
  const [selectedStudentStatus, setSelectedStudentStatus] = useState<StudentStatus>('PENDING');
  const [selectedStudentNotes, setSelectedStudentNotes] = useState('');

  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentBirthDate, setNewStudentBirthDate] = useState('');
  const [newStudentLevel, setNewStudentLevel] = useState<LiteracyStage>('SILABICO');

  const visibleStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesName = student.nome.toLowerCase().includes(normalizedSearch);
      if (!matchesName) {
        return false;
      }

      if (filterMode === 'PENDING') {
        return student.status !== 'EVALUATED';
      }

      if (filterMode === 'EVALUATED') {
        return student.status === 'EVALUATED';
      }

      return true;
    });
  }, [filterMode, search, students]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [selectedStudentId, students],
  );

  function handleCreateClass() {
    if (!newClassName.trim()) {
      return;
    }

    onCreateClass({
      nome: newClassName.trim(),
      professor: 'A definir',
    });

    setNewClassName('');
    setIsCreateClassModalOpen(false);
  }

  function handleAddStudentToCurrentClass() {
    if (!classRoom || !newStudentName.trim() || !newStudentBirthDate) {
      return;
    }

    onAddStudentToClass(classRoom.id, {
      nome: newStudentName.trim(),
      dataNascimento: newStudentBirthDate,
      nivel: newStudentLevel,
    });

    setNewStudentName('');
    setNewStudentBirthDate('');
    setNewStudentLevel('SILABICO');
    setIsAddStudentModalOpen(false);
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
    setSelectedStudentLevel(student.nivel);
    setSelectedStudentStatus(student.status);
    setSelectedStudentNotes(student.observacoes ?? '');
    setIsStudentDetailsModalOpen(true);
  }

  function handleSaveStudentDetails() {
    if (!classRoom || !selectedStudentId) {
      return;
    }

    onUpdateStudentInClass(classRoom.id, selectedStudentId, {
      nivel: selectedStudentLevel,
      observacoes: selectedStudentNotes.trim(),
      status: selectedStudentStatus,
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
          <button>Relatórios</button>
        </nav>

        <button className={styles.logout} onClick={onLogout}>
          Sair
        </button>
      </aside>

      <section className={styles.content}>
        <div
          className={isCreateClassModalOpen || isAddStudentModalOpen || isStudentDetailsModalOpen ? styles.contentBlur : undefined}
        >
          <header className={styles.header}>
            <h1>Turma {classRoom?.nome ?? '-'}</h1>
            <div className={styles.userBadge}>
              <span>Olá, {userName}</span>
              <small>Administrador(a)</small>
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
              <button type="button" className={styles.primaryAction}>
                + Nova Avaliacao
              </button>
                <button type="button" className={styles.secondaryAction}>
                Gerar Relatório
              </button>
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
              <span>Nível de Escrita</span>
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
                    <button
                      type="button"
                      className={styles.removeStudentButton}
                      onClick={(event) => {
                        event.stopPropagation();
                        classRoom && onRemoveStudentFromClass(classRoom.id, student.id);
                      }}
                    >
                      Remover
                    </button>
                  </div>
                </article>
              );
            })}

            {visibleStudents.length === 0 ? (
              <p className={styles.empty}>Nenhum aluno encontrado para esse filtro.</p>
            ) : null}
          </section>
        </div>

        {isCreateClassModalOpen ? (
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
                  <input
                    value={newClassName}
                    onChange={(event) => setNewClassName(event.target.value)}
                    placeholder="Ex.: 2 Ano B"
                  />
                </label>
              </div>

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.secondaryAction} onClick={() => setIsCreateClassModalOpen(false)}>
                  Cancelar
                </button>
                <button type="button" className={styles.primaryAction} onClick={handleCreateClass}>
                  Criar turma
                </button>
              </footer>
            </article>
          </div>
        ) : null}

        {isAddStudentModalOpen ? (
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
                <label>
                  Nível de escrita
                  <select value={newStudentLevel} onChange={(event) => setNewStudentLevel(event.target.value as LiteracyStage)}>
                    <option value="ICONICO">Icônico</option>
                    <option value="GARATUJA">Garatuja</option>
                    <option value="PRE_SILABICO">Pré-silábico</option>
                    <option value="SILABICO">Silábico</option>
                    <option value="SILABICO_ALFABETICO">Silábico-Alfabético</option>
                    <option value="ALFABETICO">Alfabético</option>
                  </select>
                </label>
              </div>

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.secondaryAction} onClick={() => setIsAddStudentModalOpen(false)}>
                  Cancelar
                </button>
                <button type="button" className={styles.primaryAction} onClick={handleAddStudentToCurrentClass}>
                  Registrar aluno
                </button>
              </footer>
            </article>
          </div>
        ) : null}

        {isStudentDetailsModalOpen && selectedStudent ? (
          <div className={styles.modalOverlay} onClick={() => setIsStudentDetailsModalOpen(false)}>
            <article className={`${styles.modalCard} ${styles.studentDetailsModal}`} onClick={(event) => event.stopPropagation()}>
              <header className={styles.modalHeader}>
                <h2>Nova Avaliacao</h2>
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
                <h3>Nível de Escrita</h3>
                <div className={styles.levelOptions}>
                  {(
                    ['ICONICO', 'GARATUJA', 'PRE_SILABICO', 'SILABICO', 'SILABICO_ALFABETICO', 'ALFABETICO'] as LiteracyStage[]
                  ).map((level) => (
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
                  <option value="NEEDS_ATTENTION">Necessita de atenção</option>
                  <option value="MONITORING">Em acompanhamento</option>
                  <option value="PENDING">Avaliação pendente</option>
                  <option value="EVALUATED">Avaliado</option>
                  <option value="REASSESS">Reavaliar</option>
                </select>
              </section>

              <section className={styles.notesSection}>
                <h3>Adicionar Observações</h3>
                <textarea
                  value={selectedStudentNotes}
                  onChange={(event) => setSelectedStudentNotes(event.target.value)}
                  placeholder="Registre observações sobre o progresso do aluno..."
                />
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
