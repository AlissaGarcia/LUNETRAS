const DEV_API_URL = 'http://localhost:8080';

/**
 * Em desenvolvimento local usamos o backend em localhost:8080.
 * Em build de produção (Docker + Nginx), usamos URL relativa para permitir
 * que o proxy do Nginx encaminhe requisições sem depender de localhost do navegador.
 */
const DEFAULT_API_URL = import.meta.env.DEV ? DEV_API_URL : '';

export const API_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;
