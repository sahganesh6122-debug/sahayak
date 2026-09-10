import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionHookOptions {
  language?: 'en' | 'hi' | 'te';
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
}

export function useSpeechRecognition(options: SpeechRecognitionHookOptions = {}) {
  const { language = 'en', continuous = true, interimResults = true, onResult } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  // Map app language code to BCP 47 language tag
  const getLanguageTag = (lang: 'en' | 'hi' | 'te') => {
    switch (lang) {
      case 'hi':
        return 'hi-IN';
      case 'te':
        return 'te-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. You can use preset samples or manual text.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = getLanguageTag(language);

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + item[0].transcript.trim();
          } else {
            currentInterim += item[0].transcript;
          }
        }
        setInterimTranscript(currentInterim);
        const combined = (finalTranscriptRef.current + (currentInterim ? ' ' + currentInterim : '')).trim();
        setTranscript(combined);
        if (onResult && combined) {
          onResult(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone permission in your browser.');
        } else if (event.error === 'no-speech') {
          // Normal timeout if user was silent, do not treat as fatal
        } else {
          setError(`Speech recognition notice: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('Failed to initialize speech recognition', err);
      setIsSupported(false);
      setError('Failed to initialize microphone service.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [language, continuous, interimResults]);

  const startListening = useCallback(() => {
    setError(null);
    if (!recognitionRef.current) {
      setError('Speech recognition is not available in this browser.');
      return;
    }
    try {
      recognitionRef.current.lang = getLanguageTag(language);
      recognitionRef.current.start();
    } catch (e: any) {
      // If already started, ignore or restart
      if (e.name !== 'InvalidStateError') {
        setError('Could not start microphone: ' + (e.message || 'unknown error'));
      }
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const setTranscriptText = useCallback((text: string) => {
    finalTranscriptRef.current = text;
    setTranscript(text);
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setTranscriptText
  };
}
