import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  ClipboardCheck,
  Stethoscope
} from 'lucide-react';
import { doctorApi } from '../../services/api';
import { FullCase } from '../../types';

const CaseView: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<FullCase | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [editableNarrative, setEditableNarrative] = useState('');
  const [verifiedChecked, setVerifiedChecked] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (caseId) {
      doctorApi.getCase(caseId).then((data) => {
        setCaseData(data);
        if (data?.summary?.ai_narrative) {
          setEditableNarrative(data.summary.ai_narrative);
        }
      });
    }
  }, [caseId]);

  if (!caseData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-primary)' }}>
        <Stethoscope size={40} className="animate-spin" />
        <div style={{ marginTop: '16px', fontWeight: 600 }}>Loading patient case record...</div>
      </div>
    );
  }

  const isConfirmed = caseData.case_info.case_status === 'confirmed';

  const handleConfirm = async () => {
    if (!verifiedChecked && !isConfirmed) {
      alert('Please check the verification confirmation checkbox before confirming.');
      return;
    }
    setIsConfirming(true);
    await doctorApi.confirmCase(caseId!, doctorNotes);
    alert('Case confirmed successfully! Doctor review audit trail recorded.');
    navigate('/doctor/dashboard');
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Clinical History' },
    { id: 'red-flags', label: `Red Flags (${caseData.red_flags.length})` },
    { id: 'documents', label: `Documents (${caseData.documents.length})` },
    { id: 'timeline', label: 'Timeline' },
    { id: 'ai-summary', label: 'AI Summary & Sign-off' }
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Breadcrumb & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => navigate('/doctor/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-neutral-600)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Back to Doctor Queue
        </button>

        <span style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>
          Case ID: <strong>{caseId}</strong>
        </span>
      </div>

      {/* Patient Header Card */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--color-neutral-200)',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px' }}>
            {caseData.patient.full_name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-navy)' }}>
              {caseData.patient.full_name}
            </h2>
            <div style={{ color: 'var(--color-neutral-600)', fontSize: '14px', marginTop: '4px' }}>
              {caseData.patient.age} yrs • {caseData.patient.gender} • Phone: {caseData.patient.phone_number || 'N/A'} • Address: {caseData.patient.address || 'N/A'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {caseData.case_info.priority === 'urgent' && (
            <span style={{ padding: '6px 14px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '20px', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldAlert size={14} /> Urgent Triage
            </span>
          )}
          {caseData.case_info.priority === 'attention' && (
            <span style={{ padding: '6px 14px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '20px', fontWeight: 700, fontSize: '13px' }}>
              Attention Flag
            </span>
          )}
          {isConfirmed ? (
            <span style={{ padding: '6px 14px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '20px', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Doctor Confirmed
            </span>
          ) : (
            <span style={{ padding: '6px 14px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontWeight: 700, fontSize: '13px' }}>
              Ready for Review
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '24px', borderBottom: '1px solid var(--color-neutral-200)', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === tab.id ? 'var(--color-primary-dark)' : 'var(--color-neutral-600)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '15px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div style={{ marginTop: '24px' }}>
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Primary Chief Complaint
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-navy)', marginTop: '8px' }}>
                {caseData.case_info.chief_complaint}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '12px' }}>
                  AI Clinical Narrative Preview
                </h3>
                <div style={{ padding: '12px 16px', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '8px', marginBottom: '14px', border: '1px solid #fde68a', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> Synthesized from patient-reported clinical intake
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-neutral-800)' }}>
                  {caseData.summary.ai_narrative}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('ai-summary')}
                  style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
                >
                  Edit & Confirm in AI Summary Tab →
                </button>
              </div>

              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '12px' }}>
                  Emergency Contact & Vitals Snapshot
                </h3>
                <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: 'var(--color-neutral-600)' }}>Emergency Contact: </span>
                    <strong>{caseData.patient.emergency_contact_name || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-neutral-600)' }}>Emergency Phone: </span>
                    <strong>{caseData.patient.emergency_contact_phone || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-neutral-600)' }}>Documents Attached: </span>
                    <strong>{caseData.documents.length} records</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-neutral-600)' }}>Active Red Flags: </span>
                    <strong style={{ color: caseData.red_flags.length ? 'var(--color-urgent)' : 'var(--color-success)' }}>
                      {caseData.red_flags.length ? `${caseData.red_flags.length} Flags Detected` : 'None Detected'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Clinical History */}
        {activeTab === 'history' && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '16px' }}>
              Patient-Reported Clinical History
            </h3>
            {caseData.history && Object.keys(caseData.history).length > 0 ? (
              Object.entries(caseData.history).map(([sectionTitle, answers], sIdx) => (
                <div key={sIdx} style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)', paddingBottom: '6px', borderBottom: '1px solid var(--color-neutral-200)', marginBottom: '10px' }}>
                    {sectionTitle}
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {answers.map((ans, aIdx) => (
                      <div key={aIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--color-neutral-50)', borderRadius: '6px', fontSize: '14px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-neutral-800)', maxWidth: '40%' }}>{ans.question_text}</span>
                        <span style={{ color: 'var(--color-navy)', fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{ans.answer_text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-neutral-50)', borderRadius: '6px' }}>
                  <strong>Onset & Duration:</strong> {caseData.summary.history_summary}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Red Flags */}
        {activeTab === 'red-flags' && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '16px' }}>
              Clinical Triage Red Flags
            </h3>
            {caseData.red_flags.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {caseData.red_flags.map((rf, idx) => (
                  <div key={idx} style={{ padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--color-urgent)', backgroundColor: '#fef2f2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-urgent)', fontWeight: 700, fontSize: '15px' }}>
                      <AlertTriangle size={18} />
                      <span>{rf.flag_type} ({rf.severity.toUpperCase()})</span>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '14px', color: 'var(--color-neutral-800)', fontWeight: 600 }}>
                      {rf.description}
                    </div>
                    {rf.reason && (
                      <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--color-neutral-600)' }}>
                        Rationale: {rf.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-success)', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700 }}>No active emergency red flags detected. Standard routine OPD evaluation.</div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Documents & OCR */}
        {activeTab === 'documents' && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '16px' }}>
              Uploaded Medical Documents & Extracted OCR Parameters
            </h3>
            {caseData.documents.length > 0 ? (
              <div style={{ display: 'grid', gap: '14px' }}>
                {caseData.documents.map((doc, i) => (
                  <div key={i} style={{ padding: '16px', border: '1px solid var(--color-neutral-200)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{doc.file_name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>{doc.document_type} • Uploaded {new Date(doc.upload_date).toLocaleDateString()}</div>
                    </div>
                    <span style={{ padding: '4px 10px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                      OCR Extracted ✓
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-neutral-600)' }}>
                No prior medical records uploaded by patient for this visit.
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Timeline */}
        {activeTab === 'timeline' && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '16px' }}>
              Medical Chronology Timeline
            </h3>
            <div style={{ position: 'relative', paddingLeft: '28px', borderLeft: '2px solid var(--color-neutral-200)' }}>
              {caseData.timeline.map((item, idx) => (
                <div key={idx} style={{ position: 'relative', marginBottom: '20px' }}>
                  <div style={{ position: 'absolute', left: '-35px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>{item.event_date}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', marginTop: '2px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-neutral-800)', marginTop: '2px' }}>{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: AI Summary & Confirmation */}
        {activeTab === 'ai-summary' && (
          <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
            <div style={{ padding: '14px 18px', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '8px', marginBottom: '24px', border: '1px solid #fde68a' }}>
              <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Assistive AI Documentation Sign-off
              </h4>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                You may review and modify the AI synthesized clinical narrative below. Adding doctor notes creates an audit trail entry.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  Clinical AI Narrative (Editable by Doctor):
                </label>
                <textarea
                  value={editableNarrative}
                  onChange={(e) => setEditableNarrative(e.target.value)}
                  style={{ width: '100%', minHeight: '120px', marginTop: '8px', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-neutral-200)', fontSize: '14px', lineHeight: 1.6, fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  Doctor Clinical Impressions & Notes:
                </label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="E.g. Advised ECG and Troponin-I. Referral to Cardiology OPD. Prescribed sublingual nitrates..."
                  style={{ width: '100%', minHeight: '100px', marginTop: '8px', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-neutral-200)', fontSize: '14px', lineHeight: 1.6, fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input
                  type="checkbox"
                  id="confirm-check"
                  checked={verifiedChecked || isConfirmed}
                  disabled={isConfirmed}
                  onChange={(e) => setVerifiedChecked(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="confirm-check" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)', cursor: 'pointer' }}>
                  I, as the attending physician, have reviewed and verified this patient case and clinical history.
                </label>
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-neutral-200)', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={() => doctorApi.updateSummary(caseId!, editableNarrative).then(() => alert('Narrative changes saved!'))}
                style={{ padding: '12px 24px', backgroundColor: 'white', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming || isConfirmed}
                style={{
                  padding: '12px 28px',
                  backgroundColor: isConfirmed ? 'var(--color-neutral-400)' : 'var(--color-success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isConfirmed ? 'default' : 'pointer',
                  fontSize: '15px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <ClipboardCheck size={18} />
                <span>{isConfirmed ? 'Case Already Confirmed ✓' : 'Confirm Case & Complete Review'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseView;
