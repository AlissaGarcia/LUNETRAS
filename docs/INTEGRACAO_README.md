# 📌 Documentação de Integração Backend-Frontend

Você encontrará aqui a análise completa da integração do projeto LUNETRAS e um guia prático para resolver os problemas identificados.

## 📚 Documentos Disponíveis

### 1. **ANALISE_INTEGRACAO_BACKEND_FRONTEND.md** 📊
   **Para:** Entender o status geral do projeto
   
   - Visão geral da arquitetura
   - Problemas críticos identificados
   - Desalinhamento de contratos de API
   - Endpoints implementados vs utilizados
   - Segurança (✅ implementada, ⚠️ recomendações)
   - Plano de ação priorizado
   - Perguntas para esclarecimento
   
   **Tempo de leitura:** 15-20 minutos

---

### 2. **GUIA_PRATICO_IMPLEMENTACAO.md** 🔧
   **Para:** Implementar as correções necessárias
   
   - Código pronto para copiar-colar
   - DTOs que faltam criar
   - Endpoints que faltam adicionar
   - Funções frontend que faltam
   - Instruções passo a passo
   - Testes de validação
   
   **Tempo de implementação:** 3-4 horas

---

### 3. **MAPA_VISUAL_INTEGRACAO.md** 🗺️
   **Para:** Visualizar fluxos e arquitetura
   
   - Diagrama ASCII da arquitetura completa
   - Problemas com soluções visuais
   - Fluxos esperados vs reais
   - Arquivos principais do projeto
   - Sequência de implementação
   - Deploy checklist
   
   **Tempo de leitura:** 10-15 minutos

---

## 🔴 Resumo: O que está faltando?

| Item | Status | Impacto | Prioridade |
|------|--------|--------|-----------|
| **TEMP_FRONT_ONLY_MODE desabilitado** | ❌ | Bloqueia integração completa | 🔴 CRÍTICO |
| **DTOs completos (Turma, Avaliação)** | ❌ | Desalinhamento API | 🔴 CRÍTICO |
| **Endpoint GET /turmas/{id}/alunos** | ❌ | Frontend usa workaround | 🔴 CRÍTICO |
| **Integração de Avaliações** | ❌ | Dados perdidos ao reload | 🔴 CRÍTICO |
| **Integração de Relatórios** | ❌ | Funcionalidade incompleta | 🟡 ALTO |
| **Migração de Session para JWT** | ❌ | Não é ideal para SPA | 🟡 ALTO |
| **Rate limiting em login** | ❌ | Segurança bruta força | 🟢 MÉDIO |

---

## 🎯 Próximos Passos

### Imediato (Essa semana)
1. Leia **ANALISE_INTEGRACAO_BACKEND_FRONTEND.md** para entender tudo
2. Use **GUIA_PRATICO_IMPLEMENTACAO.md** para implementar as correções
3. Siga o passo a passo e teste cada mudança

### Depois (Não bloqueador)
- Integrar relatórios
- Migrar para JWT
- Adicionar rate limiting

---

## 📋 Checklist Rápido

Antes de mudar `TEMP_FRONT_ONLY_MODE = false`, você precisa de:

```
Backend:
  ☐ TurmaResponse.java criado
  ☐ AvaliacaoPsicogeneticaResponse.java criado  
  ☐ Endpoint GET /turmas/{id}/alunos adicionado
  ☐ Endpoints GET em AvaliacaoPsicogeneticaController adicionados
  ☐ DTOs atualizados (AlunoRequest, etc)

Frontend:
  ☐ createEvaluation() implementado
  ☐ listEvaluationsByStudent() implementado
  ☐ fetchReportByTurmaAndBimestre() implementado (opcional)
  ☐ Todos os endpoints testados com curl

Testes:
  ☐ Testar login
  ☐ Testar criar turma (persiste no BD)
  ☐ Testar adicionar aluno
  ☐ Testar criar avaliação (persiste no BD)
  ☐ Testar relatório (carrega dados reais)
```

---

## 🔗 Referências Rápidas

### Endpoints Críticos

**Autenticação** ✅
```bash
POST /auth/login          # Login com email/senha
GET  /auth/me             # Info do usuário atual
POST /auth/logout         # Logout
```

**Turmas** ⚠️
```bash
GET    /turmas                    # Listar turmas
POST   /turmas                    # Criar turma
GET    /turmas/{id}               # Buscar turma
DELETE /turmas/{id}               # Deletar turma
GET    /turmas/{id}/alunos        # ❌ FALTA ADICIONAR
PATCH  /turmas/{id}/professor/{pid} # Assinar professor
```

**Alunos** ✅
```bash
GET    /alunos                    # Listar alunos
GET    /alunos?turmaId={id}       # Listar por turma (workaround)
POST   /alunos                    # Criar aluno
GET    /alunos/{id}               # Buscar aluno
PUT    /alunos/{id}               # Atualizar aluno
DELETE /alunos/{id}               # Deletar aluno
```

**Professores** ✅
```bash
GET    /admin/usuarios                      # Listar usuários
POST   /admin/usuarios/professores          # Criar professor
PATCH  /admin/usuarios/{id}/ativar          # Ativar professor
PATCH  /admin/usuarios/{id}/desativar       # Desativar professor
```

