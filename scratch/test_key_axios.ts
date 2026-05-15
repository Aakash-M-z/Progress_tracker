import axios from 'axios';
import 'dotenv/config';

async function testKey() {
    const key = (process.env.BREVO_API_KEY || '').replace(/['"]/g, '').trim();
    console.log('Testing key:', key.substring(0, 10) + '...');
    try {
        const response = await axios.get('https://api.brevo.com/v3/account', {
            headers: {
                'api-key': key
            }
        });
        console.log('Success:', response.data);
    } catch (err: any) {
        console.log('Error:', err.response?.data || err.message);
    }
}

testKey();
