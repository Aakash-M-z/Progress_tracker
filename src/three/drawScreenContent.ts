// Shared canvas drawing: code editor (left) + roadmap (right)
// Used by both the Three.js CanvasTexture and the CSS fallback.

export type Token = { text: string; color: string };

export const CODE_LINES: Token[][] = [
  [{ text: "import", color: '#a78bfa' }, { text: " { solve } ", color: '#e2e8f0' }, { text: "from", color: '#a78bfa' }, { text: " 'algoascent';", color: '#86efac' }],
  [{ text: '', color: '' }],
  [{ text: 'function', color: '#60a5fa' }, { text: ' twoSum(', color: '#e2e8f0' }, { text: 'nums, target', color: '#fb923c' }, { text: ') {', color: '#e2e8f0' }],
  [{ text: '  const', color: '#a78bfa' }, { text: ' map', color: '#38bdf8' }, { text: ' = ', color: '#e2e8f0' }, { text: 'new', color: '#a78bfa' }, { text: ' Map();', color: '#e2e8f0' }],
  [{ text: '  for', color: '#a78bfa' }, { text: ' (let i = ', color: '#e2e8f0' }, { text: '0', color: '#fb923c' }, { text: '; i < nums.length; i++) {', color: '#e2e8f0' }],
  [{ text: '    const', color: '#a78bfa' }, { text: ' diff = target - nums[i];', color: '#e2e8f0' }],
  [{ text: '    if', color: '#a78bfa' }, { text: ' (map.has(diff)) {', color: '#e2e8f0' }],
  [{ text: '      return', color: '#a78bfa' }, { text: ' [map.get(diff), i];', color: '#e2e8f0' }],
  [{ text: '    }', color: '#94a3b8' }],
  [{ text: '    map.set(nums[i], i);', color: '#e2e8f0' }],
  [{ text: '  }', color: '#94a3b8' }],
  [{ text: '  return', color: '#a78bfa' }, { text: ' [];', color: '#e2e8f0' }],
  [{ text: '}', color: '#94a3b8' }],
  [{ text: '', color: '' }],
  [{ text: 'console.log(twoSum(', color: '#94a3b8' }, { text: '[2, 7, 11, 15], 9', color: '#fb923c' }, { text: '));', color: '#94a3b8' }],
  [{ text: '// Output: [0, 1]', color: '#475569' }],
];

export const ROADMAP_NODES = [
  { label: 'DSA',           sub: '48 / 90', cx: 0.60, cy: 0.20, color: '#a78bfa' },
  { label: 'Java',          sub: '32 / 60', cx: 0.38, cy: 0.38, color: '#60a5fa' },
  { label: 'System Design', sub: '18 / 40', cx: 0.82, cy: 0.38, color: '#f59e0b' },
  { label: 'Spring Boot',   sub: '26 / 50', cx: 0.60, cy: 0.55, color: '#34d399' },
  { label: 'AWS',           sub: '24 / 45', cx: 0.38, cy: 0.72, color: '#fb923c' },
  { label: 'AI / ML',       sub: '12 / 30', cx: 0.82, cy: 0.72, color: '#e879f9' },
  { label: 'Full Stack',    sub: '20 / 50', cx: 0.60, cy: 0.88, color: '#38bdf8' },
];

export const ROADMAP_EDGES = [
  [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6],
];

export function flattenLine(tokens: Token[]): string {
  return tokens.map(t => t.text).join('');
}

export interface TypeState {
  line: number;
  col: number;
  done: boolean;
  cps: number;
  lastTick: number;
  /** When set, typing is paused until this timestamp (ms) then loops */
  pauseUntil: number;
}

/** Returns true if visible[] changed. Resets and loops when finished. */
export function tickTyping(state: TypeState, visible: number[], now: number): boolean {
  // Waiting to loop
  if (state.pauseUntil > 0) {
    if (now < state.pauseUntil) return false;
    // Resume — reset everything
    state.pauseUntil = 0;
    state.line = 0;
    state.col = 0;
    state.done = false;
    for (let i = 0; i < visible.length; i++) visible[i] = 0;
    return true;
  }

  if (state.done) return false;

  const dt = (now - state.lastTick) / 1000;
  if (dt < 1 / state.cps) return false;
  state.lastTick = now;

  const lineText = flattenLine(CODE_LINES[state.line]);
  if (state.col < lineText.length) {
    visible[state.line]++;
    state.col++;
    return true;
  }

  state.line++;
  state.col = 0;

  if (state.line >= CODE_LINES.length) {
    // Finished — pause 2 s then loop
    state.done = true;
    state.pauseUntil = now + 2000;
  }
  return true;
}

