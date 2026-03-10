# LUNETRAS Front-end

Aplicação React + TypeScript + Vite para a interface do LUNETRAS.

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Ajuste a URL da API no `.env`:
   - **Local (fora do Docker):** `VITE_API_URL=http://localhost:8080`
   - **Docker/Codespace:** deixe vazio (`VITE_API_URL=`) para usar o proxy Nginx
   ```env
   VITE_API_URL=http://localhost:8080  # para desenvolvimento local
   # ou
   VITE_API_URL=  # para Docker/Codespace
   ```
4. Execute em modo desenvolvimento:
   ```bash
   npm run dev
   ```

## Comunicação com o back-end

A comunicação HTTP fica centralizada em:

- `src/config/env.ts`: define URL base da API.
- `src/services/api.ts`: cliente HTTP genérico e tratamento de erros.
- `src/services/auth.ts`: contrato de autenticação (`POST /auth/login`).
- `src/services/classes.ts`: integração com turmas/alunos (listagem, criação, edição e remoção).

A tela de login (`src/pages/login/Login.tsx`) consome `login(...)`, exibe estados de carregamento/erro e persiste estado de autenticação + usuário no `localStorage` enquanto a sessão stateful é mantida por cookie HTTP.