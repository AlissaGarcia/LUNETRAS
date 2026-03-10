# 📋 Análise Completa: Integração Backend-Frontend LUNETRAS

**Data da Análise:** 10 de Março de 2026  
**Status:** ⚠️ Integração Incompleta - Modo Fallback Ativado

---

## 📊 Resumo Executivo

O projeto LUNETRAS possui uma arquitetura moderna (Spring Boot + React) com comunicação via API REST já estruturada. No entanto, **a integração está parcialmente desabilitada** através da flag `TEMP_FRONT_ONLY_MODE = true` no `App.tsx`. Existem **desalinhamentos significativos** entre os contratos de API esperados e implementados, e alguns endpoints faltam implementação no backend.

**Prioridade:** 🔴 ALTA - Resolver antes de produção

---

## 🔍 Estado Atual da Infraestrutura

### Backend (Java + Spring Boot)
```
LUNETRAS-BACK/
├── Controllers Implementados: 6/6 endpoints base
│   ├── AuthController (login/logout)
│   ├── AlunoController (CRUD alunos)
│   ├── TurmaController (CRUD turmas)
│   ├── UsuarioController (gerenciar professores)
│   ├── AvaliacaoPsicogeneticaController (criar avaliações)
│   └── RelatorioController (gerar relatórios)
├── Configuração: SecurityConfig com CORS habilitado
├── Banco: PostgreSQL 16-Alpine
└── Autenticação: Form-based auth + Session (NÃO JWT)
```

### Frontend (React + TypeScript)
```
LUNETRAS_Front/
├── Serviços de API: 3 arquivos
│   ├── api.ts (utilitário base - implementado ✅)
│   ├── auth.ts (login/logout - implementado ✅)
│   ├── classes.ts (turmas/alunos - parcial com fallbacks ⚠️)
│   └── teachers.ts (professores - parcial ⚠️)
├── Modo Fallback: ATIVADO (linha 29 do App.tsx)
└── Autenticação: Session + LocalStorage
```

---

## ⚠️ PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **TEMP_FRONT_ONLY_MODE = true** 🔴 CRÍTICO
**Arquivo:** `LUNETRAS_Front/src/App.tsx:29`

```typescript
// TODO: Trocar para false quando backend estiver estavel em execucao local.
const TEMP_FRONT_ONLY_MODE = true;
```

**Impacto:**
- Todas as chamadas ao backend são ignoradas
- Dados carregados de mock/fallback apenas
- Funções como criar turma/aluno não persistem no banco
- Relatórios e avaliações não sincronizam

**Ação Necessária:** Mudar para `false` APÓS resolver os itens abaixo ⬇️

---

### 2. **Desalinhamento de Contratos de API** 📋

#### 2.1 - Classes (Turmas)

**Frontend espera:**
```typescript
interface ClassRoom {
  id: string;
  nome: string;
  professor: string;
  totalAlunos: number;
  alunosAlfabeticos: number;
  pendencias: number;
  ativa: boolean;
}
```

**Backend retorna (Incompleto):**
```java
// TurmaResponse não existe - retorna Turma diretamente
// Faltam campos: alunosAlfabeticos, pendencias, ativa
```

**Status:** ❌ Contrato não alinhado
**Solução:** Criar `TurmaResponse` DTO com todos os campos

#### 2.2 - Alunos

**Frontend envia:**
```typescript
{
  nome: string;
  dataNascimento: string; // formato: YYYY-MM-DD
  nivel: LiteracyStage;   // enum com 8 valores
  status: StudentStatus;  // SEM_AVALIACAO | AVALIADO | REAVALIAR
  observacoes?: string;
}
```

**Backend espera (Parcial):**
```java
// AlunoRequest não menciona 'status' ou 'observacoes'
// Faltam validações para alguns campos
```

**Status:** ⚠️ Parcialmente alinhado
**Solução:** Atualizar `AlunoRequest` DTO

#### 2.3 - Professores

**Frontend espera:**
```typescript
// Endpoints esperados:
GET /admin/usuarios
GET /admin/usuarios/{id}
POST /admin/usuarios/professores
PATCH /admin/usuarios/{id}/ativar
PATCH /admin/usuarios/{id}/desativar
```

**Backend implementado:**
```java
UsuarioController:
✅ GET /admin/usuarios (listar)
✅ POST /admin/usuarios/professores (cadastrar)
✅ PATCH /{id}/desativar (desativar)
✅ PATCH /{id}/ativar (ativar)
❌ PUT /{id} (editar email) - frontend não usa
```

