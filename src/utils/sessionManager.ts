import { User } from '../types/auth';

const USER_KEY = 'pt_user';
const TOKEN_KEY = 'pt_token';
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export class SessionManager {
    static saveSession(user: User, token: string): void {
        localStorage.setItem(USER_KEY, JSON.stringify({ user, ts: Date.now() }));
        localStorage.setItem(TOKEN_KEY, token);
    }

    /** @deprecated use saveSession */
    static saveUser(user: User): void {
        const token = this.getToken() ?? '';
        this.saveSession(user, token);
    }

    static getUser(): User | null {
        try {
            const raw = localStorage.getItem(USER_KEY);
            if (!raw) return null;
            const { user, ts } = JSON.parse(raw);
            if (Date.now() - ts > SESSION_TTL) { this.clearSession(); return null; }
            if (!user?.id || !user?.email) { this.clearSession(); return null; }
            if (!user.role) user.role = 'user';
            return user as User;
        } catch {
            this.clearSession();
            return null;
        }
    }

    static getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    static setToken(token: string | null): void {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    }

    static clearSession(): void {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('user_custom_avatar');
        sessionStorage.removeItem('active_mock_session');
        sessionStorage.removeItem('last_interview_result');
        Object.keys(localStorage)
            .filter(k => 
                k.startsWith('activities_') ||
                k.startsWith('user_custom_avatar_') ||
                k.startsWith('dailyProblem_') ||
                k.startsWith('notifications_') ||
                k.startsWith('core_subject_progress') ||
                k.startsWith('subject_xp') ||
                k.startsWith('platform_accounts_')
            )
            .forEach(k => localStorage.removeItem(k));
    }

    static isSessionValid(): boolean {
        return !!this.getUser() && !!this.getToken();
    }
}

