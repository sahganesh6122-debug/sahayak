import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  RefreshCw,
  FileText,
  User,
  HeartPulse,
  Activity,
  ArrowRight,
  ShieldAlert,
  Clock,
  MapPin,
  Pill,
  HelpCircle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { extractClinicalDataFromTranscript } from '../utils/voiceIntakeExtractor';
import { ExtractedClinicalData } from '../types';
import { patientApi } from '../services/api';

interface SmartConversationalVoiceIntakeProps {
  onCompleted?: (data: ExtractedClinicalData) => void;
  onCancel?: () => void;
  initialTranscript?: string;
}

const PRESET_STORIES = [
  {
    id: 'cardiac-en',
    title: '🔴 Cardiac / Chest Pain (Ramesh, 58M)',
    lang: 'en' as const,
    badge: 'Urgent Triage',
    text: 'Hello, my name is Ramesh Kumar, 58 years old male. For the last 2 days I have severe crushing chest pain that radiates to my left arm. It started suddenly yesterday morning, and pain level is 8 out of 10. I also feel shortness of breath, dizziness, and cold sweats. I have had high blood pressure for 5 years and take Amlodipine 5mg daily.'
  },
  {
    id: 'respiratory-hi',
    title: '🟢 Chronic Cough & Fever (Priya, 34F)',
    lang: 'hi' as const,
    badge: 'Routine OPD',
    text: 'मेरा नाम प्रिया शर्मा है, 34 साल महिला। मुझे 3 हफ्ते से लगातार खांसी और हल्का बुखार आ रहा है। रात में खांसी बढ़ जाती है और थोड़ा कफ निकलता है। मुझे धूल से एलर्जी है। मैं अभी कोई दवा नहीं ले रही हूँ।'
  },
  {
    id: 'gastric-te',
    title: '🟡 Epigastric Pain / Acidity (Suresh, 45M)',
    lang: 'te' as const,
    badge: 'Attention',
    text: 'నా పేరు సురేష్ రావు, వయస్సు 45 సంవత్సరాలు. గత 4 రోజులుగా కడుపులో విపరీతమైన మంట మరియు తీవ్రమైన నొప్పిగా ఉంది. ఆహారం తిన్న తర్వాత నొప్పి పెరుగుతుంది. కొద్దిగా తలతిరగడం మరియు బలహీనత ఉన్నాయి. గతంలో ఎలాంటి అనారోగ్యాలు లేవు.'
  },
  {
    id: 'neuro-en',
    title: '🔴 Severe Headache with Vomiting (Meena, 45F)',
    lang: 'en' as const,
    badge: 'Urgent Triage',
    text: 'My name is Meena Devi, 45 years old female. I have been suffering from severe throbbing headache for the past 2 days with persistent nausea and two episodes of vomiting. The severity is 8 out of 10, worse in bright light. No prior history of hypertension.'
  }
];

