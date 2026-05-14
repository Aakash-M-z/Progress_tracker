/**
 * Calculates the next review date and intervals based on a simplified SM-2 algorithm.
 * 
 * @param rating User rating from 1 to 4 (1 = Basic, 2 = Familiar, 3 = Confident, 4 = Mastered)
 * @param previousInterval The previous interval in days (0 if new problem)
 * @param previousEaseFactor The previous ease factor (default 2.5)
 * @returns Object containing the new interval, new ease factor, and next review date
 */
export function calculateNextReview(
    rating: number,
    previousInterval: number = 0,
    previousEaseFactor: number = 2.5
): { interval: number; easeFactor: number; nextReviewDate: Date } {
    let interval: number;
    let easeFactor = previousEaseFactor;

    // Map 1-4 rating to a 0-5 scale typical for SM-2
    // 1 (Basic) -> 2 (Hard)
    // 2 (Familiar) -> 3 (Good)
    // 3 (Confident) -> 4 (Easy)
    // 4 (Mastered) -> 5 (Very Easy)
    const sm2Rating = rating + 1;

    if (sm2Rating < 3) {
        // If rating is < 3, interval drops to 1 day, ease factor slightly decreases
        interval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else {
        // Calculate new ease factor
        // Formula: EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        easeFactor = easeFactor + (0.1 - (5 - sm2Rating) * (0.08 + (5 - sm2Rating) * 0.02));
        easeFactor = Math.max(1.3, easeFactor); // Minimum ease factor is 1.3

        if (previousInterval === 0) {
            // First review
            interval = 1;
        } else if (previousInterval === 1) {
            // Second review
            interval = 6;
        } else {
            // Subsequent reviews
            interval = Math.round(previousInterval * easeFactor);
        }
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
        interval,
        easeFactor,
        nextReviewDate,
    };
}