**Status:** ✅ Bem alinhado

---

### 3. **Endpoints Implementados x Utilizados** 🔗

#### Autenticação
| Endpoint | Método | Backend | Frontend | Status |
|----------|--------|---------|----------|--------|
| `/auth/login` | POST | ✅ | ✅ | ✅ Funciona |
| `/auth/me` | GET | ✅ | ✅ | ✅ Funciona |
| `/auth/logout` | POST | ✅ | ✅ | ✅ Funciona |

#### Turmas
| Endpoint | Método | Backend | Frontend | Status |
|----------|--------|---------|----------|--------|
| `/turmas` | GET | ✅ | ✅ | ⚠️ Sem dados derivados |
| `/turmas` | POST | ✅ | ✅ | ⚠️ Contrato incompleto |
| `/turmas/{id}` | GET | ✅ | ❌ | ❌ Não chamado |
| `/turmas/{id}` | DELETE | ✅ | ✅ | ✅ Implementado |
| `/turmas/{turmaId}/professor/{professorId}` | PATCH | ✅ | ✅ | ✅ Implementado |
| `/turmas/{turmaId}/alunos` | GET | ❌ | ✅ | ⚠️ Fallback para `/alunos?turmaId=` |

#### Alunos
| Endpoint | Método | Backend | Frontend | Status |
|----------|--------|---------|----------|--------|
| `/alunos` | GET | ✅ | ✅ | ✅ Implementado |
| `/alunos?turmaId={id}` | GET | ✅ | ✅ | ✅ Implementado |
| `/alunos` | POST | ✅ | ✅ | ⚠️ Contrato incompleto |
| `/alunos/{id}` | GET | ✅ | ❌ | ❌ Não chamado |
| `/alunos/{id}` | PUT | ✅ | ✅ | ✅ Atualiza aluno |
| `/alunos/{id}` | DELETE | ✅ | ✅ | ✅ Implementado |

#### Professores
| Endpoint | Método | Backend | Frontend | Status |
|----------|--------|---------|----------|--------|
| `/admin/usuarios` | GET | ✅ | ✅ | ✅ Implementado |
| `/admin/usuarios/professores` | POST | ✅ | ✅ | ✅ Implementado |
| `/admin/usuarios/{id}/ativar` | PATCH | ✅ | ✅ | ✅ Implementado |
| `/admin/usuarios/{id}/desativar` | PATCH | ✅ | ✅ | ✅ Implementado |

#### Avaliações
| Endpoint | Método | Backend | Frontend | Status |
|----------|--------|---------|----------|--------|
| `/avaliacoes` | POST | ✅ | ❌ | ❌ Não integrado |
| `/avaliacoes/{id}` | GET | ❌ | ❌ | ❌ Não existe |

#### Relatórios
| Endpoint | Método | Backend | Frontend | Status |
|----------|--------|---------|----------|--------|
| `/relatorios/turma/{turmaId}/bimestre/{bimestre}/periodo/{periodoLetivo}` | GET | ✅ | ❌ | ❌ Não integrado |
| `/relatorios/turma/{turmaId}/bimestre/{bimestre}/periodo/{periodoLetivo}/niveis` | GET | ✅ | ❌ | ❌ Não integrado |

---

## 🛠️ PENDÊNCIAS DE IMPLEMENTAÇÃO

### Frontend

#### 1. Integração de Avaliações Psicogenéticas
**Local:** `LUNETRAS_Front/src/services/classes.ts`
**Falta:**
```typescript
// Não existe função para criar avaliações
export async function createEvaluation(
  studentId: string,
  payload: {
    nivel: LiteracyStage;
    bimestre: 'B1' | 'B2' | 'B3' | 'B4';
    dataAvaliacao: string;
    observacoes: string;
  }
): Promise<StudentEvaluation>
```

#### 2. Integração de Relatórios
**Local:** `LUNETRAS_Front/src/pages/admin/AdminReportsPage.tsx`
**Falta:**
```typescript
// Não faz chamadas para /relatorios
// Precisa carregar dados reais do backend ao invés de mockData
// Precisa exibir estatísticas por nível
```

#### 3. Sincronização de Avaliações Professores
**Local:** `LUNETRAS_Front/src/pages/professor/`
**Falta:**
```typescript
// Falta integração entre formulário de avaliação (AdminClassStudentsPage)
// e persistência no backend via POST /avaliacoes
```

