import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Activity, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Timeline: React.FC = () => {
  const navigate = useNavigate();
  const { chiefComplaint, historyAnswers, voiceIntakeData, uploadedDocuments } = useAppContext();

  // Synthesize dynamic chronological events
  const onset = historyAnswers['When did it start?'] || voiceIntakeData?.onset_and_duration || '2 days ago';
  const character = historyAnswers['Where exactly is the pain?'] || voiceIntakeData?.location_and_character || chiefComplaint;
  const pastHistory = historyAnswers['Any previous medical conditions?'] || voiceIntakeData?.past_medical_history;

  const events = [
    ...(pastHistory && pastHistory !== 'None reported' && !pastHistory.includes('No prior')
      ? [
          {
            date: 'Prior History',
            type: 'chronic',
            title: 'Pre-existing Medical Condition',
            desc: `Diagnosed and treated for: ${pastHistory}`,
            icon: Activity,
            color: '#64748b',
            bg: '#f1f5f9'
          }
        ]
      : []),
    {
      date: onset,
      type: 'onset',
      title: 'Initial Symptom Onset',
      desc: `Patient noted start of symptoms: ${character}`,
      icon: Clock,
      color: 'var(--color-urgent)',
      bg: '#fee2e2'
    },
    ...(uploadedDocuments.length > 0
      ? [
          {
            date: 'Uploaded Today',
            type: 'document',
            title: `Medical Record: ${uploadedDocuments[0].file_name}`,
            desc: `Document Category: ${uploadedDocuments[0].document_type} with extracted lab parameters.`,
            icon: FileText,
            color: 'var(--color-primary)',
            bg: 'var(--color-primary-light)'
          }
        ]
      : []),
    {
      date: 'Today',
      type: 'current',
      title: 'AIIA OPD Clinical Intake Completed',
      desc: `Chief Complaint: "${chiefComplaint || 'Consultation intake'}". Prepared for doctor verification.`,
      icon: CheckCircle2,
      color: 'var(--color-success)',
      bg: '#dcfce7'
    }
  ];

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ color: 'var(--color-neutral-600)', marginBottom: '8px' }}>Step 10 of 12</div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-navy)' }}>Your Medical Timeline</h2>
      <p style={{ color: 'var(--color-neutral-600)', fontSize: '14px', marginTop: '4px' }}>
        A chronological sequence of your health history constructed from your voice intake and medical records:
      </p>

      <div style={{ marginTop: '32px', position: 'relative', paddingLeft: '32px', borderLeft: '3px solid var(--color-primary-light)' }}>
        {events.map((ev, idx) => {
          const IconComp = ev.icon;
          return (
            <div key={idx} style={{ position: 'relative', marginBottom: '28px' }}>
              {/* Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '-45px',
                  top: '4px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: ev.bg,
                  border: `2px solid ${ev.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconComp size={12} color={ev.color} />
              </div>

              {/* Date Header */}
              <div style={{ color: ev.color, fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} />
                <span>{ev.date}</span>
              </div>

              {/* Card */}
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  marginTop: '8px',
                  border: '1px solid var(--color-neutral-200)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)' }}>{ev.title}</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--color-neutral-800)', lineHeight: 1.5 }}>
                  {ev.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => navigate('/patient/ocr-results')}
          style={{ padding: '12px 20px', backgroundColor: 'transparent', color: 'var(--color-neutral-600)', border: '1px solid var(--color-neutral-200)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} /> Back to Documents
        </button>

        <button
          type="button"
          onClick={() => navigate('/patient/summary')}
          style={{
            padding: '12px 28px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Continue to Final Review</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Timeline;
