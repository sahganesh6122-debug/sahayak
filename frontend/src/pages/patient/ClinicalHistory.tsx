import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, Mic, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { MicDictationButton } from '../../components/MicDictationButton';
import { SmartConversationalVoiceIntake } from '../../components/SmartConversationalVoiceIntake';

const ClinicalHistory: React.FC = () => {
  const navigate = useNavigate();
  const { historyAnswers, setHistoryAnswers, voiceIntakeData } = useAppContext();
  const [activeSection, setActiveSection] = useState(0);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const sections = [
    { title: 'Presenting Complaint', questions: ['When did it start?', 'Is it continuous?'] },
    { title: 'Onset & Duration', questions: ['Did it start suddenly?'] },
    { title: 'Location & Character', questions: ['Where exactly is the pain?'] },
    { title: 'Severity', questions: ['How severe is it on a scale of 1-10?'] },
    { title: 'Aggravating & Relieving Factors', questions: ['What makes it better or worse?'] },
    { title: 'Associated Symptoms', questions: ['Any fever or vomiting?'] },
    { title: 'Past Medical History', questions: ['Any previous medical conditions?'] },
    { title: 'Medication & Allergies', questions: ['Are you taking any medications?'] },
    { title: 'Family History', questions: ['Any similar conditions in the family?'] },
    { title: 'Ayurveda History (Optional — Prototype Fields)', questions: ['Prakriti', 'Dietary habits', 'Sleep pattern', 'Exercise level'] }
  ];

  const handleAnswerChange = (question: string, value: string) => {
    setHistoryAnswers((prev) => ({
      ...prev,
      [question]: value
    }));
  };

  const handleNext = () => {
    if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
    } else {
      navigate('/patient/adaptive-questions');
    }
  };

  const handleBack = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    } else {
      navigate('/patient/chief-complaint');
    }
  };

  // Count answered questions
  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const answeredCount = sections.reduce(
    (acc, s) => acc + s.questions.filter((q) => (historyAnswers[q] || '').trim().length > 0).length,
    0
  );

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ color: 'var(--color-neutral-600)', fontSize: '14px' }}>Step 5 of 12</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-neutral-600)', fontWeight: 600 }}>
            {answeredCount} of {totalQuestions} answered
          </span>
          {voiceIntakeData && (
            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Voice Auto-Filled
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-navy)' }}>Structured Clinical History</h2>
          <p style={{ color: 'var(--color-neutral-600)', fontSize: '14px', marginTop: '4px' }}>
            Review or update your answers below. You can also tap the microphone on any field to dictate.
          </p>
        </div>

        {/* Voice Auto-Fill Trigger Button */}
        <button
          type="button"
          onClick={() => setShowVoiceModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary)',
            color: 'var(--color-primary-dark)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Mic size={16} />
          <span>{voiceIntakeData ? 'Re-take Voice Intake' : '🎙️ Auto-Fill with Voice Intake'}</span>
        </button>
      </div>

      {/* Voice Intake Banner if data was populated */}
      {voiceIntakeData && (
        <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#059669" />
            <span style={{ fontSize: '13px', color: '#065f46', fontWeight: 600 }}>
              Answers have been pre-filled from your spoken voice intake! You can edit any field or click Save & Continue.
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-neutral-200)', borderRadius: '4px', marginTop: '20px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((activeSection + 1) / sections.length) * 100}%`, backgroundColor: 'var(--color-primary)', transition: 'width 0.3s ease' }} />
      </div>

      {/* Voice Intake Modal */}
      {showVoiceModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <SmartConversationalVoiceIntake
              onCompleted={() => setShowVoiceModal(false)}
              onCancel={() => setShowVoiceModal(false)}
            />
          </div>
        </div>
      )}

      {/* Section List Accordion */}
      <div style={{ marginTop: '24px' }}>
        {sections.map((section, idx) => {
          const sectionAnswersCount = section.questions.filter((q) => (historyAnswers[q] || '').trim().length > 0).length;
          const isSectionComplete = sectionAnswersCount === section.questions.length;

          return (
            <div
              key={idx}
              style={{
                marginBottom: '14px',
                border: activeSection === idx ? '1px solid var(--color-primary)' : '1px solid var(--color-neutral-200)',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: 'var(--color-surface)',
                boxShadow: activeSection === idx ? '0 2px 8px rgba(11, 114, 133, 0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                onClick={() => setActiveSection(idx)}
                style={{
                  padding: '16px 20px',
                  backgroundColor: activeSection === idx ? 'var(--color-primary-light)' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: activeSection === idx ? 'var(--color-primary-dark)' : 'var(--color-navy)'
                }}
              >
                <span>{idx + 1}. {section.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSectionComplete && (
                    <span style={{ fontSize: '11px', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                      ✓ Completed
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: 'var(--color-neutral-600)', fontWeight: 500 }}>
                    {sectionAnswersCount}/{section.questions.length}
                  </span>
                </div>
              </div>

              {activeSection === idx && (
                <div style={{ padding: '20px', borderTop: '1px solid var(--color-neutral-200)', backgroundColor: 'white' }}>
                  {section.questions.map((q, qIdx) => {
                    const currentAnswer = historyAnswers[q] || '';
                    const isVoicePopulated = Boolean(voiceIntakeData?.history_answers?.[q]);

                    return (
                      <div key={qIdx} style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                            {q}
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isVoicePopulated && currentAnswer && (
                              <span style={{ fontSize: '11px', color: '#047857', backgroundColor: '#d1fae5', padding: '1px 6px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Sparkles size={11} /> Voice auto-filled
                              </span>
                            )}
                            <MicDictationButton
                              onTranscript={(spoken) => {
                                handleAnswerChange(q, currentAnswer ? `${currentAnswer} ${spoken}` : spoken);
                              }}
                              title={`Dictate answer for "${q}"`}
                            />
                          </div>
                        </div>

                        {q === 'Prakriti' ? (
                          <select
                            value={currentAnswer || 'Vata-Pitta'}
                            onChange={(e) => handleAnswerChange(q, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--color-neutral-200)',
                              fontSize: '14px',
                              backgroundColor: 'white'
                            }}
                          >
                            <option>Vata</option>
                            <option>Pitta</option>
                            <option>Kapha</option>
                            <option>Vata-Pitta</option>
                            <option>Pitta-Kapha</option>
                            <option>Vata-Kapha</option>
                            <option>Tridosha</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(q, e.target.value)}
                            placeholder="Type or click mic icon to speak..."
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--color-neutral-200)',
                              fontSize: '14px',
                              fontFamily: 'inherit'
                            }}
                          />
                        )}
                      </div>
                    );
                  })}

                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={handleBack}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: 'var(--color-neutral-600)',
                        border: '1px solid var(--color-neutral-200)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      style={{
                        padding: '10px 24px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{activeSection < sections.length - 1 ? 'Save & Next Section' : 'Proceed to Adaptive Questions'}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClinicalHistory;
