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

        const hasUserData = userStats && (userStats.solved > 0 || userStats.streak > 0 || userStats.topCat);

        const systemPrompt = hasUserData
            ? `You are an expert AI mentor and interviewer for Software Engineering and DSA.
You have access to the user's progress data:
- Problems solved: ${userStats.solved || 0}
- Current streak: ${userStats.streak || 0} days
- Strongest/Most active topic: ${userStats.topCat || 'N/A'}

Act as a mentor + interviewer. Use this data to personalize your responses.
Encourage them on their streak. If they ask for advice, guide them based on their recent topics.
Keep your tone friendly, helpful, and clear.`
            : `You are a helpful AI assistant for coding interviews and DSA.
Provide clean code solutions, explain the approach, and state time/space complexity.
Act as a mentor. Keep your tone friendly, helpful, and clear.`;

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
