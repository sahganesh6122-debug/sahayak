import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface MicDictationButtonProps {
  onTranscript: (text: string) => void;
  size?: number;
  title?: string;
}

export const MicDictationButton: React.FC<MicDictationButtonProps> = ({
  onTranscript,
  size = 18,
  title = 'Click to dictate with voice'
}) => {
  const { language } = useAppContext();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          onTranscript(text.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Field mic error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Mic error:', err);
      setIsRecording(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleRecording}
      title={isRecording ? 'Listening... Click to stop' : title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 10px',
        borderRadius: '6px',
        border: isRecording ? '1px solid var(--color-danger)' : '1px solid var(--color-neutral-200)',
        backgroundColor: isRecording ? '#fee2e2' : 'var(--color-neutral-100)',
        color: isRecording ? 'var(--color-danger)' : 'var(--color-primary)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        animation: isRecording ? 'pulse 1s infinite' : 'none'
      }}
    >
      {isRecording ? <MicOff size={size} /> : <Mic size={size} />}
    </button>
  );
};
