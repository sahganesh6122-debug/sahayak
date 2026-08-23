import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h1>🏥 Sahayak</h1>
      <p>{t('welcome.title')}</p>
      <p style={{ color: 'var(--color-neutral-600)' }}>{t('welcome.subtitle')}</p>
      <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button onClick={() => navigate('/language')} style={{ padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>{t('welcome.start')}</button>
      </div>
      <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center', color: 'var(--color-success)' }}>
        <span>🔒 Secure</span> • <span>Confidential</span> • <span>🤖 AI-Assisted</span>
      </div>
    </div>
  );
};
export default Welcome;
