# 🔧 Guia Prático: Corrigindo a Integração

Este documento fornece **código pronto para usar** para resolver os principais problemas identificados.

---

## 1️⃣ Criar DTOs Faltando (Backend)

### Problema
Os endpoints retornam entidades diretas em vez de DTOs estruturados, causando desalinhamento com o frontend.

### Solução

#### 1.1 - TurmaResponse.java
Criar arquivo: `LUNETRAS-BACK/src/main/java/com/lunetras/dto/TurmaResponse.java`

```java
package com.lunetras.dto;

import java.time.LocalDateTime;

public class TurmaResponse {
    private Long id;
    private String nome;
    private String professor;
    private Integer totalAlunos;
    private Integer alunosAlfabeticos;
    private Integer pendencias;
    private Boolean ativa;
    private String turno;
    private Integer ano;
    private LocalDateTime criadoEm;

    public TurmaResponse() {}

    public TurmaResponse(Long id, String nome, String professor, String turno, Integer ano) {
        this.id = id;
        this.nome = nome;
        this.professor = professor;
        this.turno = turno;
        this.ano = ano;
        this.totalAlunos = 0;
        this.alunosAlfabeticos = 0;
        this.pendencias = 0;
        this.ativa = true;
    }

    // Getters
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getProfessor() { return professor; }
    public Integer getTotalAlunos() { return totalAlunos; }
    public Integer getAlunosAlfabeticos() { return alunosAlfabeticos; }
    public Integer getPendencias() { return pendencias; }
    public Boolean getAtiva() { return ativa; }
    public String getTurno() { return turno; }
    public Integer getAno() { return ano; }
    public LocalDateTime getCriadoEm() { return criadoEm; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setNome(String nome) { this.nome = nome; }
    public void setProfessor(String professor) { this.professor = professor; }
    public void setTotalAlunos(Integer totalAlunos) { this.totalAlunos = totalAlunos; }
    public void setAlunosAlfabeticos(Integer alunosAlfabeticos) { this.alunosAlfabeticos = alunosAlfabeticos; }
    public void setPendencias(Integer pendencias) { this.pendencias = pendencias; }
    public void setAtiva(Boolean ativa) { this.ativa = ativa; }
    public void setTurno(String turno) { this.turno = turno; }
    public void setAno(Integer ano) { this.ano = ano; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
```

#### 1.2 - AvaliacaoPsicogeneticaResponse.java
Criar arquivo: `LUNETRAS-BACK/src/main/java/com/lunetras/dto/AvaliacaoPsicogeneticaResponse.java`

```java
package com.lunetras.dto;

import java.time.LocalDate;

public class AvaliacaoPsicogeneticaResponse {
    private Long id;
    private Long alunoId;
    private String aluno;
    private Long turmaId;
    private String turma;
    private String nivel;
    private String status;
    private String observacoes;
    private LocalDate dataAvaliacao;
    private String bimestre;
    private String professorNome;

    public AvaliacaoPsicogeneticaResponse() {}

    // Getters
    public Long getId() { return id; }
    public Long getAlunoId() { return alunoId; }
    public String getAluno() { return aluno; }
    public Long getTurmaId() { return turmaId; }
    public String getTurma() { return turma; }
    public String getNivel() { return nivel; }
    public String getStatus() { return status; }
    public String getObservacoes() { return observacoes; }
    public LocalDate getDataAvaliacao() { return dataAvaliacao; }
    public String getBimestre() { return bimestre; }
    public String getProfessorNome() { return professorNome; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setAlunoId(Long alunoId) { this.alunoId = alunoId; }
    public void setAluno(String aluno) { this.aluno = aluno; }
    public void setTurmaId(Long turmaId) { this.turmaId = turmaId; }
    public void setTurma(String turma) { this.turma = turma; }
    public void setNivel(String nivel) { this.nivel = nivel; }
    public void setStatus(String status) { this.status = status; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public void setDataAvaliacao(LocalDate dataAvaliacao) { this.dataAvaliacao = dataAvaliacao; }
    public void setBimestre(String bimestre) { this.bimestre = bimestre; }
    public void setProfessorNome(String professorNome) { this.professorNome = professorNome; }
}
```