### Backend

#### 1. DTOs Incompletos
**Arquivo:** `LUNETRAS-BACK/src/main/java/com/lunetras/dto/`

**Faltam:**
- `TurmaResponse` - retornar objeto estruturado (não apenas `Turma`)
- `AvaliacaoPsicogeneticaResponse` - DTO para avaliar
- `RelatorioResponse` - estrutura para relatórios

**Exemplo:**
```java
// Falta este DTO
public class TurmaResponse {
    private Long id;
    private String nome;
    private String professor;
    private Integer totalAlunos;
    private Integer alunosAlfabeticos;
    private Integer pendencias;
    private Boolean ativa;
    // getters/setters
}
```

#### 2. Endpoint Faltando: GET `/turmas/{turmaId}/alunos`
**Local:** `TurmaController`
**Descrição:** Listar alunos de uma turma específica
**Implementação:**
```java
@GetMapping("/{turmaId}/alunos")
public ResponseEntity<List<AlunoResponse>> listarAlunosPorTurma(
    @PathVariable Long turmaId) {
    return ResponseEntity.ok(alunoService.listarPorTurma(turmaId));
}
```

#### 3. Falta Implementação: Buscar Avaliação por ID
**Endpoints desejados:**
```
GET /avaliacoes/{id}
GET /avaliacoes/aluno/{alunoId}
GET /avaliacoes/turma/{turmaId}/bimestre/{bimestre}
```

#### 4. Autenticação - Considerar JWT
**Atual:** Form-based + Session  
**Problema:** Não é ideal para SPA React  
**Recomendação:** Implementar JWT com refresh tokens

---

## 🔐 Segurança

### ✅ Implementado
- CORS configurado dinâmico (via `APP_CORS_ALLOWED_ORIGINS`)
- Autenticação requerida para maioria dos endpoints
- Autorização baseada em `@PreAuthorize` no UsuarioController
- CSRF desabilitado (apropriado para SPA)

### ⚠️ Recomendações
- Implementar JWT ao invés de session
- Adicionar rate limiting em `/auth/login`
- Validar e sanitizar inputs em todos os DTOs
- Implementar versionamento de API (`/api/v1/`)

---

## 📱 Como as Funcionalidades Estão Alinhadas

### Caso de Uso: Professor Avalia Aluno

```
🔵 FLUXO ESPERADO vs REALIDADE

1. Professor faz login
   ✅ Backend: POST /auth/login → retorna session
   ✅ Frontend: Armazena em localStorage

2. Professor carrega lista de turmas
   ✅ Backend: GET /turmas → retorna lista
   ⚠️ Frontend: Atualmente carrega dados de mockData (TEMP_FRONT_ONLY_MODE)

3. Professor seleciona turma
   ✅ Frontend: GET /turmas/{id}/alunos seria ideal
   ⚠️ Backend: Endpoint não está em TurmaController
   ❌ Workaround: Frontend usa GET /alunos?turmaId={id}

4. Professor vê aluno e clica "Avaliar"
   ❌ Backend: POST /avaliacoes não tem serialização completa
   ❌ Frontend: Não integrado com backend
   ☠️ Resultado: Dados perdidos (não persiste no BD)

5. Professor salva avaliação
   ❌ Não persiste no banco
   ❌ Relatórios não refletem dados reais
```

### Caso de Uso: Admin Cria Professor

```
🔵 FLUXO ESPERADO vs REALIDADE

1. Admin clica "Novo Professor"
   ✅ Frontend: Modal de criação abre

2. Admin preenche nome + email
   ✅ Frontend: Validação em formulário

3. Admin confirma
   ✅ Backend: POST /admin/usuarios/professores → gera senha aleatória
   ✅ Frontend: Recebe senha via resposta

4. Admin copia senha para compartilhar
   ✅ Frontend: Botão de cópia funciona

5. Professor usa nova conta
   ✅ Autenticação funciona
   ❌ Se TEMP_FRONT_ONLY_MODE: dados locais apenas
```

---

## 🎯 Plano de Ação Priorizado

### 🔴 Crítico (Bloqueia Produção)

1. **[ ] Desabilitar TEMP_FRONT_ONLY_MODE**
   - Arquivo: `LUNETRAS_Front/src/App.tsx:29`
   - Mudar para: `const TEMP_FRONT_ONLY_MODE = false;`
   - **Risco:** Pode quebrar funcionalidades até itens abaixo serem resolvidos
   - **Pré-requisito:** Itens 2-5 resolvidos

