/**
 * scripts/test-email.ts
 * Standalone Email Delivery Test — Brevo Transactional API (HTTPS)
 *
 * Usage:
 *   npx tsx scripts/test-email.ts your@email.com
 */

import 'dotenv/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

const to = process.argv[2];

if (!to || !to.includes('@')) {
    console.error('Usage: npx tsx scripts/test-email.ts your@email.com');
    process.exit(1);
}

console.log('\n🔍 Brevo API Delivery Diagnostics');
console.log('─'.repeat(50));
console.log(`  BREVO_API_KEY : ${process.env.BREVO_API_KEY ? '✅ present' : '❌ MISSING'}`);
console.log(`  EMAIL_FROM    : ${process.env.EMAIL_FROM ?? '⚠️  not set'}`);
console.log(`  Sending to    : ${to}`);
console.log('─'.repeat(50) + '\n');

async function run() {
    const key = (process.env.BREVO_API_KEY || '').replace(/['"]/g, '').trim();
    if (!key) {
        console.error('❌ BREVO_API_KEY missing. Check your .env file.');
        process.exit(1);
    }

    // Configure SDK
    const defaultClient = (SibApiV3Sdk as any).default.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = key;

    const apiInstance = new (SibApiV3Sdk as any).default.TransactionalEmailsApi();
    const sendSmtpEmail = new (SibApiV3Sdk as any).default.SendSmtpEmail();

    // From Details
    const fromStr = (process.env.EMAIL_FROM || '').replace(/['"]/g, '').trim() || 'AlgoAscent <a88762001@smtp-brevo.com>';
    const match = fromStr.match(/(.*)<(.*)>/);
    const sender = match ? { name: match[1].trim(), email: match[2].trim() } : { name: 'AlgoAscent', email: fromStr };

    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = 'Test: AlgoAscent via Brevo HTTPS API';
    sendSmtpEmail.htmlContent = `
        <div style="font-family:sans-serif;padding:24px;background:#111;color:#eee;border-radius:12px">
            <h2 style="color:#D4AF37">✅ API delivery test successful</h2>
            <p>This email was sent via the Brevo Transactional API (HTTPS), bypassing SMTP restrictions.</p>
            <p style="color:#888;font-size:12px">Sent at: ${new Date().toISOString()}</p>
        </div>
    `;

    console.log('📤 Sending API request...');
    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Success! MessageID: ${data.messageId}`);
        console.log('\n📬 Check your inbox!\n');
    } catch (err: any) {
        console.error('❌ API Error:', err?.response?.body?.message || err.message || err);
        process.exit(1);
    }
}

run();
