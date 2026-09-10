import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SmartConversationalVoiceIntake } from '../../components/SmartConversationalVoiceIntake';
import { ArrowLeft } from 'lucide-react';

const VoiceIntakePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCompleted = () => {
    navigate('/patient/clinical-history');
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
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
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <SmartConversationalVoiceIntake
        onCompleted={handleCompleted}
        onCancel={() => navigate('/patient/chief-complaint')}
      />
    </div>
  );
};

export default VoiceIntakePage;