#### 1.3 - EstatisticasResponse.java
Criar arquivo: `LUNETRAS-BACK/src/main/java/com/lunetras/dto/EstatisticasResponse.java`

```java
package com.lunetras.dto;

import java.util.List;
import java.util.Map;

public class EstatisticasResponse {
    private Long turmaId;
    private String nameturma;
    private Integer bimestre;
    private Integer periodoLetivo;
    private Integer totalAlunos;
    private Map<String, Integer> nivelParaQuantidade;
    private List<EstatisticaNivel> estatisticas;

    public EstatisticasResponse() {}

    // Getters
    public Long getTurmaId() { return turmaId; }
    public String getNomeTurma() { return nameturma; }
    public Integer getBimestre() { return bimestre; }
    public Integer getPeriodoLetivo() { return periodoLetivo; }
    public Integer getTotalAlunos() { return totalAlunos; }
    public Map<String, Integer> getNivelParaQuantidade() { return nivelParaQuantidade; }
    public List<EstatisticaNivel> getEstatisticas() { return estatisticas; }

    // Setters
    public void setTurmaId(Long turmaId) { this.turmaId = turmaId; }
    public void setNomeTurma(String nome) { this.nameturma = nome; }
    public void setBimestre(Integer bimestre) { this.bimestre = bimestre; }
    public void setPeriodoLetivo(Integer periodoLetivo) { this.periodoLetivo = periodoLetivo; }
    public void setTotalAlunos(Integer totalAlunos) { this.totalAlunos = totalAlunos; }
    public void setNivelParaQuantidade(Map<String, Integer> nivelParaQuantidade) { 
        this.nivelParaQuantidade = nivelParaQuantidade; 
    }
    public void setEstatisticas(List<EstatisticaNivel> estatisticas) { this.estatisticas = estatisticas; }
}
```

---

## 2️⃣ Adicionar Endpoint em TurmaController (Backend)

### Problema
Frontend tenta acessar `GET /turmas/{turmaId}/alunos` mas não existe

### Solução

Editar: `LUNETRAS-BACK/src/main/java/com/lunetras/controller/TurmaController.java`

Adicionar este método após o método `vincularProfessor()`:

```java
@GetMapping("/{turmaId}/alunos")
public ResponseEntity<List<AlunoResponse>> listarAlunosDaTurma(
        @PathVariable Long turmaId) {
    
    List<AlunoResponse> alunos = alunoService.listarPorTurma(turmaId);
    return ResponseEntity.ok(alunos);
}
```

---

## 3️⃣ Integrar Avaliações (Frontend)

### Problema
Sistema de avaliações não persiste no backend

### Solução

Editar: `LUNETRAS_Front/src/services/classes.ts`

Adicionar ao final do arquivo:

```typescript
export async function createEvaluation(
  payload: {
    alunoId: number;
    estado: string;
    nivel: LiteracyStage;
    observacoes?: string;
    dataAvaliacao: string;
    bimestre: 'B1' | 'B2' | 'B3' | 'B4';
  }
): Promise<{ id: string }> {
  const response = await requestWithFallback<{ id: number | string }>(['/avaliacoes'], {
    method: 'POST',
    body: {
      alunoId: payload.alunoId,
      estado: payload.estado,
      nivel: payload.nivel,
      observacoes: payload.observacoes ?? '',
      dataAvaliacao: payload.dataAvaliacao,
      bimestre: payload.bimestre,
    },
  });

  return {
    id: String(response.id ?? Date.now()),
  };
}

export async function listEvaluationsByStudent(studentId: string): Promise<Array<{
  id: string;
  nivel: LiteracyStage;
  bimestre: string;
  dataAvaliacao: string;
  observacoes: string;
}>> {
  try {
    const payload = await requestWithFallback<Array<{
      id?: number | string;
      nivel?: LiteracyStage;
      bimestre?: string;
      dataAvaliacao?: string;
      observacoes?: string;
    }>>([`/avaliacoes/aluno/${studentId}`], {
      method: 'GET',
    });

    const rawEvaluations = Array.isArray(payload) ? payload : [];
    
    return rawEvaluations.map((item, index) => ({
      id: String(item.id ?? `eval-${studentId}-${index}`),
      nivel: item.nivel ?? 'SEM_DADOS',
      bimestre: item.bimestre ?? 'B1',
      dataAvaliacao: item.dataAvaliacao ?? new Date().toISOString().split('T')[0],
      observacoes: item.observacoes ?? '',
    }));
  } catch {
    return [];
  }
}
```

