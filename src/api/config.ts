/**
 * Central API configuration.
 *
 * Automatically detects localhost environment vs production Render backend.
 * Custom Override: Set VITE_API_BASE_URL in environment or .env
 */

const PROD_RENDER_BACKEND = 'https://algoascent-tbg9.onrender.com';
const PROD_CODE_EXEC = 'https://code-execution-backend-qq01.onrender.com';

const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE: string = 
    import.meta.env.VITE_API_BASE_URL || 
    (isLocalhost 
        ? (window.location.port === '5000' ? '' : 'http://localhost:5000')
        : PROD_RENDER_BACKEND);

export const CODE_EXEC_BASE: string = 
    import.meta.env.VITE_CODE_EXECUTION_URL || PROD_CODE_EXEC;

console.log(`[config] API_BASE: "${API_BASE}", hostname: ${typeof window !== 'undefined' ? window.location.hostname : 'ssr'}`);