2. **[ ] Criar DTOs Faltando (Backend)**
   - `TurmaResponse.java`
   - `AvaliacaoPsicogeneticaResponse.java`
   - `RelatorioResponse.java`
   - **Tempo Estimado:** 30 minutos
   - **Bloqueador:** Contratos de API

3. **[ ] Adicionar Endpoint GET `/turmas/{turmaId}/alunos`**
   - Arquivo: `TurmaController.java`
   - **Tempo Estimado:** 15 minutos
   - **Razão:** Frontend tenta usar este endpoint

4. **[ ] Integrar Frontend para Avaliações**
   - Arquivo: `LUNETRAS_Front/src/services/classes.ts`
   - Adicionar funções: `createEvaluation()`, `listEvaluations()`
   - **Tempo Estimado:** 45 minutos
   - **Bloqueador:** Sistema de avaliações

### 🟡 Alto (Quebra Funcionalidades Importantes)

5. **[ ] Integrar Relatórios (Frontend)**
   - Arquivo: `AdminReportsPage.tsx`
   - Carregar dados reais via GET `/relatorios/...`
   - **Tempo Estimado:** 60 minutos
   - **Impacto:** Feature de relatórios

6. **[ ] Alterar de Session para JWT (Backend)**
   - Adicionar dependency: `jjwt`
   - Criar `JwtTokenProvider.java`
   - Atualizar `SecurityConfig.java`
   - **Tempo Estimado:** 90 minutos
   - **Razão:** Melhor para SPA React

7. **[ ] Implementar GET `/avaliacoes/{id}` e filtros**
   - Arquivo: `AvaliacaoPsicogeneticaController.java`
   - **Tempo Estimado:** 30 minutos

### 🟢 Médio (Melhorias)

8. **[ ] Adicionar validações consistentes**
   - Timestamps em avaliações
   - Enum para bimestres
   - **Tempo Estimado:** 60 minutos

9. **[ ] Rate limiting em `/auth/login`**
   - Usar Spring Bucket4j
   - **Tempo Estimado:** 45 minutos

10. **[ ] Versionamento de API**
    - Adicionar `/api/v1/` prefixo
    - **Tempo Estimado:** 120 minutos

---

## 📋 Checklist de Teste

- [ ] Testar login com credenciais corretas
- [ ] Testar login com credenciais incorretas
- [ ] Criar turma e verificar persistência no BD
- [ ] Adicionar aluno à turma
- [ ] Avaliar aluno (criar avaliação)
- [ ] Consultar relatório da turma
- [ ] Ativar/desativar professor
- [ ] Assinar professor a turma
- [ ] Fazer logout
- [ ] Verificar CORS em multiplos navegadores

---

## 📞 Perguntas para Esclarecimento

1. **JWT vs Session:** Qual preferência para o projeto?
2. **Autenticação 2FA:** Será necessária?
3. **Dados de Teste:** Qual volume esperado para testes?
4. **Histórico de Avaliações:** Alunos podem ter avaliações em múltiplas turmas?
5. **Relatórios:** Necessário exportar para PDF?

---

## 📚 Referências de Código

**Backend Controllers:**
- [AuthController](LUNETRAS-BACK/src/main/java/com/lunetras/controller/AuthController.java)
- [TurmaController](LUNETRAS-BACK/src/main/java/com/lunetras/controller/TurmaController.java)
- [AlunoController](LUNETRAS-BACK/src/main/java/com/lunetras/controller/AlunoController.java)
- [UsuarioController](LUNETRAS-BACK/src/main/java/com/lunetras/controller/UsuarioController.java)

**Frontend Services:**
- [api.ts](LUNETRAS_Front/src/services/api.ts) - Utilidades HTTP
- [auth.ts](LUNETRAS_Front/src/services/auth.ts) - Autenticação
- [classes.ts](LUNETRAS_Front/src/services/classes.ts) - Turmas e Alunos
- [teachers.ts](LUNETRAS_Front/src/services/teachers.ts) - Professores

**Configuração:**
- [SecurityConfig](LUNETRAS-BACK/src/main/java/com/lunetras/config/SecurityConfig.java)
- [docker-compose.yml](docker-compose.yml)
- [env.ts](LUNETRAS_Front/src/config/env.ts)

---

**Última Atualização:** 10 de Março de 2026  
**Próxima Revisão:** Após implementação dos itens críticos
