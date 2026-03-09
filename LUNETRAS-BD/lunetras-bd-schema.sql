-- LUNETRAS - Schema PostgreSQL alinhado ao domínio atual do backend

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255),
    perfil VARCHAR(30) NOT NULL CHECK (perfil IN ('ADMIN', 'PROFESSOR')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS turmas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ano INTEGER NOT NULL CHECK (ano BETWEEN 1 AND 5),
    professor_id BIGINT,
    CONSTRAINT fk_turma_professor
      FOREIGN KEY (professor_id)
      REFERENCES usuarios (id)
      ON DELETE SET NULL,
    CONSTRAINT uq_turma_nome_ano UNIQUE (nome, ano)
);

CREATE TABLE IF NOT EXISTS professor_turma (
    professor_id BIGINT NOT NULL,
    turma_id BIGINT NOT NULL,
    PRIMARY KEY (professor_id, turma_id),
    CONSTRAINT fk_professor_turma_professor
      FOREIGN KEY (professor_id)
      REFERENCES usuarios (id)
      ON DELETE CASCADE,
    CONSTRAINT fk_professor_turma_turma
      FOREIGN KEY (turma_id)
      REFERENCES turmas (id)
      ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alunos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    data_nascimento DATE,
    turma_id BIGINT,
    CONSTRAINT fk_aluno_turma
      FOREIGN KEY (turma_id)
      REFERENCES turmas (id)
      ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS avaliacoes_psicogeneticas (
    id BIGSERIAL PRIMARY KEY,
    bimestre INTEGER NOT NULL CHECK (bimestre BETWEEN 1 AND 4),
    nivel VARCHAR(60) NOT NULL CHECK (
      nivel IN (
        'ICONICA',
        'GARATUJA',
        'PRE_SILABICO',
        'SILABICO_SEM_VALOR_SONORO',
        'SILABICO_COM_VALOR_SONORO',
        'ALFABETICO',
        'ORTOGRAFICO'
      )
    ),
    observacoes TEXT,
    data_avaliacao DATE NOT NULL,
    periodo_letivo INTEGER NOT NULL,
    aluno_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    CONSTRAINT fk_avaliacao_aluno
      FOREIGN KEY (aluno_id)
      REFERENCES alunos (id)
      ON DELETE CASCADE,
    CONSTRAINT fk_avaliacao_professor
      FOREIGN KEY (professor_id)
      REFERENCES usuarios (id)
      ON DELETE RESTRICT,
    -- regra de negócio mais próxima da implementação atual (1 avaliação por aluno+bimestre)
    CONSTRAINT uq_avaliacao_aluno_bimestre UNIQUE (aluno_id, bimestre)
);

CREATE INDEX IF NOT EXISTS idx_turmas_professor_id ON turmas (professor_id);
CREATE INDEX IF NOT EXISTS idx_alunos_turma_id ON alunos (turma_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_aluno_id ON avaliacoes_psicogeneticas (aluno_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_professor_id ON avaliacoes_psicogeneticas (professor_id);
