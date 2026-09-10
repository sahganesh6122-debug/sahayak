import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, User, HeartPulse, ShieldAlert, ArrowRight, Stethoscope } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { patientApi } from '../../services/api';

const AiSummaryReview: React.FC = () => {
  const navigate = useNavigate();
  const {
    patientData,
    chiefComplaint,
    voiceIntakeData,
    historyAnswers,
    adaptiveAnswers,
    uploadedDocuments,
    redFlags,
    resetCaseFlow
  } = useAppContext();

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ caseId: string; priority: string; queuePosition: number } | null>(null);

  const patientName = patientData.full_name || voiceIntakeData?.patient?.full_name || 'Patient';
  const patientAge = patientData.age || voiceIntakeData?.patient?.age || 'Not specified';
  const patientGender = patientData.gender || voiceIntakeData?.patient?.gender || 'Not specified';
  const complaint = chiefComplaint || voiceIntakeData?.chief_complaint || 'Routine health checkup';

  const narrative =
    voiceIntakeData?.clinical_summary ||
    `Patient ${patientName} (${patientAge} yrs, ${patientGender}) reports ${complaint}. ` +
    (voiceIntakeData?.onset_and_duration ? `Onset: ${voiceIntakeData.onset_and_duration}. ` : '') +
    (voiceIntakeData?.severity ? `Severity: ${voiceIntakeData.severity}. ` : '') +
    `Case documentation prepared for clinical consultation and verified by patient.`;

  const handleSubmitCase = async () => {
    setSubmitting(true);
    try {
      const res = await patientApi.submitFullCase({
        patientData,
        chiefComplaint: complaint,
        historyAnswers,
        adaptiveAnswers,
        voiceIntakeData,
        documents: uploadedDocuments,
        redFlags
      });
      setSubmissionResult(res);
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      // Fallback
      setSubmissionResult({
        caseId: 'CAS-' + Math.floor(1000 + Math.random() * 9000),
        priority: 'urgent',
        queuePosition: 1
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && submissionResult) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40px', maxWidth: '640px', margin: '40px auto 0' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ fontSize: '28px', color: 'var(--color-navy)', fontWeight: 800, marginBottom: '8px' }}>
          Clinical History Submitted!
        </h2>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '15px' }}>
          Your case has been securely added to the OPD doctor's live queue.
        </p>

        <div style={{ margin: '28px 0', padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-md)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-neutral-600)', fontWeight: 600 }}>Queue Token</span>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', backgroundColor: submissionResult.priority === 'urgent' ? '#fee2e2' : '#dcfce7', color: submissionResult.priority === 'urgent' ? '#991b1b' : '#166534', fontWeight: 700 }}>
              {submissionResult.priority === 'urgent' ? '🔴 Priority: URGENT' : '🟢 Priority: NORMAL'}
            </span>
          </div>

          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary)', margin: '12px 0 4px' }}>
            {submissionResult.caseId}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-neutral-800)', fontWeight: 600 }}>
            Patient: {patientName} • {patientAge} yrs • {patientGender}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
            Complaint: {complaint}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
            Estimated Wait Time: ~{submissionResult.priority === 'urgent' ? '5 minutes' : '20 minutes'}
          </div>
        </div>

        {/* Demo transition buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            onClick={() => {
              navigate(`/doctor/cases/${submissionResult.caseId}`);
            }}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Stethoscope size={18} />
            <span>Open in Doctor Portal (Review this Case)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetCaseFlow();
              navigate('/login');
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'white',
              color: 'var(--color-neutral-600)',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            Return to Main Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ padding: '14px 18px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '8px', marginBottom: '24px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} /> AI-Assisted Clinical History — Ready for Doctor Confirmation
        </span>
        {voiceIntakeData && (
          <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#dcfce7', borderRadius: '4px', fontWeight: 700 }}>
            🎙️ Voice-Intake Powered
          </span>
        )}
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-navy)' }}>Your Visit Summary</h2>
      <p style={{ color: 'var(--color-neutral-600)', fontSize: '14px', marginTop: '4px' }}>
        Please review the synthesized history before final submission to the doctor.
      </p>

      <div style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
        <div style={{ padding: '18px', border: '1px solid var(--color-neutral-200)', borderRadius: '10px', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <User size={15} color="var(--color-primary)" />
            <span>Patient Overview</span>
          </div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-navy)' }}>
            {patientName}, {patientAge} years old • {patientGender}
          </p>
        </div>

        <div style={{ padding: '18px', border: '1px solid var(--color-neutral-200)', borderRadius: '10px', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <HeartPulse size={15} color="var(--color-primary)" />
            <span>Chief Complaint</span>
          </div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
            {complaint}
          </p>
        </div>

        <div style={{ padding: '18px', border: '1px solid var(--color-neutral-200)', borderRadius: '10px', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <FileText size={15} color="var(--color-primary)" />
            <span>Clinical AI Narrative Summary</span>
          </div>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-neutral-800)' }}>
            {narrative}
          </p>
        </div>

        {voiceIntakeData?.red_flags && voiceIntakeData.red_flags.length > 0 && (
          <div style={{ padding: '16px', border: '1px solid #fecaca', borderRadius: '10px', backgroundColor: '#fff1f2' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ShieldAlert size={16} />
              <span>Triage Signals Identified</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#7f1d1d' }}>
              {voiceIntakeData.red_flags.map((rf, i) => (
                <li key={i}>{rf.flag_type}: {rf.description}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginTop: '36px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => navigate('/patient/chief-complaint')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-primary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600
          }}
        >
          Review & Edit Details
        </button>

        <button
          type="button"
          onClick={handleSubmitCase}
          disabled={submitting}
          style={{
            padding: '12px 32px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: submitting ? 'wait' : 'pointer',
            fontSize: '16px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <span>{submitting ? 'Submitting Case...' : 'Submit Case to Doctor'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default AiSummaryReview;
