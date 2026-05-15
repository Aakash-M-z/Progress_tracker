/**
 * email.service.ts
 * Brevo SMTP via Nodemailer — drop-in replacement for Resend.
 *
 * Design principles:
 * - Never throws — all errors caught and logged
 * - Never blocks the calling request — fire-and-forget at call site
 * - Reads env vars at call time to avoid dotenv race condition
 * - Transporter is lazily created and reused (singleton)
 */

import nodemailer, { Transporter } from 'nodemailer';
import dns from 'dns';
import crypto from 'crypto';

import { welcomeTemplate, passwordResetTemplate, emailVerificationTemplate, accountDeactivatedTemplate, accountActivatedTemplate } from './email.templates.js';
import { PasswordResetTokenModel } from './models.js';

// ── Transporter singleton — Gmail or Brevo, selected by env ──────────────────
let _transporter: Transporter | null = null;
let _transporterKey: string | undefined;

function getTransporter(): Transporter {
    // Gmail takes priority if EMAIL_USER is set
    const key = process.env.EMAIL_USER ?? process.env.BREVO_SMTP_USER;
    if (!_transporter || key !== _transporterKey) {
        if (process.env.EMAIL_USER) {
            _transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // Port 465 uses SSL/TLS directly
                auth: {
                    user: (process.env.EMAIL_USER || '').replace(/['"]/g, '').trim(),
                    pass: (process.env.EMAIL_PASS || '').replace(/['"]/g, '').trim(), // App Password
                },
                connectionTimeout: 30000, // 30s
                greetingTimeout: 30000,
                socketTimeout: 45000,
                // Force IPv4 via custom DNS lookup (most reliable method for Node.js/Render)
                lookup: (hostname: any, options: any, callback: any) => {
                    dns.lookup(hostname, { family: 4 }, callback);
                },
                tls: {
                    rejectUnauthorized: false,
                    // minVersion: 'TLSv1.2' // Optional: ensure modern TLS
                }
            } as any);
        } else {
            _transporter = nodemailer.createTransport({
                host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
                port: Number(process.env.BREVO_SMTP_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.BREVO_SMTP_USER,
                    pass: process.env.BREVO_SMTP_PASS,
                },
                connectionTimeout: 10_000,
                greetingTimeout: 5_000,
                socketTimeout: 10_000,
            } as any);
        }
        _transporterKey = key;
    }
    return _transporter;
}

// ── Verify SMTP on startup (non-blocking) ─────────────────────────────────────
setImmediate(() => {
    const provider = process.env.EMAIL_USER ? 'Gmail' : 'Brevo';
    const ready = process.env.EMAIL_USER
        ? !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
        : !!(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS);
    if (!ready) return;
    getTransporter().verify()
        .then(() => console.log(`[email] ✅ SMTP connection verified (${provider})`))
        .catch(err => console.error(`[email] ❌ SMTP verification failed (${provider}):`, err?.message));
});

// ── Read at call time — never at module load ──────────────────────────────────
function getFromAddress(): string {
    const from = process.env.EMAIL_FROM?.replace(/['"]/g, '') 
        || (process.env.EMAIL_USER 
            ? `AlgoAscent <${process.env.EMAIL_USER.replace(/['"]/g, '')}>` 
            : 'AlgoAscent <a88762001@smtp-brevo.com>');
    
    return from;
}

function getFrontendUrl(): string {
    return process.env.FRONTEND_URL || 'https://progresss-tracker.vercel.app';
}

// ── Guard — skip if SMTP not configured ──────────────────────────────────────
/**
 * Checks if email credentials are set in environment variables.
 * Exported for diagnostic tools (health check).
 */
export function isEmailEnabled(): boolean {
    const gmailUser = (process.env.EMAIL_USER || '').replace(/['"]/g, '').trim();
    const gmailPass = (process.env.EMAIL_PASS || '').replace(/['"]/g, '').trim();
    const hasGmail = !!(gmailUser && gmailPass);
    
    const brevoUser = (process.env.BREVO_SMTP_USER || '').replace(/['"]/g, '').trim();
    const brevoPass = (process.env.BREVO_SMTP_PASS || '').replace(/['"]/g, '').trim();
    const hasBrevo = !!(brevoUser && brevoPass);
    
    if (hasGmail || hasBrevo) return true;

    // Log helpful warnings only once on first check
    if (!gmailUser && !brevoUser) {
        console.warn('[email] ⚠️ No SMTP credentials (EMAIL_USER or BREVO_SMTP_USER) — email service disabled');
    } else {
        if (gmailUser && !gmailPass) console.warn('[email] ⚠️ Gmail set but EMAIL_PASS is missing');
        if (brevoUser && !brevoPass) console.warn('[email] ⚠️ Brevo set but BREVO_SMTP_PASS is missing');
    }
    
    return false;
}



// ── Core send helper ──────────────────────────────────────────────────────────
interface SendOptions {
    to: string;
    subject: string;
    html: string;
    tag: string;
}

async function send(opts: SendOptions): Promise<boolean> {
    if (!isEmailEnabled()) {
        console.warn(`[email:${opts.tag}] Email skipped: SMTP not configured.`);
        return false;
    }

    const from = getFromAddress();
    console.log(`[email:${opts.tag}] Attempting to send → ${opts.to} | Subject: ${opts.subject}`);

    try {
        const transporter = getTransporter();
        const info = await transporter.sendMail({
            from,
            to: opts.to,
            subject: opts.subject,
            html: opts.html,
        });

        console.log(`[email:${opts.tag}] ✅ SMTP Server Accepted → ${opts.to}`);
        console.log(`[email:${opts.tag}]    MessageID: ${info.messageId}`);
        console.log(`[email:${opts.tag}]    Response: ${info.response}`);
        
        if (info.rejected && info.rejected.length > 0) {
            console.warn(`[email:${opts.tag}] ⚠️ Rejected recipients: ${info.rejected.join(', ')}`);
        }
        
        return true;

    } catch (err: any) {
        console.error(`[email:${opts.tag}] ❌ Failed → ${opts.to}`);
        console.error(`[email:${opts.tag}]    Error: ${err?.message ?? err}`);
        if (err?.code === 'EAUTH') {
            console.error(`[email:${opts.tag}]    Authentication failed. Check EMAIL_USER/PASS or BREVO credentials.`);
        }
        // Reset transporter so next call gets a fresh connection
        _transporter = null;
        return false;
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API — identical signatures to the old Resend service
// ─────────────────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    return await send({
        to: email,
        subject: `Welcome to AlgoAscent, ${username}! 🚀`,
        html: welcomeTemplate(username),
        tag: 'welcome',
    });
}


export async function sendPasswordResetEmail(email: string, username: string): Promise<boolean> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordResetTokenModel.deleteMany({ email });
    await PasswordResetTokenModel.create({ email, token: hashedToken, expiresAt });

    const resetUrl = `${getFrontendUrl()}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    return send({
        to: email,
        subject: 'Reset your AlgoAscent password',
        html: passwordResetTemplate(username, resetUrl),
        tag: 'password-reset',
    });
}

export async function verifyPasswordResetToken(rawToken: string, email: string): Promise<string | null> {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const record = await PasswordResetTokenModel.findOne({
        email,
        token: hashedToken,
        expiresAt: { $gt: new Date() },
    });
    return record ? record.email : null;
}

export async function consumePasswordResetToken(rawToken: string, email: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    await PasswordResetTokenModel.deleteOne({ email, token: hashedToken });
}

export async function sendVerificationEmail(email: string, username: string): Promise<void> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const verifyUrl = `${getFrontendUrl()}/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await send({
        to: email,
        subject: 'Verify your AlgoAscent email address',
        html: emailVerificationTemplate(username, verifyUrl),
        tag: 'verify-email',
    });
}

/**
 * Send account deactivation notification.
 * Called after admin deactivates a user.
 */
export async function sendAccountDeactivatedEmail(email: string, username: string): Promise<boolean> {
    return await send({
        to: email,
        subject: 'Your AlgoAscent account has been deactivated',
        html: accountDeactivatedTemplate(username),
        tag: 'account-deactivated',
    });
}


/**
 * Send account activation notification.
 * Called after admin reactivates a user.
 */
export async function sendAccountActivatedEmail(email: string, username: string): Promise<boolean> {
    return await send({
        to: email,
        subject: 'Your AlgoAscent account has been reactivated',
        html: accountActivatedTemplate(username),
        tag: 'account-activated',
    });
}

