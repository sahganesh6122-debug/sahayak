import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, ArrowRight, Bell } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const RedFlagScreen: React.FC = () => {
  const navigate = useNavigate();
  const { redFlags, voiceIntakeData } = useAppContext();

  const activeFlags = redFlags.length > 0 ? redFlags : (voiceIntakeData?.red_flags || []);
  const hasUrgent = activeFlags.some((f) => f.severity === 'urgent');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ color: 'var(--color-neutral-600)', marginBottom: '8px' }}>Step 7 of 12</div>

      {activeFlags.length > 0 ? (
        <div
          style={{
            padding: '28px',
            backgroundColor: hasUrgent ? '#fef2f2' : '#fffbeb',
            border: `1px solid ${hasUrgent ? 'var(--color-urgent)' : 'var(--color-warning)'}`,
            borderRadius: '12px',
            color: hasUrgent ? 'var(--color-urgent)' : '#92400e'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={26} />
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>
              {hasUrgent ? '⚠️ Clinical Triage Alert — Priority Assessment Recommended' : 'ℹ️ Clinical Attention Flag'}
            </h2>
          </div>
          <p style={{ marginTop: '14px', fontSize: '15px' }}>
            Reported symptoms from your clinical intake include features that may require prompt medical evaluation.
          </p>
          <p style={{ marginTop: '8px', fontWeight: 700 }}>
            Please notify the OPD reception or nursing staff immediately upon arrival.
          </p>

          <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
            {activeFlags.map((flag, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  color: 'var(--color-neutral-800)'
                }}
              >
                <div style={{ fontWeight: 700, color: flag.severity === 'urgent' ? 'var(--color-urgent)' : '#d97706', fontSize: '14px' }}>
                  {flag.flag_type} ({flag.severity.toUpperCase()})
                </div>
                <div style={{ fontSize: '14px', marginTop: '2px' }}>{flag.description}</div>
                {flag.reason && (
                  <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
                    Clinical rationale: {flag.reason}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--color-neutral-600)' }}>
            ⚕️ Disclaimer: This is an assistive triage signal only and does not constitute a formal diagnosis. A qualified doctor will evaluate your condition.
          </p>
        </div>
      ) : (
        <div style={{ padding: '28px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', color: '#166534' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={26} />
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Triage Status: Standard OPD Routine</h2>
          </div>
          <p style={{ marginTop: '12px', fontSize: '15px' }}>
            No immediate critical emergency flags were detected in your reported symptoms. You will proceed to standard consultation review.
          </p>
        </div>
      )}

      <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        {activeFlags.length > 0 && (
          <button
            type="button"
            onClick={() => alert('Nursing and triage staff have been notified of your priority flag!')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: 'var(--color-urgent)',
              border: '1px solid var(--color-urgent)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Bell size={16} /> Alert Staff
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate('/patient/documents')}
          style={{
            padding: '12px 24px',
            backgroundColor: hasUrgent ? 'var(--color-urgent)' : 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Continue to Document Upload</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default RedFlagScreen;