export const SmartConversationalVoiceIntake: React.FC<SmartConversationalVoiceIntakeProps> = ({
  onCompleted,
  onCancel,
  initialTranscript = ''
}) => {
  const { language, setLanguage, applyVoiceIntakeData } = useAppContext();
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'te'>(language || 'en');
  const [editableTranscript, setEditableTranscript] = useState(initialTranscript);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedClinicalData | null>(null);
  const [showHistoryPreview, setShowHistoryPreview] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const timerRef = useRef<any>(null);

  const {
    isListening,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    setTranscriptText
  } = useSpeechRecognition({
    language: selectedLang,
    continuous: true,
    interimResults: true,
    onResult: (liveText) => {
      setEditableTranscript(liveText);
    }
  });

  // Keep language in sync
  const handleLanguageChange = (lang: 'en' | 'hi' | 'te') => {
    if (isListening) stopListening();
    setSelectedLang(lang);
    setLanguage(lang);
  };

  // Timer for recording duration
  useEffect(() => {
    if (isListening) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  // Format seconds as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Run AI Extraction on transcript
  const handleProcessWithAI = async (textToProcess?: string) => {
    const targetText = (textToProcess || editableTranscript).trim();
    if (!targetText) {
      alert('Please speak or enter your health story before analyzing.');
      return;
    }

    if (isListening) {
      stopListening();
    }

    setIsProcessingAI(true);
    setAppliedSuccess(false);

    try {
      // 1. First run client-side extractor
      const localResult = extractClinicalDataFromTranscript(targetText, selectedLang);

      // 2. Try calling backend API if available, fallback gracefully to client result
      try {
        const backendResult = await patientApi.extractVoiceIntake?.(targetText, selectedLang);
        if (backendResult) {
          setExtractedData(backendResult);
          setIsProcessingAI(false);
          return;
        }
      } catch (err) {
        console.info('Backend API voice intake call completed or defaulted to client-side extraction.');
      }

      setExtractedData(localResult);
    } catch (err) {
      console.error('Error during clinical AI extraction:', err);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Load a preset demo story
  const handleLoadPreset = (preset: typeof PRESET_STORIES[0]) => {
    if (isListening) stopListening();
    setSelectedLang(preset.lang);
    setLanguage(preset.lang);
    setTranscriptText(preset.text);
    setEditableTranscript(preset.text);
    handleProcessWithAI(preset.text);
  };

  // Apply to context and continue
  const handleApply = () => {
    if (!extractedData) return;
    applyVoiceIntakeData(extractedData);
    setAppliedSuccess(true);
    if (onCompleted) {
      setTimeout(() => {
        onCompleted(extractedData);
      }, 600);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '16px',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: 'var(--shadow-lg)',
        padding: '28px',
        maxWidth: '920px',
        margin: '0 auto',
        animation: 'fadeInUp 0.3s ease-out'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', padding: '6px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '8px' }}>
              <Sparkles size={20} />
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-navy)' }}>
              Smart Conversational Voice Intake
            </h2>
          </div>
          <p style={{ marginTop: '6px', color: 'var(--color-neutral-600)', fontSize: '14px', maxWidth: '600px' }}>
            Speak freely in your preferred language. Our Clinical AI will transcribe, analyze symptoms, identify triage red-flags, and auto-populate your entire clinical history.
          </p>
        </div>

        {/* Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-neutral-100)', padding: '4px', borderRadius: '24px', border: '1px solid var(--color-neutral-200)' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-neutral-600)', paddingLeft: '8px', fontWeight: 600 }}>Lang:</span>
          {(['en', 'hi', 'te'] as const).map((langCode) => (
            <button
              key={langCode}
              type="button"
              onClick={() => handleLanguageChange(langCode)}
              style={{
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedLang === langCode ? 'var(--color-primary)' : 'transparent',
                color: selectedLang === langCode ? 'white' : 'var(--color-neutral-600)',
                transition: 'all 0.2s ease'
              }}
            >
              {langCode === 'en' ? 'English' : langCode === 'hi' ? 'हिंदी' : 'తెలుగు'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Demo Presets */}
      <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Volume2 size={16} color="var(--color-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
            1-Click Demo Patient Stories (Click to auto-simulate voice intake):
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESET_STORIES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLoadPreset(preset)}
              style={{
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-neutral-200)',
                backgroundColor: 'white',
                color: 'var(--color-neutral-800)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-neutral-200)')}
            >
              <span>{preset.title}</span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  backgroundColor: preset.badge.includes('Urgent') ? '#fee2e2' : preset.badge.includes('Attention') ? '#fef3c7' : '#dcfce7',
                  color: preset.badge.includes('Urgent') ? '#991b1b' : preset.badge.includes('Attention') ? '#92400e' : '#166534',
                  fontWeight: 700
                }}
              >
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Recorder & Audio Visualizer Section */}
      <div
        style={{
          marginTop: '20px',
          padding: '24px',
          borderRadius: '12px',
          backgroundColor: isListening ? '#f0fdf4' : 'var(--color-neutral-50)',
          border: isListening ? '2px solid var(--color-success)' : '1px solid var(--color-neutral-200)',
          textAlign: 'center',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          {/* Main Pulsing Record Button */}
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: isListening ? 'var(--color-danger)' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isListening ? '0 0 0 8px rgba(220, 38, 38, 0.25)' : '0 4px 12px rgba(11, 114, 133, 0.3)',
              transition: 'all 0.25s ease',
              animation: isListening ? 'pulse 1.2s infinite' : 'none'
            }}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>

          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: isListening ? 'var(--color-danger)' : 'var(--color-navy)' }}>
              {isListening ? `Listening in ${selectedLang.toUpperCase()} (${formatTime(recordingSeconds)})... Click to Stop` : 'Click Microphone to Start Speaking'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
              {isListening
                ? 'Speak in full sentences about what hurts, when it started, how bad it is, and any other symptoms.'
                : `Microphone language: ${selectedLang === 'en' ? 'English (India)' : selectedLang === 'hi' ? 'Hindi' : 'Telugu'}`}
            </div>
          </div>

          {/* Animated Audio Waveform (when active) */}
          {isListening && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '24px', margin: '4px 0' }}>
              {[18, 24, 14, 30, 22, 12, 28, 16, 26, 10, 20].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '4px',
                    height: `${h}px`,
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '2px',
                    animation: `pulse ${0.4 + (i % 4) * 0.2}s ease-in-out infinite alternate`
                  }}
                />
              ))}
            </div>
          )}

          {speechError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontSize: '13px', backgroundColor: '#fee2e2', padding: '6px 12px', borderRadius: '6px' }}>
              <AlertTriangle size={16} />
              <span>{speechError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Transcript Review Box */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} />
            <span>Spoken Transcript (Review & Edit):</span>
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {editableTranscript && (
              <button
                type="button"
                onClick={() => {
                  resetTranscript();
                  setEditableTranscript('');
                  setExtractedData(null);
                }}
                style={{
                  fontSize: '12px',
                  color: 'var(--color-neutral-600)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        <textarea
          value={editableTranscript}
          onChange={(e) => setEditableTranscript(e.target.value)}
          placeholder="Your spoken words will appear here in real-time... You can also edit or paste symptoms directly."
          style={{
            width: '100%',
            minHeight: '110px',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid var(--color-neutral-200)',
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--color-neutral-900)',
            backgroundColor: 'white',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />

        {/* Action button to trigger AI extraction */}
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => handleProcessWithAI()}
            disabled={!editableTranscript.trim() || isProcessingAI}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: editableTranscript.trim() && !isProcessingAI ? 'var(--color-primary)' : 'var(--color-neutral-200)',
              color: editableTranscript.trim() && !isProcessingAI ? 'white' : 'var(--color-neutral-600)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: editableTranscript.trim() && !isProcessingAI ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Sparkles size={16} />
            {isProcessingAI ? 'Analyzing with Clinical AI...' : 'Extract Clinical Data with AI'}
          </button>
        </div>
      </div>

      {/* AI Extraction Result Section */}
      {extractedData && (
        <div
          style={{
            marginTop: '28px',
            padding: '24px',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            animation: 'fadeInUp 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '12px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> AI Extraction Complete
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>
                Structured clinical history extracted from your voice
              </span>
            </div>
            {extractedData.red_flags.length > 0 && (
              <span
                style={{
                  backgroundColor: extractedData.red_flags.some((r) => r.severity === 'urgent') ? '#fee2e2' : '#fef3c7',
                  color: extractedData.red_flags.some((r) => r.severity === 'urgent') ? '#991b1b' : '#92400e',
                  padding: '4px 10px',
                  borderRadius: '14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ShieldAlert size={14} />
                {extractedData.red_flags.some((r) => r.severity === 'urgent') ? 'Urgent Triage Flag' : 'Attention Flag'}
              </span>
            )}
          </div>

          {/* Red Flag Alert Banner if detected */}
          {extractedData.red_flags.length > 0 && (
            <div
              style={{
                marginBottom: '20px',
                padding: '14px 18px',
                backgroundColor: extractedData.red_flags.some((r) => r.severity === 'urgent') ? '#fff1f2' : '#fffbeb',
                borderLeft: `4px solid ${extractedData.red_flags.some((r) => r.severity === 'urgent') ? '#e11d48' : '#f59e0b'}`,
                borderRadius: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 700, fontSize: '14px' }}>
                <AlertTriangle size={18} />
                <span>{extractedData.red_flags[0].flag_type}: {extractedData.red_flags[0].description}</span>
              </div>
              <p style={{ marginTop: '4px', fontSize: '13px', color: '#7f1d1d' }}>
                {extractedData.red_flags[0].reason}
              </p>
            </div>
          )}

          {/* Grid of Extracted Clinical Information */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {/* Demographics Card */}
            {extractedData.patient && (
              <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-neutral-200)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="var(--color-primary)" />
                  <span>Patient Demographics</span>
                </div>
                <div style={{ marginTop: '6px', fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  {extractedData.patient.full_name || 'Patient'}
                  {extractedData.patient.age ? `, ${extractedData.patient.age} yrs` : ''}
                  {extractedData.patient.gender ? ` (${extractedData.patient.gender})` : ''}
                </div>
              </div>
            )}

            {/* Chief Complaint */}
            <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-neutral-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HeartPulse size={14} color="var(--color-primary)" />
                <span>Chief Complaint</span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)' }}>
                {extractedData.chief_complaint}
              </div>
            </div>

            {/* Onset & Duration */}
            <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-neutral-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="var(--color-primary)" />
                <span>Onset & Duration</span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                {extractedData.onset_and_duration}
              </div>
            </div>

            {/* Location & Character */}
            <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-neutral-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--color-primary)" />
                <span>Location & Pain Type</span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                {extractedData.location_and_character}
              </div>
            </div>

            {/* Severity Rating */}
            <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-neutral-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={14} color="var(--color-primary)" />
                <span>Severity</span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '15px', fontWeight: 700, color: extractedData.severity?.includes('8') || extractedData.severity?.includes('Severe') ? 'var(--color-danger)' : 'var(--color-navy)' }}>
                {extractedData.severity}
              </div>
            </div>

            {/* Past History & Meds */}
            <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-neutral-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Pill size={14} color="var(--color-primary)" />
                <span>Past History & Meds</span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                {extractedData.past_medical_history}
                {extractedData.medications && extractedData.medications !== 'None reported' && (
                  <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)', marginTop: '2px' }}>
                    Meds: {extractedData.medications}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Associated Symptoms Badges */}
          {extractedData.associated_symptoms && extractedData.associated_symptoms.length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-600)' }}>Associated Symptoms:</span>
              {extractedData.associated_symptoms.map((sym, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary-dark)',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '12px'
                  }}
                >
                  {sym}
                </span>
              ))}
            </div>
          )}

          {/* Collapsible History Form Auto-Fill Preview */}
          <div style={{ marginTop: '18px', borderTop: '1px solid var(--color-neutral-200)', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={() => setShowHistoryPreview(!showHistoryPreview)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <HelpCircle size={15} />
              {showHistoryPreview ? 'Hide Auto-Filled Form Answers' : `View ${Object.keys(extractedData.history_answers).length} Auto-Filled Form Answers`}
            </button>

            {showHistoryPreview && (
              <div style={{ marginTop: '12px', display: 'grid', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '6px' }}>
                {Object.entries(extractedData.history_answers).map(([q, ans], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-neutral-200)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-neutral-800)' }}>{q}</span>
                    <span style={{ color: 'var(--color-primary-dark)', fontStyle: 'italic', textAlign: 'right', maxWidth: '60%' }}>{ans}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar: Apply to Case */}
          <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>
              {appliedSuccess ? (
                <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={16} /> Applied! Auto-filling your forms and proceeding...
                </span>
              ) : (
                'Click "Apply & Auto-Fill" to populate your entire case without typing.'
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-neutral-200)',
                    backgroundColor: 'white',
                    color: 'var(--color-neutral-800)',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={handleApply}
                disabled={appliedSuccess}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: appliedSuccess ? 'var(--color-success)' : 'var(--color-primary)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: appliedSuccess ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Sparkles size={18} />
                {appliedSuccess ? 'Applied to Case ✓' : '✨ Apply & Auto-Fill Form'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
