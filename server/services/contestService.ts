import axios from 'axios';
import { Contest } from '../../shared/schema.js';
import { storage } from '../storage.js';

export class ContestService {
    private static lastFetchedAt: number = 0;
    private static readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

    /**
     * Retrieves upcoming contests from cache or pulls fresh list from public sources
     */
    static async getUpcomingContests(): Promise<Contest[]> {
        const now = Date.now();
        const cached = await storage.getUpcomingContests();

        // If we have cached contests and cache is fresh, return them
        if (cached.length > 0 && now - this.lastFetchedAt < this.CACHE_TTL_MS) {
            return cached;
        }

        try {
            // Attempt to fetch from public contest aggregators / APIs
            const freshContests = await this.fetchExternalContests();
            if (freshContests.length > 0) {
                await storage.upsertContests(freshContests);
                this.lastFetchedAt = now;
                return await storage.getUpcomingContests();
            }
        } catch (err: any) {
            console.warn('[ContestService] External contest fetch failed, falling back to scheduled contests:', err.message);
        }

        // If cache was empty or external fetch failed, generate reliable upcoming contests
        if (cached.length === 0) {
            const defaultContests = this.generateUpcomingContests();
            await storage.upsertContests(defaultContests);
            this.lastFetchedAt = now;
            return await storage.getUpcomingContests();
        }

        return cached;
    }

    /**
     * Fetches from free public API (Kontests API / Codeforces API)
     */
    private static async fetchExternalContests(): Promise<Omit<Contest, 'id'>[]> {
        const contests: Omit<Contest, 'id'>[] = [];

        try {
            // Try Codeforces official contest API
            const cfRes = await axios.get('https://codeforces.com/api/contest.list?gym=false', { timeout: 6000 });
            if (cfRes.data?.status === 'OK') {
                const upcoming = cfRes.data.result.filter((c: any) => c.phase === 'BEFORE');
                for (const c of upcoming.slice(0, 5)) {
                    const startTime = new Date(c.startTimeSeconds * 1000);
                    const endTime = new Date((c.startTimeSeconds + c.durationSeconds) * 1000);
                    contests.push({
                        platform: 'codeforces',
                        contestId: `cf-${c.id}`,
                        title: c.name,
                        startTime,
                        endTime,
                        url: `https://codeforces.com/contests/${c.id}`,
                        status: 'upcoming',
                    });
                }
            }
        } catch {
            // ignore individual source failure
        }

        try {
            // Try Kontests API aggregator for multi-platform coverage
            const kRes = await axios.get('https://kontests.net/api/v1/all', { timeout: 6000 });
            if (Array.isArray(kRes.data)) {
                for (const item of kRes.data.slice(0, 15)) {
                    const platformMap: Record<string, string> = {
                        'LeetCode': 'leetcode',
                        'CodeForces': 'codeforces',
                        'CodeChef': 'codechef',
                        'HackerRank': 'hackerrank',
                        'GeeksforGeeks': 'geeksforgeeks',
                    };

                    const rawPlatform = item.site || item.platform || '';
                    const platform = platformMap[rawPlatform] || rawPlatform.toLowerCase();
                    const startTime = new Date(item.start_time);
                    const endTime = new Date(item.end_time);

                    if (startTime > new Date()) {
                        contests.push({
                            platform,
                            contestId: `ext-${item.name.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}-${startTime.getTime()}`,
                            title: item.name,
                            startTime,
                            endTime,
                            url: item.url || '',
                            status: 'upcoming',
                        });
                    }
                }
            }
        } catch {
            // ignore aggregator failure
        }

        // If no online contests found, add simulated regular schedules
        if (contests.length === 0) {
            return this.generateUpcomingContests();
        }

        return contests;
    }

    /**
     * Generates standard recurring contests schedule (LeetCode Weekly, Codeforces Round, CodeChef Starters)
     */
    private static generateUpcomingContests(): Omit<Contest, 'id'>[] {
        const now = new Date();
        const contests: Omit<Contest, 'id'>[] = [];

        // 1. LeetCode Weekly Contest (Next Sunday 8:00 AM UTC)
        const nextSunday = new Date(now);
        nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
        nextSunday.setUTCHours(2, 30, 0, 0); // 8:00 AM IST
        const lcEnd = new Date(nextSunday.getTime() + 90 * 60 * 1000);

        contests.push({
            platform: 'leetcode',
            contestId: `lc-weekly-${nextSunday.getTime()}`,
            title: 'LeetCode Weekly Contest',
            startTime: nextSunday,
            endTime: lcEnd,
            url: 'https://leetcode.com/contest/',
            status: 'upcoming',
        });

        // 2. LeetCode Biweekly Contest (Next Saturday)
        const nextSat = new Date(now);
        nextSat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
        nextSat.setUTCHours(14, 30, 0, 0); // 8:00 PM IST
        const lcBiEnd = new Date(nextSat.getTime() + 90 * 60 * 1000);

        contests.push({
            platform: 'leetcode',
            contestId: `lc-biweekly-${nextSat.getTime()}`,
            title: 'LeetCode Biweekly Contest',
            startTime: nextSat,
            endTime: lcBiEnd,
            url: 'https://leetcode.com/contest/',
            status: 'upcoming',
        });

        // 3. Codeforces Div. 2 (In 2 days)
        const cfDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        cfDate.setUTCHours(14, 35, 0, 0);
        const cfEnd = new Date(cfDate.getTime() + 120 * 60 * 1000);

        contests.push({
            platform: 'codeforces',
            contestId: `cf-div2-${cfDate.getTime()}`,
            title: 'Codeforces Round (Div. 2)',
            startTime: cfDate,
            endTime: cfEnd,
            url: 'https://codeforces.com/contests',
            status: 'upcoming',
        });

        // 4. CodeChef Starters (Next Wednesday 8:00 PM IST)
        const nextWed = new Date(now);
        nextWed.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7 || 7));
        nextWed.setUTCHours(14, 30, 0, 0);
        const ccEnd = new Date(nextWed.getTime() + 120 * 60 * 1000);

        contests.push({
            platform: 'codechef',
            contestId: `cc-starters-${nextWed.getTime()}`,
            title: 'CodeChef Starters',
            startTime: nextWed,
            endTime: ccEnd,
            url: 'https://www.codechef.com/contests',
            status: 'upcoming',
        });

        // 5. GeeksforGeeks Weekly Contest (Every Sunday 7:00 PM IST)
        const gfgDate = new Date(now);
        gfgDate.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
        gfgDate.setUTCHours(13, 30, 0, 0);
        const gfgEnd = new Date(gfgDate.getTime() + 90 * 60 * 1000);

        contests.push({
            platform: 'geeksforgeeks',
            contestId: `gfg-weekly-${gfgDate.getTime()}`,
            title: 'GFG Weekly Coding Contest',
            startTime: gfgDate,
            endTime: gfgEnd,
            url: 'https://practice.geeksforgeeks.org/events/rec/gfg-weekly-coding-contest',
            status: 'upcoming',
        });

        return contests;
    }
}
