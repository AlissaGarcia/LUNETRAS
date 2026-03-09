-- Seeds iniciais para ambiente local (idempotente)
-- senha em BCrypt para "admin123"
INSERT INTO usuarios (nome, email, senha, perfil, ativo)
VALUES (
  'Administrador LUNETRAS',
  'admin@lunetras.local',
  '$2a$10$Q8hC6Q0QhQf6s8pNf7KJ0OS8YxM7f7xwTzQhcsKtB9Q3l4J8kT6xm',
  'ADMIN',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- senha em BCrypt para "prof123"
INSERT INTO usuarios (nome, email, senha, perfil, ativo)
VALUES (
  'Professor(a) Demo',
  'professor@lunetras.local',
  '$2a$10$Q8hC6Q0QhQf6s8pNf7KJ0OS8YxM7f7xwTzQhcsKtB9Q3l4J8kT6xm',
  'PROFESSOR',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO turmas (nome, ano, professor_id)
SELECT '1º Ano A', 1, u.id
FROM usuarios u
WHERE u.email = 'professor@lunetras.local'
ON CONFLICT (nome, ano) DO NOTHING;

INSERT INTO alunos (nome, email, data_nascimento, turma_id)
SELECT 'Aluno Demo', 'aluno.demo@lunetras.local', '2018-03-15', t.id
FROM turmas t
WHERE t.nome = '1º Ano A' AND t.ano = 1
ON CONFLICT (email) DO NOTHING;
