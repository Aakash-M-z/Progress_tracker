import 'dotenv/config';
import nodemailer from 'nodemailer';

async function test() {
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        console.log('Verifying...');
        await transporter.verify();
        console.log('✅ SMTP verified!');
        
        console.log('Sending test mail to aakashext@gmail.com...');
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: 'aakashext@gmail.com',
            subject: 'SMTP Test',
            text: 'If you see this, Gmail SMTP is working!'
        });
        console.log('✅ Test mail sent!');
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

test();