---

## 4️⃣ Adicionar Endpoints de Avaliações (Backend)

### Problema
`AvaliacaoPsicogeneticaController` tem apenas POST, falta GET

### Solução

Editar: `LUNETRAS-BACK/src/main/java/com/lunetras/controller/AvaliacaoPsicogeneticaController.java`

Adicionar imports:
```java
import java.util.List;
```

Adicionar estes métodos:

```java
@GetMapping("/{id}")
public ResponseEntity<AvaliacaoPsicogeneticaResponse> buscarPorId(
        @PathVariable Long id) {
    
    AvaliacaoPsicogenetica avaliacao = avaliacaoService.buscarPorId(id);
    AvaliacaoPsicogeneticaResponse response = new AvaliacaoPsicogeneticaResponse();
    // Mapear campos
    response.setId(avaliacao.getId());
    // ... etc
    
    return ResponseEntity.ok(response);
}

@GetMapping("/aluno/{alunoId}")
public ResponseEntity<List<AvaliacaoPsicogeneticaResponse>> listarPorAluno(
        @PathVariable Long alunoId) {
    
    List<AvaliacaoPsicogenetica> avaliacoes = avaliacaoService.listarPorAluno(alunoId);
    // Mapear para response
    List<AvaliacaoPsicogeneticaResponse> responses = avaliacoes.stream()
        .map(this::toResponse)
        .toList();
    
    return ResponseEntity.ok(responses);
}

private AvaliacaoPsicogeneticaResponse toResponse(AvaliacaoPsicogenetica avaliacao) {
    AvaliacaoPsicogeneticaResponse response = new AvaliacaoPsicogeneticaResponse();
    response.setId(avaliacao.getId());
    // ... mapear todos os campos
    return response;
}
```

---

## 5️⃣ Habilitar Integração com Backend (Frontend)

### Problema
`TEMP_FRONT_ONLY_MODE = true` desabilita todas as requisições

### Solução

Editar: `LUNETRAS_Front/src/App.tsx`

Na linha 29, alterar:
```typescript
// ANTES
const TEMP_FRONT_ONLY_MODE = true;

// DEPOIS
const TEMP_FRONT_ONLY_MODE = false;
```

**⚠️ AVISO:** Fazer apenas após implementar itens 1-4 acima!

---

## 6️⃣ Integrar Relatórios (Frontend - Opcional)

### Problema
Página de relatórios não faz requisições ao backend

### Solução

Editar: `LUNETRAS_Front/src/services/classes.ts`

Adicionar:

