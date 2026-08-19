import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export interface CardExportUser {
    name?: string;
    username?: string;
    avatar?: string;
}

export interface CardExportStats {
    totalSolved: number;
    githubRepos: number;
    githubFollowers: number;
}

export interface CardExportOptions {
    mode: 'problem_solving' | 'development';
    user: CardExportUser | null;
    stats: CardExportStats;
    currentStreak: number;
}

/**
 * Preload avatar image with CORS fallback
 */
export async function preloadAvatarImage(url?: string): Promise<HTMLImageElement | null> {
    if (!url) return null;
    try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });
        return img;
    } catch {
        return null;
    }
}

/**
 * Draw a high-fidelity Developer Card Face onto a Canvas Context
 */
export function drawCardFace(
    ctx: CanvasRenderingContext2D,
    mode: 'problem_solving' | 'development',
    width: number,
    height: number,
    user: CardExportUser | null,
    avatarImg: HTMLImageElement | null,
    stats: CardExportStats,
    currentStreak: number
) {
    const scale = width / 720;

    // Outer Background
    ctx.fillStyle = '#080911';
    ctx.fillRect(0, 0, width, height);

    // Card Body
    const cardPad = 40 * scale;
    const cardW = width - (cardPad * 2);
    const cardH = height - (cardPad * 2);
    const radius = 28 * scale;

    ctx.fillStyle = '#0f111c';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.roundRect(cardPad, cardPad, cardW, cardH, radius);
    ctx.fill();
    ctx.stroke();

    // Brand Header
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(22 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.fillText('Algo', 70 * scale, 95 * scale);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('Ascent', 120 * scale, 95 * scale);

    // CARD Badge Top Right
    const badgeW = 85 * scale;
    const badgeH = 28 * scale;
    ctx.fillStyle = '#1e2235';
    ctx.beginPath();
    ctx.roundRect(width - (160 * scale), 75 * scale, badgeW, badgeH, 14 * scale);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = `bold ${Math.round(11 * scale)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(mode === 'problem_solving' ? '</> DSA' : '🐙 DEV', width - (118 * scale), 94 * scale);

    // Avatar Center
    const avatarX = width / 2;
    const avatarY = 220 * scale;
    const avatarRadius = 60 * scale;

    // Glowing Border Ring
    const grad = ctx.createLinearGradient(
        avatarX - avatarRadius, avatarY - avatarRadius,
        avatarX + avatarRadius, avatarY + avatarRadius
    );
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.5, '#ea580c');
    grad.addColorStop(1, '#6366f1');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + (5 * scale), 0, Math.PI * 2);
    ctx.fill();

    // Avatar Image or Fallback Initial
    if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
        ctx.restore();
    } else {
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(44 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(user?.name?.charAt(0).toUpperCase() || 'U', avatarX, avatarY + (16 * scale));
    }

    // Rank Shield Badge on Avatar
    const badgeX = avatarX + (42 * scale);
    const badgeY = avatarY + (42 * scale);
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#0f111c';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 14 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(13 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('★', badgeX, badgeY + (4 * scale));

    // User Name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(28 * scale)}px system-ui, -apple-system, sans-serif`;
    const nameText = user?.name || user?.username || 'Developer';
    ctx.fillText(nameText, avatarX - (10 * scale), 335 * scale);

    // Green Checkmark Badge
    const nameWidth = ctx.measureText(nameText).width;
    const checkX = avatarX + (nameWidth / 2) + (6 * scale);
    const checkY = 325 * scale;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(checkX, checkY, 11 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(12 * scale)}px sans-serif`;
    ctx.fillText('✓', checkX, checkY + (4 * scale));

    // Handle Capsule
    ctx.fillStyle = '#181a28';
    ctx.beginPath();
    ctx.roundRect(avatarX - (85 * scale), 355 * scale, 170 * scale, 30 * scale, 15 * scale);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.font = `bold ${Math.round(13 * scale)}px monospace`;
    ctx.fillText(`@${user?.username || 'developer'}`, avatarX, 375 * scale);

    // Metric Panels
    ctx.textAlign = 'left';
    const panelY = 415 * scale;
    const panelW = 290 * scale;
    const panelH = 135 * scale;

    if (mode === 'problem_solving') {
        // Questions Solved
        ctx.fillStyle = '#151726';
        ctx.beginPath();
        ctx.roundRect(70 * scale, panelY, panelW, panelH, 20 * scale);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${Math.round(13 * scale)}px sans-serif`;
        ctx.fillText('QUESTIONS SOLVED', 95 * scale, panelY + (45 * scale));
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(42 * scale)}px sans-serif`;
        ctx.fillText(`${stats.totalSolved.toLocaleString()}`, 95 * scale, panelY + (105 * scale));

        // Active Days
        ctx.fillStyle = '#151726';
        ctx.beginPath();
        ctx.roundRect(360 * scale, panelY, panelW, panelH, 20 * scale);
        ctx.fill();
        ctx.fillStyle = '#34d399';
        ctx.font = `bold ${Math.round(13 * scale)}px sans-serif`;
        ctx.fillText('ACTIVE DAYS', 385 * scale, panelY + (45 * scale));
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(42 * scale)}px sans-serif`;
        ctx.fillText(`${currentStreak || 425}`, 385 * scale, panelY + (105 * scale));
    } else {
        // Public Repositories
        ctx.fillStyle = '#151726';
        ctx.beginPath();
        ctx.roundRect(70 * scale, panelY, panelW, panelH, 20 * scale);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.font = `bold ${Math.round(13 * scale)}px sans-serif`;
        ctx.fillText('PUBLIC REPOSITORIES', 95 * scale, panelY + (45 * scale));
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(42 * scale)}px sans-serif`;
        ctx.fillText(`${stats.githubRepos}`, 95 * scale, panelY + (105 * scale));

        // Followers
        ctx.fillStyle = '#151726';
        ctx.beginPath();
        ctx.roundRect(360 * scale, panelY, panelW, panelH, 20 * scale);
        ctx.fill();
        ctx.fillStyle = '#c084fc';
        ctx.font = `bold ${Math.round(13 * scale)}px sans-serif`;
        ctx.fillText('GITHUB FOLLOWERS', 385 * scale, panelY + (45 * scale));
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(42 * scale)}px sans-serif`;
        ctx.fillText(`${stats.githubFollowers}`, 385 * scale, panelY + (105 * scale));
    }

    // Platform Hub Row
    ctx.fillStyle = '#151726';
    ctx.beginPath();
    ctx.roundRect(70 * scale, 580 * scale, width - (140 * scale), 90 * scale, 20 * scale);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = `bold ${Math.round(12 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('YOU CAN FIND ME ON', avatarX, 615 * scale);

    ctx.font = `bold ${Math.round(14 * scale)}px monospace`;
    ctx.fillStyle = '#ffffff';
    if (mode === 'problem_solving') {
        ctx.fillText('LeetCode  •  Codeforces  •  CodeChef  •  HackerRank  •  GFG', avatarX, 645 * scale);
    } else {
        ctx.fillText('GitHub  •  Open Source  •  Full Stack Ecosystem', avatarX, 645 * scale);
    }

    // Skill Tags Row
    const tags = mode === 'problem_solving'
        ? ['#JAVA', '#C++', '#EXPERT', '#DSA', '#LEETCODE', '#MYSQL']
        : ['#REACT', '#TYPESCRIPT', '#NODEJS', '#TAILWIND', '#MONGODB'];

    ctx.font = `bold ${Math.round(13 * scale)}px monospace`;
    const tagWidth = 85 * scale;
    const tagGap = 10 * scale;
    const totalTagsWidth = tags.length * (tagWidth + tagGap) - tagGap;
    let startX = (width - totalTagsWidth) / 2;

    tags.forEach(t => {
        ctx.fillStyle = '#181a28';
        ctx.beginPath();
        ctx.roundRect(startX, 700 * scale, tagWidth, 36 * scale, 10 * scale);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(t, startX + (tagWidth / 2), 723 * scale);
        startX += tagWidth + tagGap;
    });
}

/**
 * Export High-Resolution PNG Card
 */
export async function exportCardPNG(options: CardExportOptions) {
    const { mode, user, stats, currentStreak } = options;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 720;
    const height = 960;
    canvas.width = width;
    canvas.height = height;

    const avatarImg = await preloadAvatarImage(user?.avatar);
    drawCardFace(ctx, mode, width, height, user, avatarImg, stats, currentStreak);

    const link = document.createElement('a');
    link.download = `${(user?.name || 'developer').toLowerCase()}-algoascent-${mode}-card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/**
 * Export Smooth 3D Flipping Card Animated GIF
 */
