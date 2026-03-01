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
   ```env
   VITE_API_URL=http://localhost:8080
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

A tela de login (`src/pages/login/Login.tsx`) consome `login(...)`, exibe estados de carregamento/erro e persiste token e usuário no `localStorage`.

## Docker

Build da imagem do front-end:

```bash
docker build -t lunetras-frontend:latest .
```

Executar container:

```bash
docker run --rm -p 4173:80 lunetras-frontend:latest
```