export function drawScreen(
  ctx: CanvasRenderingContext2D,
  t: number,
  W: number,
  H: number,
  visible: number[],
  typeState: TypeState,
) {
  // Scale factor relative to original 1024 design
  const S = W / 1024;
  const splitX = W * 0.52;

  // ── Background ────────────────────────────────────────────────────────────
  ctx.fillStyle = '#09090f';
  ctx.fillRect(0, 0, W, H);

  // ── LEFT: Code editor ─────────────────────────────────────────────────────
  ctx.fillStyle = '#0c0c14';
  ctx.fillRect(0, 0, splitX, H);

  // Top bar
  const barH = 32 * S;
  ctx.fillStyle = '#10101a';
  ctx.fillRect(0, 0, splitX, barH);

  // Traffic light dots (macOS style)
  const dotColors = ['#ff5f57', '#febc2e', '#28c840'];
  dotColors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc((14 + i * 18) * S, barH * 0.5, 5 * S, 0, Math.PI * 2);
    ctx.fill();
  });

  // File tab
  ctx.fillStyle = '#1a1a2c';
  ctx.beginPath();
  ctx.roundRect(58 * S, 6 * S, 140 * S, 22 * S, [4 * S, 4 * S, 0, 0]);
  ctx.fill();
  // Active tab indicator line
  ctx.fillStyle = '#7c6aff';
  ctx.fillRect(58 * S, barH - 2 * S, 140 * S, 2 * S);
  ctx.fillStyle = '#a0a0c0';
  ctx.font = `${13 * S}px monospace`;
  ctx.fillText('solution.js', 66 * S, 21 * S);

  // Running indicator
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(220 * S, barH * 0.5, 5 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = `${12 * S}px monospace`;
  ctx.fillText('Running...', 230 * S, barH * 0.65);

  // Line number gutter background
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, barH, 42 * S, H);

  // Code lines
  const usableH = H - barH - 72 * S;
  const lineH = Math.min(24 * S, usableH / CODE_LINES.length);
  const fontSize = Math.max(11 * S, lineH * 0.70);
  ctx.font = `${fontSize}px 'Fira Code', monospace`;

  const justReset = typeState.line === 0 && typeState.col <= 2 && !typeState.done;

  for (let li = 0; li < CODE_LINES.length; li++) {
    if (justReset && li > 0) break;
    const lineY = barH + li * lineH + lineH * 0.78;

    // Line number
    ctx.fillStyle = '#2d3558';
    ctx.font = `${fontSize * 0.82}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(String(li + 1), 36 * S, lineY);
    ctx.textAlign = 'left';
    ctx.font = `${fontSize}px 'Fira Code', monospace`;

    // Active line highlight
    if (li === typeState.line && !typeState.done) {
      ctx.fillStyle = 'rgba(124, 106, 255, 0.07)';
      ctx.fillRect(0, barH + li * lineH, splitX, lineH);
    }

    // Tokens
    let charX = 48 * S;
    let drawn = 0;
    const maxChars = visible[li];
    for (const tok of CODE_LINES[li]) {
      if (drawn >= maxChars) break;
      const slice = tok.text.slice(0, maxChars - drawn);
      ctx.fillStyle = tok.color || '#e2e8f0';
      ctx.fillText(slice, charX, lineY);
      charX += ctx.measureText(slice).width;
      drawn += slice.length;
    }

    // Cursor
    if (li === typeState.line && !typeState.done && typeState.pauseUntil === 0) {
      if (Math.sin(t * 4.5) > 0) {
        ctx.fillStyle = 'rgba(167, 139, 250, 0.95)';
        ctx.fillRect(charX, lineY - fontSize * 0.82, 2 * S, lineH * 0.82);
      }
    }
  }

  // Terminal strip
  const termY = H - 72 * S;
  ctx.fillStyle = '#06060d';
  ctx.fillRect(0, termY, splitX, 72 * S);
  ctx.strokeStyle = 'rgba(124,106,255,0.12)';
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath(); ctx.moveTo(0, termY); ctx.lineTo(splitX, termY); ctx.stroke();

  // Terminal label
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = `${11 * S}px monospace`;
  ctx.fillText('TERMINAL', 10 * S, termY + 14 * S);

  const showOutput = typeState.done || typeState.pauseUntil > 0 || typeState.line >= 14;
  if (showOutput && !justReset) {
    ctx.fillStyle = '#22c55e';
    ctx.font = `${13 * S}px monospace`;
    ctx.fillText('✓  Compiled in 28ms', 10 * S, termY + 32 * S);
    ctx.fillStyle = '#475569';
    ctx.font = `${11 * S}px monospace`;
    ctx.fillText('Heap: 8.3 MB  |  O(n) time  |  O(n) space', 10 * S, termY + 50 * S);
    ctx.fillStyle = '#334155';
    ctx.fillText('> _', 10 * S, termY + 64 * S);
  }

  // Divider
  ctx.strokeStyle = 'rgba(124,106,255,0.08)';
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath(); ctx.moveTo(splitX, 0); ctx.lineTo(splitX, H); ctx.stroke();

  // ── RIGHT: Roadmap ─────────────────────────────────────────────────────────
  ctx.fillStyle = '#07070e';
  ctx.fillRect(splitX, 0, W - splitX, H);

  // Right panel top bar
  ctx.fillStyle = '#0e0e1c';
  ctx.fillRect(splitX, 0, W - splitX, barH);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = `${13 * S}px Inter, sans-serif`;
  ctx.fillText('Learning Roadmap', splitX + 12 * S, barH * 0.67);

  // Live badge
  const badgeW = 110 * S;
  ctx.fillStyle = '#141428';
  ctx.beginPath();
  ctx.roundRect(W - badgeW - 8 * S, 7 * S, badgeW, 18 * S, 9 * S);
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath(); ctx.arc(W - badgeW + 4 * S, barH * 0.5, 4 * S, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `${10 * S}px sans-serif`;
  ctx.fillText('Interactive Mode', W - badgeW + 12 * S, barH * 0.67);

  // Roadmap area
  const rpX = splitX;
  const rpY = barH;
  const rpW = W - splitX;
  const rpH = H - barH;
  const nodeR = Math.min(rpW, rpH) * 0.078;

  // Edges
  ctx.setLineDash([4 * S, 7 * S]);
  ctx.lineWidth = 1.5 * S;
  for (const [a, b] of ROADMAP_EDGES) {
    const na = ROADMAP_NODES[a];
    const nb = ROADMAP_NODES[b];
    ctx.strokeStyle = 'rgba(167,139,250,0.12)';
    ctx.beginPath();
    ctx.moveTo(rpX + na.cx * rpW, rpY + na.cy * rpH);
    ctx.lineTo(rpX + nb.cx * rpW, rpY + nb.cy * rpH);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Nodes
  for (let ni = 0; ni < ROADMAP_NODES.length; ni++) {
    const n = ROADMAP_NODES[ni];
    const nx = rpX + n.cx * rpW;
    const ny = rpY + n.cy * rpH;
    const pulse = 0.92 + Math.sin(t * 1.1 + ni * 0.85) * 0.08;
    const r = nodeR * pulse;

    // Outer glow
    ctx.save();
    ctx.shadowColor = n.color;
    ctx.shadowBlur = 22 * S * pulse;

    // Node gradient fill
    const grad = ctx.createRadialGradient(nx - r * 0.25, ny - r * 0.25, 0, nx, ny, r);
    grad.addColorStop(0, n.color + 'dd');
    grad.addColorStop(0.6, n.color + '88');
    grad.addColorStop(1, n.color + '22');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Node border
    ctx.strokeStyle = n.color + 'aa';
    ctx.lineWidth = 1.8 * S;
    ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.stroke();

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(10 * S, r * 0.48)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(n.label, nx, ny + 4 * S);

    // Sub-label
    ctx.font = `${Math.max(8 * S, r * 0.34)}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.50)';
    ctx.fillText(n.sub, nx, ny + r + 12 * S);
    ctx.textAlign = 'left';
  }

  // Vignette
  const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.6);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // Top glare strip
  ctx.save();
  ctx.globalAlpha = 0.014;
  const glare = ctx.createLinearGradient(0, 0, 0, H * 0.12);
  glare.addColorStop(0, '#ffffff');
  glare.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glare;
  ctx.fillRect(0, 0, W, H * 0.12);
  ctx.restore();
}
