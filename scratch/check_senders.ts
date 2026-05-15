import axios from 'axios';
import 'dotenv/config';

async function checkSenders() {
    const key = (process.env.BREVO_API_KEY || '').replace(/['"]/g, '').trim();
    try {
        const response = await axios.get('https://api.brevo.com/v3/senders', {
            headers: { 'api-key': key }
        });
        console.log('Verified Senders:', response.data.senders.map((s: any) => s.email));
    } catch (err: any) {
        console.log('Error:', err.response?.data || err.message);
    }
}

checkSenders();