export async function exportCardGIF(
    options: CardExportOptions,
    onProgress?: (percent: number) => void
) {
    const { user, stats, currentStreak } = options;
    const width = 420;
    const height = 560;

    // Offscreen Canvas for Front (Problem Solving)
    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = width;
    frontCanvas.height = height;
    const frontCtx = frontCanvas.getContext('2d')!;

    // Offscreen Canvas for Back (Development)
    const backCanvas = document.createElement('canvas');
    backCanvas.width = width;
    backCanvas.height = height;
    const backCtx = backCanvas.getContext('2d')!;

    const avatarImg = await preloadAvatarImage(user?.avatar);

    drawCardFace(frontCtx, 'problem_solving', width, height, user, avatarImg, stats, currentStreak);
    drawCardFace(backCtx, 'development', width, height, user, avatarImg, stats, currentStreak);

    // Frame Canvas
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = width;
    frameCanvas.height = height;
    const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true })!;

    const gif = GIFEncoder();

    // Sequence structure:
    // 6 Pause frames on Front
    // 10 Flip frames (0 -> PI)
    // 6 Pause frames on Back
    // 10 Flip frames (PI -> 2*PI)
    const PAUSE_FRAMES = 6;
    const FLIP_FRAMES = 10;
    const TOTAL_FRAMES = (PAUSE_FRAMES * 2) + (FLIP_FRAMES * 2);

    const centerX = width / 2;
    const centerY = height / 2;

    let frameIndex = 0;

    // Helper to render and record 1 frame
    const recordFrame = (angle: number, delayMs: number) => {
        frameCtx.fillStyle = '#080911';
        frameCtx.fillRect(0, 0, width, height);

        const cosVal = Math.cos(angle);
        const scaleX = Math.abs(cosVal);
        const isFront = Math.cos(angle) >= 0;

        frameCtx.save();
        frameCtx.translate(centerX, centerY);
        frameCtx.scale(scaleX, 1);

        // Draw card face
        const sourceCanvas = isFront ? frontCanvas : backCanvas;
        frameCtx.drawImage(sourceCanvas, -centerX, -centerY);

        // Dynamic 3D lighting sheen/shadow
        const shadowIntensity = Math.abs(Math.sin(angle)) * 0.45;
        if (shadowIntensity > 0.05) {
            frameCtx.fillStyle = `rgba(0, 0, 0, ${shadowIntensity})`;
            frameCtx.fillRect(-centerX, -centerY, width, height);
        }

        frameCtx.restore();

        const imgData = frameCtx.getImageData(0, 0, width, height);
        const palette = quantize(imgData.data, 128);
        const index = applyPalette(imgData.data, palette);
        gif.writeFrame(index, width, height, { palette, delay: delayMs });

        frameIndex++;
        if (onProgress) {
            onProgress(Math.round((frameIndex / TOTAL_FRAMES) * 100));
        }
    };

    // 1. Pause on Front
    for (let i = 0; i < PAUSE_FRAMES; i++) {
        recordFrame(0, 120);
    }

    // 2. Flip Front to Back (0 -> PI)
    for (let i = 1; i <= FLIP_FRAMES; i++) {
        const angle = (i / (FLIP_FRAMES + 1)) * Math.PI;
        recordFrame(angle, 45);
    }

    // 3. Pause on Back
    for (let i = 0; i < PAUSE_FRAMES; i++) {
        recordFrame(Math.PI, 120);
    }

    // 4. Flip Back to Front (PI -> 2*PI)
    for (let i = 1; i <= FLIP_FRAMES; i++) {
        const angle = Math.PI + (i / (FLIP_FRAMES + 1)) * Math.PI;
        recordFrame(angle, 45);
    }

    gif.finish();
    const bytes = gif.bytes();
    const blob = new Blob([bytes], { type: 'image/gif' });

    const link = document.createElement('a');
    link.download = `${(user?.name || 'developer').toLowerCase()}-algoascent-card-3d-flipper.gif`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}
