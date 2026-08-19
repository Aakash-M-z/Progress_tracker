/**
 * Central API configuration.
 *
 * Production / Default: API_BASE = https://algoascent-tbg9.onrender.com
 * Custom Override: Set VITE_API_BASE_URL in environment or .env
 */

const PROD_RENDER_BACKEND = 'https://algoascent-tbg9.onrender.com';
const PROD_CODE_EXEC = 'https://code-execution-backend-qq01.onrender.com';

export const API_BASE: string = 
    import.meta.env.VITE_API_BASE_URL || PROD_RENDER_BACKEND;

export const CODE_EXEC_BASE: string = 
    import.meta.env.VITE_CODE_EXECUTION_URL || PROD_CODE_EXEC;

console.log(`[config] API_BASE: ${API_BASE}`);
console.log(`[config] CODE_EXEC_BASE: ${CODE_EXEC_BASE}`);
