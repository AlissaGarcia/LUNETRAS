import { useMemo, useState } from 'react';
import styles from './AdminTeachersPage.module.css';
import type { Teacher } from '../../services/teachers';
import type { ClassRoom } from './metrics';

interface AdminTeachersPageProps {
  userName: string;
  teachers: Teacher[];
  classes: ClassRoom[];
  onCreateTeacher: (payload: { nome: string; email: string }) => Promise<{ ok: boolean; senhaInicial?: string }>;
  onSetTeacherActive: (teacherId: string, shouldActivate: boolean) => Promise<boolean>;
  onAssignTeacherToClass: (classId: string, teacherId: string) => Promise<boolean>;
  onBackToDashboard: () => void;
  onGoToClasses: () => void;
  onGoToReports: () => void;
  onLogout: () => void | Promise<void>;
}

type FilterMode = 'ALL' | 'ACTIVE' | 'INACTIVE';

export function AdminTeachersPage({
  userName,
  teachers,
  classes,
  onCreateTeacher,
  onSetTeacherActive,
  onAssignTeacherToClass,
  onBackToDashboard,
  onGoToClasses,
  onGoToReports,
  onLogout,
}: AdminTeachersPageProps) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [hiddenTeacherIds, setHiddenTeacherIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [assignClassId, setAssignClassId] = useState('');
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [formError, setFormError] = useState('');
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const visibleTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teachers.filter((teacher) => {
      if (hiddenTeacherIds.includes(teacher.id)) {
        return false;
      }

      if (filterMode === 'ACTIVE' && !teacher.ativo) {
        return false;
      }

      if (filterMode === 'INACTIVE' && teacher.ativo) {
        return false;
      }

      if (!query) {
        return true;
      }

      return teacher.nome.toLowerCase().includes(query) || teacher.email.toLowerCase().includes(query);
    });
  }, [filterMode, hiddenTeacherIds, search, teachers]);

  async function handleCreateTeacher() {
    if (!newTeacherName.trim() || !newTeacherEmail.trim()) {
      setFormError('Preencha nome e e-mail para cadastrar o professor.');
      return;
    }

    setIsCreatingTeacher(true);
    setFormError('');

    const result = await onCreateTeacher({
      nome: newTeacherName.trim(),
      email: newTeacherEmail.trim(),
    });

    if (!result.ok) {
      setFormError('Não foi possível cadastrar o professor neste momento.');
      setIsCreatingTeacher(false);
      return;
    }

    setNewTeacherName('');
    setNewTeacherEmail('');
    setIsCreateModalOpen(false);
    setIsCreatingTeacher(false);

    setGeneratedPassword(result.senhaInicial ?? null);
    setCopyStatus('idle');
    setIsPasswordModalOpen(true);
  }

  async function handleCopyPassword() {
    if (!generatedPassword) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
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

  async function handleToggleTeacherStatus(teacher: Teacher) {
    const actionLabel = teacher.ativo ? 'desativar' : 'reativar';
    const confirmed = window.confirm(`Deseja ${actionLabel} o professor ${teacher.nome}?`);
    if (!confirmed) {
      return;
    }

    await onSetTeacherActive(teacher.id, !teacher.ativo);
  }

  function handleRemoveFromList(teacherId: string) {
    setHiddenTeacherIds((current) => [...current, teacherId]);
  }

  async function handleAssignTeacher() {
    if (!assignClassId || !assignTeacherId) {
      setFormError('Selecione a turma e o professor para vincular.');
      return;
    }

    setFormError('');
    const assigned = await onAssignTeacherToClass(assignClassId, assignTeacherId);

    if (!assigned) {
      setFormError('Não foi possível vincular professor à turma.');
      return;
    }

    setAssignClassId('');
    setAssignTeacherId('');
    setIsAssignModalOpen(false);
  }

  const isAnyModalOpen = isCreateModalOpen || isAssignModalOpen || isPasswordModalOpen;

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
          <button className={styles.active}>Professores</button>
          <button onClick={onGoToReports}>Relatórios</button>
        </nav>

        <button className={styles.logout} onClick={handleLogoutClick} disabled={isLoggingOut}>
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </button>
      </aside>

      <section className={styles.content}>
        <div className={isAnyModalOpen ? styles.contentBlur : undefined}>
          <header className={styles.header}>
            <h1>Professores</h1>
            <div className={styles.userBadge}>
              <span>Olá, {userName}</span>
              <small>Administrador(a)</small>
            </div>
          </header>

          <div className={styles.toolbar}>
            <div className={styles.searchRow}>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar professor por nome ou e-mail..."
              />
            </div>

            <select
              className={styles.filterSelect}
              value={filterMode}
              onChange={(event) => setFilterMode(event.target.value as FilterMode)}
            >
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Ativos</option>
              <option value="INACTIVE">Inativos</option>
            </select>

            <button type="button" className={styles.primaryAction} onClick={() => setIsCreateModalOpen(true)}>
              Adicionar professor
            </button>
            <button type="button" className={styles.secondaryAction} onClick={() => setIsAssignModalOpen(true)}>
              Vincular professor
            </button>
          </div>

          <section className={styles.tableShell}>
            <div className={styles.tableHeader}>
              <span>Nome</span>
              <span>E-mail</span>
              <span>Perfil</span>
              <span>Status</span>
              <span>Ações</span>
            </div>

            {visibleTeachers.map((teacher) => (
              <article key={teacher.id} className={styles.tableRow}>
                <strong>{teacher.nome}</strong>
                <span>{teacher.email}</span>
                <span className={styles.profileTag}>Professor(a)</span>
                <span className={teacher.ativo ? styles.statusActive : styles.statusInactive}>
                  {teacher.ativo ? 'Ativo' : 'Inativo'}
                </span>
                <div className={styles.actionGroup}>
                  <button
                    type="button"
                    className={teacher.ativo ? styles.dangerAction : styles.secondaryAction}
                    onClick={() => handleToggleTeacherStatus(teacher)}
                  >
                    {teacher.ativo ? 'Desativar' : 'Reativar'}
                  </button>
                  <button
                    type="button"
                    className={styles.ghostAction}
                    onClick={() => handleRemoveFromList(teacher.id)}
                  >
                    Remover da lista
                  </button>
                </div>
              </article>
            ))}

            {visibleTeachers.length === 0 ? <p className={styles.empty}>Nenhum professor cadastrado ainda.</p> : null}
          </section>
        </div>

        {isCreateModalOpen ? (
          <div className={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
            <article className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
              <header className={styles.modalHeader}>
                <h2>Cadastrar professor</h2>
                <button type="button" onClick={() => setIsCreateModalOpen(false)}>
                  X
                </button>
              </header>

              <div className={styles.modalGrid}>
                <label>
                  Nome
                  <input
                    value={newTeacherName}
                    onChange={(event) => setNewTeacherName(event.target.value)}
                    placeholder="Ex.: Carla Soares"
                  />
                </label>
                <label>
                  E-mail
                  <input
                    type="email"
                    value={newTeacherEmail}
                    onChange={(event) => setNewTeacherEmail(event.target.value)}
                    placeholder="carla@escola.com"
                  />
                </label>
                <p>A senha inicial será gerada automaticamente pelo sistema.</p>
              </div>

              {formError ? <p className={styles.formError}>{formError}</p> : null}

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.secondaryAction} onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.primaryAction}
                  onClick={handleCreateTeacher}
                  disabled={isCreatingTeacher}
                >
                  {isCreatingTeacher ? 'Cadastrando...' : 'Cadastrar professor'}
                </button>
              </footer>
            </article>
          </div>
        ) : null}

        {isAssignModalOpen ? (
          <div className={styles.modalOverlay} onClick={() => setIsAssignModalOpen(false)}>
            <article className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
              <header className={styles.modalHeader}>
                <h2>Vincular professor à turma</h2>
                <button type="button" onClick={() => setIsAssignModalOpen(false)}>
                  X
                </button>
              </header>

              <div className={styles.modalGrid}>
                <label>
                  Turma
                  <select value={assignClassId} onChange={(event) => setAssignClassId(event.target.value)}>
                    <option value="">Selecione uma turma</option>
                    {classes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Professor(a)
                  <select value={assignTeacherId} onChange={(event) => setAssignTeacherId(event.target.value)}>
                    <option value="">Selecione um professor</option>
                    {teachers
                      .filter((teacher) => teacher.ativo)
                      .map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.nome} ({teacher.email})
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              {formError ? <p className={styles.formError}>{formError}</p> : null}

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.secondaryAction} onClick={() => setIsAssignModalOpen(false)}>
                  Cancelar
                </button>
                <button type="button" className={styles.primaryAction} onClick={handleAssignTeacher}>
                  Vincular
                </button>
              </footer>
            </article>
          </div>
        ) : null}

        {isPasswordModalOpen ? (
          <div
            className={styles.modalOverlay}
            onClick={() => {
              setIsPasswordModalOpen(false);
              setGeneratedPassword(null);
              setCopyStatus('idle');
            }}
          >
            <article className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
              <header className={styles.modalHeader}>
                <h2>Senha inicial</h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setGeneratedPassword(null);
                    setCopyStatus('idle');
                  }}
                >
                  X
                </button>
              </header>

              <div className={styles.modalGrid}>
                {generatedPassword ? (
                  <>
                    <p>
                      Esta é a senha inicial gerada para o professor. Anote e envie para ele conseguir fazer o primeiro
                      login.
                    </p>
                    <label>
                      Senha gerada
                      <input value={generatedPassword} readOnly />
                    </label>
                    <div className={styles.actionGroup} style={{ justifyContent: 'flex-start' }}>
                      <button type="button" className={styles.primaryAction} onClick={handleCopyPassword}>
                        Copiar senha
                      </button>
                      {copyStatus === 'copied' ? <span className={styles.copyHint}>Copiado!</span> : null}
                      {copyStatus === 'error' ? (
                        <span className={styles.copyHint}>Não foi possível copiar. Copie manualmente.</span>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p>
                    Professor cadastrado, mas a API não retornou a senha inicial. Verifique o endpoint de cadastro de
                    professores no backend.
                  </p>
                )}
              </div>

              <footer className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.primaryAction}
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setGeneratedPassword(null);
                    setCopyStatus('idle');
                  }}
                >
                  Entendi
                </button>
              </footer>
            </article>
          </div>
        ) : null}
      </section>
    </main>
  );
}

