import { User } from '../types/auth';

export class SessionManager {
    private static readonly USER_KEY = 'user';
    private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

    static saveUser(user: User): void {
        const sessionData = {
            user,
            timestamp: Date.now()
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(sessionData));
    }

    static getUser(): User | null {
        try {
            const sessionDataStr = localStorage.getItem(this.USER_KEY);
            if (!sessionDataStr) return null;

            const sessionData = JSON.parse(sessionDataStr);

            // Check if session has expired
            if (Date.now() - sessionData.timestamp > this.SESSION_TIMEOUT) {
                this.clearSession();
                return null;
            }

            // Validate user object structure
            const user = sessionData.user;
            if (!user || !user.id || !user.email || !user.name || !user.role) {
                this.clearSession();
                return null;
            }

            return user;
        } catch (error) {
            console.error('Error retrieving user session:', error);
            this.clearSession();
            return null;
        }
    }

    static clearSession(): void {
        localStorage.removeItem(this.USER_KEY);
        // Clear user-specific data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('activities_')) {
                localStorage.removeItem(key);
            }
        });
    }

    static isSessionValid(): boolean {
        return this.getUser() !== null;
    }

    static refreshSession(): void {
        const user = this.getUser();
        if (user) {
            this.saveUser(user);
        }
    }
}