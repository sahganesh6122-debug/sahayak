import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { patientApi } from '../../services/api';
import { Question } from '../../types';
import { MicDictationButton } from '../../components/MicDictationButton';

const AdaptiveQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { chiefComplaint, caseId, adaptiveAnswers, setAdaptiveAnswers, setHistoryAnswers } = useAppContext();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const qList = await patientApi.getAdaptiveQuestions(caseId || 'temp', chiefComplaint);
        setQuestions(qList);
      } catch {
        setQuestions([
          { question_key: 'q1', question_text: 'On a scale of 1-10, how severe is the discomfort?', question_type: 'scale' },
          { question_key: 'q2', question_text: 'Does this symptom radiate anywhere else?', question_type: 'boolean' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [chiefComplaint, caseId]);

  const currentQuestion = questions[currentQ];
  const currentAnswer = currentQuestion ? adaptiveAnswers[currentQuestion.question_key] : '';

  const handleAnswer = (value: any) => {
    if (!currentQuestion) return;
    setAdaptiveAnswers((prev) => ({
      ...prev,
      [currentQuestion.question_key]: value
    }));
    // Also mirror to history answers for doctor view
    setHistoryAnswers((prev) => ({
      ...prev,
      [currentQuestion.question_text]: String(value)
    }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      navigate('/patient/red-flags');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-primary)' }}>
        <Bot size={40} className="animate-spin" />
        <div style={{ marginTop: '16px', fontWeight: 600 }}>Generating adaptive questions based on your complaint...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <p>No additional questions required. Proceeding to clinical triage check.</p>
        <button
          onClick={() => navigate('/patient/red-flags')}
          style={{ marginTop: '16px', padding: '10px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ color: 'var(--color-neutral-600)', marginBottom: '8px' }}>Step 6 of 12</div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', borderRadius: '16px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
        <Sparkles size={14} />
        <span>Adaptive Clinical Protocol generated for: "{chiefComplaint || 'Reported Symptoms'}"</span>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-navy)' }}>
        A few targeted follow-up questions
      </h2>
      <p style={{ color: 'var(--color-neutral-600)', fontSize: '14px', marginTop: '4px' }}>
        These help your doctor pinpoint the cause before your consultation.
      </p>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-neutral-200)', borderRadius: '4px', marginTop: '20px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((currentQ + 1) / questions.length) * 100}%`, backgroundColor: 'var(--color-primary)', transition: 'width 0.3s ease' }} />
      </div>

      {/* Question Card */}
      <div style={{ marginTop: '24px', padding: '32px', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '8px' }}>
          QUESTION {currentQ + 1} OF {questions.length}
        </div>
        <h3 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '24px' }}>
          {currentQuestion.question_text}
        </h3>

        {/* Scale Question */}
        {currentQuestion.question_type === 'scale' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>1 (Mild)</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}>
                {currentAnswer || 5} / 10
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>10 (Severe)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={currentAnswer || 5}
              onChange={(e) => handleAnswer(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
          </div>
        )}

        {/* Boolean Question */}
        {currentQuestion.question_type === 'boolean' && (
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Yes', 'No'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleAnswer(opt)}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '10px',
                  border: currentAnswer === opt ? '2px solid var(--color-primary)' : '1px solid var(--color-neutral-200)',
                  backgroundColor: currentAnswer === opt ? 'var(--color-primary-light)' : 'white',
                  color: currentAnswer === opt ? 'var(--color-primary-dark)' : 'var(--color-neutral-800)',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Choice Question */}
        {currentQuestion.question_type === 'choice' && currentQuestion.options && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {currentQuestion.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleAnswer(opt)}
                style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: currentAnswer === opt ? '2px solid var(--color-primary)' : '1px solid var(--color-neutral-200)',
                  backgroundColor: currentAnswer === opt ? 'var(--color-primary-light)' : 'white',
                  color: currentAnswer === opt ? 'var(--color-primary-dark)' : 'var(--color-neutral-800)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Text Question with Voice Dictation */}
        {currentQuestion.question_type === 'text' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
              <MicDictationButton
                onTranscript={(spoken) => {
                  handleAnswer(currentAnswer ? `${currentAnswer} ${spoken}` : spoken);
                }}
                title="Dictate response"
              />
            </div>
            <input
              type="text"
              value={currentAnswer || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Your answer (type or click mic to speak)..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--color-neutral-200)',
                fontSize: '15px'
              }}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid var(--color-neutral-200)',
              backgroundColor: 'white',
              color: 'var(--color-neutral-600)',
              cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{currentQ < questions.length - 1 ? 'Next Question' : 'Proceed to Triage Check'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveQuestions;
