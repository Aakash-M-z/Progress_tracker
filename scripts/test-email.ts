/**
 * scripts/test-email.ts
 * Standalone Email Delivery Test — Brevo + Gmail
 *
 * Usage:
 *   npx tsx scripts/test-email.ts your@email.com
 */

import 'dotenv/config';
import nodemailer from 'nodemailer';

const to = process.argv[2];

if (!to || !to.includes('@')) {
    console.error('Usage: npx tsx scripts/test-email.ts your@email.com');
    process.exit(1);
}

console.log('\n🔍 SMTP Delivery Diagnostics');
console.log('─'.repeat(50));
console.log(`  BREVO_USER : ${process.env.BREVO_SMTP_USER ?? '❌ not set'}`);
console.log(`  BREVO_PASS : ${process.env.BREVO_SMTP_PASS ? '✅ present' : '❌ MISSING'}`);
console.log(`  GMAIL_USER : ${process.env.EMAIL_USER ?? '❌ not set'}`);
console.log(`  GMAIL_PASS : ${process.env.EMAIL_PASS ? '✅ present' : '❌ not set'}`);
console.log(`  EMAIL_FROM : ${process.env.EMAIL_FROM ?? '⚠️  not set'}`);
console.log(`  Sending to : ${to}`);
console.log('─'.repeat(50) + '\n');

async function run() {
    let success = false;

    // 1. Try Brevo (Primary)
    if (process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS) {
        console.log('📤 Attempting Brevo SMTP (Primary)...');
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
                port: Number(process.env.BREVO_SMTP_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.BREVO_SMTP_USER,
                    pass: process.env.BREVO_SMTP_PASS,
                },
                connectionTimeout: 10000,
            });
            await transporter.verify();
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.BREVO_SMTP_USER,
                to,
                subject: 'Test: AlgoAscent via Brevo',
                html: `<h1>Brevo Test</h1><p>Sent at: ${new Date().toISOString()}</p>`,
            });
            console.log(`✅ Brevo Success! MsgID: ${info.messageId}`);
            success = true;
        } catch (err: any) {
            console.error(`❌ Brevo failed: ${err.message}`);
        }
    }

    if (success) return;

    // 2. Try Gmail SMTP (Fallback)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('📤 Falling back to Gmail SMTP (Port 465)...');
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            await transporter.verify();
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to,
                subject: 'Test: AlgoAscent via Gmail Fallback',
                html: `<h1>Gmail Fallback Test</h1><p>Sent at: ${new Date().toISOString()}</p>`,
            });
            console.log(`✅ Gmail Success! MsgID: ${info.messageId}`);
            success = true;
        } catch (err: any) {
            console.error(`❌ Gmail SMTP failed: ${err.message}`);
        }
    }

    if (!success) {
        console.error('\n💀 All delivery attempts failed. Check credentials.');
        process.exit(1);
    }

    console.log('\n📬 Check your inbox!\n');
}

run();
