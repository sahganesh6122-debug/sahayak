import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Mic, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { SmartConversationalVoiceIntake } from '../../components/SmartConversationalVoiceIntake';
import { MicDictationButton } from '../../components/MicDictationButton';

const ChiefComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { chiefComplaint, setChiefComplaint, voiceIntakeData } = useAppContext();

  // Mode: 'voice' (default recommended) or 'manual'
  const [activeTab, setActiveTab] = useState<'voice' | 'manual'>('voice');
  const [complaintText, setComplaintText] = useState(chiefComplaint || '');

  const chips = [
    'Severe chest pain radiating to arm',
    'Persistent cough for 3 weeks',
    'Throbbing headache with nausea',
    'Burning epigastric pain',
    'Knee and joint stiffness',
    'High fever with chills'
  ];

  const handleContinue = () => {
    setChiefComplaint(complaintText);
    navigate('/patient/clinical-history');
  };

  const handleVoiceCompleted = () => {
    // Navigate directly to clinical history with auto-filled answers
    navigate('/patient/clinical-history');
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ color: 'var(--color-neutral-600)', fontSize: '14px' }}>Step 4 of 12</span>
        {voiceIntakeData && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-success)', fontWeight: 600, backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
            <CheckCircle2 size={13} /> Voice Intake Active
          </span>
        )}
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '8px' }}>
        What brings you to the clinic today?
      </h2>
      <p style={{ color: 'var(--color-neutral-600)', fontSize: '15px', marginBottom: '20px' }}>
        You can speak your story freely in your own language or type your symptoms manually.
      </p>

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('voice')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            border: activeTab === 'voice' ? '1px solid var(--color-primary)' : '1px solid transparent',
            backgroundColor: activeTab === 'voice' ? 'var(--color-primary-light)' : 'transparent',
            color: activeTab === 'voice' ? 'var(--color-primary-dark)' : 'var(--color-neutral-600)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <Mic size={18} />
          <span>Smart Voice Intake (Recommended)</span>
          <span style={{ fontSize: '10px', backgroundColor: 'var(--color-primary)', color: 'white', padding: '2px 6px', borderRadius: '8px' }}>AI Auto-fill</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            border: activeTab === 'manual' ? '1px solid var(--color-primary)' : '1px solid transparent',
            backgroundColor: activeTab === 'manual' ? 'var(--color-primary-light)' : 'transparent',
            color: activeTab === 'manual' ? 'var(--color-primary-dark)' : 'var(--color-neutral-600)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <Edit3 size={18} />
          <span>Type Manually</span>
        </button>
      </div>

      {/* Mode 1: Smart Conversational Voice Intake */}
      {activeTab === 'voice' && (
        <div>
          <SmartConversationalVoiceIntake
            onCompleted={handleVoiceCompleted}
            initialTranscript={complaintText}
          />
        </div>
      )}

      {/* Mode 2: Manual Textarea with Dictation option */}
      {activeTab === 'manual' && (
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
              Describe your symptoms:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>Dictate into field:</span>
              <MicDictationButton
                onTranscript={(spoken) => {
                  setComplaintText((prev) => (prev ? `${prev} ${spoken}` : spoken));
                }}
              />
            </div>
          </div>

          <textarea
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="E.g. I have had severe chest pain and shortness of breath since yesterday morning..."
            style={{
              width: '100%',
              height: '140px',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--color-neutral-200)',
              resize: 'none',
              fontSize: '15px',
              lineHeight: 1.5,
              fontFamily: 'inherit'
            }}
          />
          <div style={{ textAlign: 'right', color: 'var(--color-neutral-600)', fontSize: '12px', marginTop: '4px' }}>
            {complaintText.length}/500 characters
          </div>

          {/* Quick Symptom Chips */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '8px' }}>
              Or choose common complaints:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setComplaintText(chip)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid var(--color-primary)',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary-dark)',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Continue button */}
          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleContinue}
              disabled={!complaintText.trim()}
              style={{
                padding: '12px 28px',
                backgroundColor: complaintText.trim() ? 'var(--color-primary)' : 'var(--color-neutral-200)',
                color: complaintText.trim() ? 'white' : 'var(--color-neutral-600)',
                border: 'none',
                borderRadius: '8px',
                cursor: complaintText.trim() ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Continue to Clinical History</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChiefComplaint;
