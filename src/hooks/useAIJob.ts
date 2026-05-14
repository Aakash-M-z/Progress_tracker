import { useState, useCallback } from 'react';
import axios from 'axios';
import { SessionManager } from '../utils/sessionManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function useAIJob() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any | null>(null);
    const [status, setStatus] = useState<'idle' | 'waiting' | 'completed' | 'failed'>('idle');

    const pollJobStatus = useCallback(async (jobId: string) => {
        setLoading(true);
        setStatus('waiting');
        
        const poll = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/ai/job-status/${jobId}`);
                const { status, result } = response.data;

                if (status === 'completed') {
                    setResult(result);
                    setStatus('completed');
                    setLoading(false);
                    return;
                }

                if (status === 'failed') {
                    setError('Job execution failed');
                    setStatus('failed');
                    setLoading(false);
                    return;
                }

                // Poll again after 2 seconds
                setTimeout(poll, 2000);
            } catch (err: any) {
                setError(err.message);
                setStatus('failed');
                setLoading(false);
            }
        };

        poll();
    }, []);

    const runJob = useCallback(async (endpoint: string, data: any) => {
        setLoading(true);
        setError(null);
        setResult(null);
        setStatus('idle');

        try {
            const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
                headers: {
                    'Authorization': `Bearer ${SessionManager.getToken()}`
                }
            });

            if (response.data.jobId) {
                pollJobStatus(response.data.jobId);
            } else if (response.data.reply || response.data.analysis) {
                // Handle legacy sync response if any
                setResult(response.data);
                setStatus('completed');
                setLoading(false);
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(msg);
            setLoading(false);
            setStatus('failed');
        }
    }, [pollJobStatus]);

    return { runJob, loading, error, result, status };
}