**Avaliações** ❌
```bash
POST   /avaliacoes              # ⚠️ Incompleto
GET    /avaliacoes/{id}         # ❌ FALTA
GET    /avaliacoes/aluno/{id}   # ❌ FALTA
```

**Relatórios** ❌
```bash
GET /relatorios/turma/{id}/bimestre/{b}/periodo/{p}       # ❌ FALTA INTEGRAR
GET /relatorios/turma/{id}/bimestre/{b}/periodo/{p}/niveis # ❌ FALTA INTEGRAR
```

---

## 🧪 Como Testar

### Via Curl (Backend)

```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=carla.prof@escola.com&password=123456" \
  -c cookies.txt

# Verificar sessão
curl http://localhost:8080/auth/me -b cookies.txt

# Criar turma
curl -X POST http://localhost:8080/turmas \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"nome": "Turma A", "turno": "MANHA", "ano": 1}'

# Listar turmas
curl http://localhost:8080/turmas -b cookies.txt

# Listar alunos
curl "http://localhost:8080/alunos?turmaId=1" -b cookies.txt
```

### Via Frontend Console

```typescript
// Após implementar e com TEMP_FRONT_ONLY_MODE = false:
import { listClasses, createClass } from './services/classes';

// Testar listagem
const classes = await listClasses();
console.log(classes);

// Testar criação
const newClass = await createClass({
  nome: 'Turma Teste',
  professor: 'João'
});
console.log(newClass);
```

---

## 📞 Dúvidas Frequentes

**P: Por que TEMP_FRONT_ONLY_MODE está ativado?**  
R: Era um modo de facilitar testes enquanto o backend ainda não era estável. Agora precisa ser desabilitado.

**P: Qual é a melhor forma de testar a integração?**  
R: 1) Testar backend com curl  2) Testar frontend em modo local  3) Testar fluxo completo

**P: Os dados do frontend vão ser perdidos se eu recarregar a página?**  
R: Sim, enquanto usar dados mockados. Após ativar integração, os dados virão do banco.

**P: Preciso de JWT?**  
R: Session funciona, mas JWT é melhor para SPA. Veja a seção de segurança na análise.

**P: Quanto tempo vai levar para corrigir tudo?**  
R: 3-4 horas para os itens críticos. Depois 2-3 horas opcionais para melhorias.

---

## 📁 Estrutura do Repositório

```
LUNETRAS/
├── ANALISE_INTEGRACAO_BACKEND_FRONTEND.md  ← 📊 LEIA PRIMEIRO
├── GUIA_PRATICO_IMPLEMENTACAO.md           ← 🔧 DEPOIS IMPLEMENTE
├── MAPA_VISUAL_INTEGRACAO.md               ← 🗺️  VISUALIZE
├── INTEGRACAO_README.md                    ← ← VOCÊ ESTÁ AQUI
│
├── LUNETRAS-BACK/                   (Backend Spring Boot)
│   ├── src/main/java/com/lunetras/
│   │   ├── controller/              (APIs REST)
│   │   ├── service/                 (Lógica de negócio)
│   │   ├── repository/              (Acesso a dados)
│   │   ├── model/                   (Entidades JPA)
│   │   ├── dto/                     (Objetos de transferência)
│   │   ├── config/                  (SecurityConfig, etc)
│   │   └── LunetrasApplication.java
│   ├── Dockerfile
│   └── pom.xml                      (Dependências Maven)
│
├── LUNETRAS_Front/                  (Frontend React)
│   ├── src/
│   │   ├── pages/                   (Componentes de página)
│   │   │   ├── login/
│   │   │   ├── admin/
│   │   │   └── professor/
│   │   ├── services/                (Chamadas de API)
│   │   │   ├── api.ts               ✅
│   │   │   ├── auth.ts              ✅
│   │   │   ├── classes.ts           ⚠️
│   │   │   └── teachers.ts          ⚠️
│   │   ├── config/
│   │   │   └── env.ts
│   │   └── App.tsx                  🔴 TEMP_FRONT_ONLY_MODE
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml               (Orquestração)
├── init.sql                         (Dados iniciais)
├── package.json                     (Root dependencies)
└── README.md                        (Setup do projeto)
```

---

## 🚀 Quick Start para Corrigir

```bash
# 1. Ler a análise
cat ANALISE_INTEGRACAO_BACKEND_FRONTEND.md

# 2. Ver o mapa visual
cat MAPA_VISUAL_INTEGRACAO.md

# 3. Implementar as correções (vide GUIA_PRATICO_IMPLEMENTACAO.md)
# 3.1 Criar DTOs no backend
# 3.2 Adicionar endpoints
# 3.3 Integrar frontend
# 3.4 Testar

# 4. Habilitar integração
# Mudar App.tsx:29 de true para false

# 5. Testar tudo funciona
npm test
```

---

## 📞 Contato / Suporte

Se tiver dúvidas sobre a integração, revise:

1. **Seção "Problemas Críticos"** em ANALISE_INTEGRACAO_BACKEND_FRONTEND.md
2. **Seção correspondente** em GUIA_PRATICO_IMPLEMENTACAO.md  
3. **Diagrama no MAPA_VISUAL_INTEGRACAO.md**

---

**Última atualização:** 10 de Março de 2026  
**Status:** 🔴 Integração Incompleta - Bloqueador: TEMP_FRONT_ONLY_MODE

