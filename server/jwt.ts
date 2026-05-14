import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_prod';
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'];
const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

export interface JwtPayload {
    id: string;
    email: string;
    role: 'admin' | 'user';
    plan: 'free' | 'premium';
}

/** Sign an Access Token (short-lived) for a user. */
export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/** Sign a Refresh Token (long-lived) for a user. */
export function signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

/** Verify and decode an Access Token. Returns null if invalid/expired. */
export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

/** Verify and decode a Refresh Token. Returns null if invalid/expired. */
export function verifyRefreshToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

/** Extract Bearer token from Authorization header. */
export function extractBearer(authHeader?: string): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.slice(7).trim() || null;
}