```typescript
export async function fetchReportByTurmaAndBimestre(
  turmaId: string,
  bimestre: number,
  periodoLetivo: number = 2026,
): Promise<Array<{
  id: string;
  alunoNome: string;
  nivel: LiteracyStage;
  status: string;
  observacoes: string;
}>> {
  try {
    const payload = await requestWithFallback<Array<{
      id?: number | string;
      aluno?: { nome?: string };
      alunoNome?: string;
      nivel?: LiteracyStage;
      status?: string;
      observacoes?: string;
    }>>([
      `/relatorios/turma/${turmaId}/bimestre/${bimestre}/periodo/${periodoLetivo}`,
    ], {
      method: 'GET',
    });

    const rawData = Array.isArray(payload) ? payload : [];
    
    return rawData.map((item, index) => ({
      id: String(item.id ?? index),
      alunoNome: item.alunoNome ?? item.aluno?.nome ?? 'Aluno',
      nivel: item.nivel ?? 'SEM_DADOS',
      status: item.status ?? 'SEM_AVALIACAO',
      observacoes: item.observacoes ?? '',
    }));
  } catch {
    return [];
  }
}

export async function fetchRelatorioEstatisticas(
  turmaId: string,
  bimestre: number,
  periodoLetivo: number = 2026,
): Promise<Array<{
  nivel: LiteracyStage;
  quantidade: number;
  percentual: number;
}>> {
  try {
    const payload = await requestWithFallback<Array<{
      nivel?: LiteracyStage;
      quantidade?: number;
      percentual?: number;
    }>>([
      `/relatorios/turma/${turmaId}/bimestre/${bimestre}/periodo/${periodoLetivo}/niveis`,
    ], {
      method: 'GET',
    });

    const rawData = Array.isArray(payload) ? payload : [];
    
    return rawData.map((item) => ({
      nivel: item.nivel ?? 'SEM_DADOS',
      quantidade: item.quantidade ?? 0,
      percentual: item.percentual ?? 0,
    }));
  } catch {
    return [];
  }
}
```

---

## 📝 Adicionar DTOs de Request (Backend)

### AlunoRequest.java - Atualizar

Editar: `LUNETRAS-BACK/src/main/java/com/lunetras/dto/AlunoRequest.java`

Adicionar campos faltando:

```java
package com.lunetras.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AlunoRequest {

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotNull(message = "Data de nascimento é obrigatória")
    private LocalDate dataNascimento;
    
    private String nivel; // SEM_DADOS, ICONICA, etc
    
    private String status; // SEM_AVALIACAO, AVALIADO, REAVALIAR
    
    private String observacoes;

    @NotNull(message = "ID da turma é obrigatório")
    private Long turmaId;

    // Getters Setters
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public Long getTurmaId() { return turmaId; }
    public void setTurmaId(Long turmaId) { this.turmaId = turmaId; }
}
```

---

## 🧪 Testar a Integração

### 1. Verificar se o backend está rodando
```bash
curl -i http://localhost:8080/turmas
```

Esperado: Resposta 200 ou 401 (se autenticado)

### 2. Testar login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=carla.prof@escola.com&password=123456" \
  -c cookies.txt

# Verificar session
curl http://localhost:8080/auth/me -b cookies.txt
```

### 3. Testar create turma
```bash
curl -X POST http://localhost:8080/turmas \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "nome": "Turma Teste",
    "turno": "MANHA",
    "ano": 1
  }'
```

### 4. No frontend, abrir console e testar:
```typescript
// Com TEMP_FRONT_ONLY_MODE = false
import { listClasses } from './services/classes.ts';
await listClasses(); // Deve chamar backend
```

---

## ⚡ Checklist de Implementação

- [ ] 1. Criar `TurmaResponse.java`
- [ ] 2. Criar `AvaliacaoPsicogeneticaResponse.java`
- [ ] 3. Criar `EstatisticasResponse.java`
- [ ] 4. Adicionar endpoint `GET /turmas/{turmaId}/alunos` em TurmaController
- [ ] 5. Adicionar funções de avaliação em `classes.ts`
- [ ] 6. Adicionar endpoints GET em AvaliacaoPsicogeneticaController
- [ ] 7. Testar cada endpoint com curl/Postman
- [ ] 8. Testar frontend com backend
- [ ] 9. Mudar `TEMP_FRONT_ONLY_MODE = false`
- [ ] 10. Testar fluxo completo: login → criar turma → adicionar aluno → avaliar

---

**Tempo Estimado Total:** 3-4 horas  
**Dificuldade:** ⭐⭐ Intermediário
