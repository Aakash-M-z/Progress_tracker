import axios from 'axios';
import { Activity } from '../../shared/schema.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface AIChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIUserStats {
    solved: number;
    streak: number;
    topCat: string;
    username?: string;
    connectedAccounts?: Array<{
        platform: string;
        username: string;
        rating?: number | null;
        rank?: string | number | null;
        solvedCount: number;
        contestCount?: number | null;
    }>;
}

export class AIService {
    private static getApiKey() {
        return process.env.OPENROUTER_API_KEY;
    }

    static async generateResponse(message: string, history: AIChatMessage[] = [], userStats?: AIUserStats) {
        const apiKey = this.getApiKey();
        if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
            throw new Error('AI service is not configured (missing API key)');
        }

        const hasUserData = userStats && (userStats.solved > 0 || userStats.streak > 0 || userStats.topCat || (userStats.connectedAccounts && userStats.connectedAccounts.length > 0));

        let platformContext = '';
        if (userStats?.connectedAccounts && userStats.connectedAccounts.length > 0) {
            const lines = userStats.connectedAccounts.map(a => 
                `• ${a.platform.toUpperCase()} (@${a.username}): Solved ${a.solvedCount} problems${a.rating ? `, Rating: ${a.rating}` : ''}${a.rank ? `, Rank: ${a.rank}` : ''}`
            );
            platformContext = `\nConnected Coding Ecosystem Accounts:\n${lines.join('\n')}\n`;
        }

        const systemPrompt = hasUserData
            ? `You are Dora AI, the intelligent mentor & competitive programming coach for the AlgoAscent platform.
You have access to the user's comprehensive coding identity across platforms:
- Total internal problems solved: ${userStats.solved || 0}
- Current streak: ${userStats.streak || 0} days
- Most active subject/topic: ${userStats.topCat || 'Algorithms'}
${platformContext}
Act as a world-class coding mentor, contest coach, and interviewer:
1. Provide personalized advice using their ratings and multi-platform stats (LeetCode, Codeforces, CodeChef, etc.).
2. If they ask about contest preparation or what to do today, give specific, actionable problem recommendations (e.g. recommend 2 Medium DP or Graph problems).
3. If they ask about their performance, analyze their strengths, weaknesses, and rating trends.
4. Keep answers encouraging, crisp, structured, and developer-focused with clean markdown.`
            : `You are Dora AI, an intelligent coding mentor for AlgoAscent.
Provide clean code solutions, explain approaches, state time/space complexity, and help prepare for competitive programming contests and technical interviews. Keep your tone encouraging and concise.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: message }
        ];

        try {
            const response = await axios.post(
                OPENROUTER_URL,
                {
                    model: 'google/gemini-2.0-flash-001',
                    messages,
                    temperature: 0.7,
                    max_tokens: 1000,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'HTTP-Referer': 'https://progresss-tracker.vercel.app',
                        'X-Title': 'AlgoAscent AI Coach',
                        'Content-Type': 'application/json',
                    },
                    timeout: 45000, // 45s timeout for AI
                }
            );

            return response.data.choices[0].message.content;
        } catch (error: any) {
            console.error('[AIService] OpenRouter Error:', error.response?.data || error.message);
            throw new Error('Failed to generate AI response');
        }
    }

    static async analyzeCodeComplexity(code: string, language: string) {
        const apiKey = this.getApiKey();
        if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
            throw new Error('AI service is not configured (missing API key)');
        }
        const prompt = `Analyze the time and space complexity of the following ${language} code. 
Provide a concise explanation and the Big-O notation for both.

Code:
\`\`\`${language}
${code}
\`\`\``;

        const messages: AIChatMessage[] = [
            { role: 'system', content: 'You are a technical interviewer specializing in algorithmic complexity.' },
            { role: 'user', content: prompt }
        ];

        try {
            const response = await axios.post(
                OPENROUTER_URL,
                {
                    model: 'google/gemini-2.0-flash-001',
                    messages,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'HTTP-Referer': 'https://progresss-tracker.vercel.app',
                        'X-Title': 'AlgoAscent Complexity Analyzer',
                    }
                }
            );
            return response.data.choices[0].message.content;
        } catch (error: any) {
            console.error('[AIService] Complexity Analysis Error:', error.message);
            throw new Error('Failed to analyze code complexity');
        }
    }
}
