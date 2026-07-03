import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceAssistantHook {
    isListening: boolean;
    isSpeaking: boolean;
    transcript: string;
    resetTranscript: () => void;
    startListening: () => void;
    stopListening: () => void;
    speak: (text: string) => void;
    stopSpeaking: () => void;
    supported: {
        recognition: boolean;
        synthesis: boolean;
    };
    error: string | null;
}

export const useVoiceAssistant = (): VoiceAssistantHook => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => {
                console.error('Speech Recognition Error:', event.error);
                if (event.error !== 'no-speech') {
                    setError(`Error: ${event.error}`);
                    setIsListening(false);
                }
            };

            recognition.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
                
                // Wake word detection: "Hey Dora" or "Dora"
                if (currentTranscript.toLowerCase().includes('dora')) {
                    // Logic to handle wake word can be triggered here or in the UI component
                }
            };

            recognitionRef.current = recognition;
        }

        // Initialize Speech Synthesis
        if ('speechSynthesis' in window) {
            synthesisRef.current = window.speechSynthesis;
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (synthesisRef.current) synthesisRef.current.cancel();
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            setTranscript('');
            setError(null);
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.warn('Recognition already started');
            }
        } else {
            setError('Speech Recognition not supported in this browser.');
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (synthesisRef.current) {
            // Cancel current speech
            synthesisRef.current.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Try to find a nice female voice (Dora)
            const voices = synthesisRef.current.getVoices();
            const preferredVoice = voices.find(v => 
                v.name.includes('Google US English') || 
                v.name.includes('Samantha') || 
                v.name.includes('Female')
            );
            
            if (preferredVoice) utterance.voice = preferredVoice;
            
            utterance.rate = 1.0;
            utterance.pitch = 1.1; // Slightly higher pitch for "Dora"

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            synthesisRef.current.speak(utterance);
        }
    }, []);

    const stopSpeaking = useCallback(() => {
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        isSpeaking,
        transcript,
        resetTranscript,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        supported: {
            recognition: !!recognitionRef.current,
            synthesis: !!synthesisRef.current
        },
        error
    };
};
