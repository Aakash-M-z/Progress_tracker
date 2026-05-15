/**
 * email.service.ts
 * AlgoAscent Email Service — Hybrid SMTP (Brevo + Gmail Fallback)
 *
 * Design principles:
 * - Priority: Brevo (SMTP Primary) -> Gmail (SMTP Fallback)
 * - Never throws — all errors caught and logged
 * - Fire-and-forget at call site (non-blocking)
 * - Lazy initialization of transporters
 * - Clean architecture with robust fallback logic
 */

import nodemailer, { Transporter } from 'nodemailer';
import dns from 'dns';
import crypto from 'crypto';

import { 
    welcomeTemplate, 
    passwordResetTemplate, 
    emailVerificationTemplate, 
    accountDeactivatedTemplate, 
    accountActivatedTemplate 
} from './email.templates.js';
import { PasswordResetTokenModel } from './models.js';

// ── Singletons ───────────────────────────────────────────────────────────────
let _primaryTransporter: Transporter | null = null;
let _fallbackTransporter: Transporter | null = null;

// ── Transporter Getters ───────────────────────────────────────────────────────

function getBrevoTransporter(): Transporter | null {
    const user = (process.env.BREVO_SMTP_USER || '').replace(/['"]/g, '').trim();
    const pass = (process.env.BREVO_SMTP_PASS || '').replace(/['"]/g, '').trim();
    
    if (!user || !pass) return null;

    if (!_primaryTransporter) {
        _primaryTransporter = nodemailer.createTransport({
            host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
            port: Number(process.env.BREVO_SMTP_PORT) || 587,
            secure: false,
            auth: { user, pass },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
        } as any);
    }
    return _primaryTransporter;
}

function getGmailTransporter(): Transporter | null {
    const user = (process.env.EMAIL_USER || '').replace(/['"]/g, '').trim();
    const pass = (process.env.EMAIL_PASS || '').replace(/['"]/g, '').trim();
    
    if (!user || !pass) return null;

    if (!_fallbackTransporter) {
        _fallbackTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user, pass },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
            lookup: (hostname: any, options: any, callback: any) => {
                dns.lookup(hostname, { family: 4 }, callback);
            },
            tls: { rejectUnauthorized: false }
        } as any);
    }
    return _fallbackTransporter;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getFromAddress(): string {
    return (process.env.EMAIL_FROM || '').replace(/['"]/g, '').trim() 
        || 'AlgoAscent <a88762001@smtp-brevo.com>';
}

function getFrontendUrl(): string {
    return process.env.FRONTEND_URL || 'https://progresss-tracker.vercel.app';
}

// ── Startup Diagnostics ──────────────────────────────────────────────────────
setImmediate(async () => {
    console.log('\n📧 [email] Initializing SMTP Service...');
    
    const brevo = getBrevoTransporter();
    const gmail = getGmailTransporter();

    if (brevo) {
        console.log('   ◈ Brevo : Primary (Ready)');
        brevo.verify()
            .then(() => console.log('   ✅ Brevo SMTP Verified'))
            .catch(e => console.error('   ❌ Brevo SMTP failed:', e.message));
    } else {
        console.warn('   ◈ Brevo : Not configured (Missing credentials)');
    }

    if (gmail) {
        console.log('   ◈ Gmail : Fallback (Ready)');
    } else {
        console.log('   ◈ Gmail : Not configured');
    }

    if (!brevo && !gmail) {
        console.error('   ❌ CRITICAL: No SMTP providers configured!');
    }
    console.log('');
});

// ── Core Delivery Logic ──────────────────────────────────────────────────────

interface SendOptions {
    to: string;
    subject: string;
    html: string;
    tag: string;
}

async function send(opts: SendOptions): Promise<boolean> {
    const from = getFromAddress();
    const brevo = getBrevoTransporter();
    const gmail = getGmailTransporter();

    console.log(`[email:${opts.tag}] Attempting send to: ${opts.to}`);

    // 1. TRY BREVO (Primary)
    if (brevo) {
        try {
            const info = await brevo.sendMail({
                from,
                to: opts.to,
                subject: opts.subject,
                html: opts.html,
            });
            console.log(`[email:${opts.tag}] ✅ Sent via Brevo (MsgID: ${info.messageId})`);
            return true;
        } catch (err: any) {
            console.error(`[email:${opts.tag}] ⚠️ Brevo failed: ${err.message}`);
            // If primary fails, we fall through to Gmail
        }
    }

    // 2. TRY GMAIL (Fallback)
    if (gmail) {
        console.log(`[email:${opts.tag}] 🔄 Falling back to Gmail SMTP...`);
        try {
            const info = await gmail.sendMail({
                from,
                to: opts.to,
                subject: opts.subject,
                html: opts.html,
            });
            console.log(`[email:${opts.tag}] ✅ Sent via Gmail (MsgID: ${info.messageId})`);
            return true;
        } catch (err: any) {
            console.error(`[email:${opts.tag}] ❌ Gmail fallback failed: ${err.message}`);
        }
    }

    console.error(`[email:${opts.tag}] 💀 All delivery attempts failed.`);
    return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API (Fire-and-forget)
// ─────────────────────────────────────────────────────────────────────────────

export function isEmailEnabled(): boolean {
    return !!(process.env.BREVO_SMTP_USER || process.env.EMAIL_USER);
}

export async function sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    return send({
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

    try {
        await PasswordResetTokenModel.deleteMany({ email });
        await PasswordResetTokenModel.create({ email, token: hashedToken, expiresAt });
    } catch (e) {
        console.error('[email:password-reset] Database error:', e);
    }

    const resetUrl = `${getFrontendUrl()}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    return send({
        to: email,
        subject: 'Reset your AlgoAscent password',
        html: passwordResetTemplate(username, resetUrl),
        tag: 'password-reset',
    });
}

export async function sendVerificationEmail(email: string, username: string): Promise<void> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const verifyUrl = `${getFrontendUrl()}/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;

    send({
        to: email,
        subject: 'Verify your AlgoAscent email address',
        html: emailVerificationTemplate(username, verifyUrl),
        tag: 'verify-email',
    });
}

export async function sendAccountDeactivatedEmail(email: string, username: string): Promise<boolean> {
    return send({
        to: email,
        subject: 'Your AlgoAscent account has been deactivated',
        html: accountDeactivatedTemplate(username),
        tag: 'account-deactivated',
    });
}

export async function sendAccountActivatedEmail(email: string, username: string): Promise<boolean> {
    return send({
        to: email,
        subject: 'Your AlgoAscent account has been reactivated',
        html: accountActivatedTemplate(username),
        tag: 'account-activated',
    });
}

// Token Verification Helpers
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
