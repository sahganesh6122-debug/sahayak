import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Consent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);

  return (
    <div>
      <h2>{t('consent.title')}</h2>
      <div style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-neutral-200)' }}>
          <h3>{t('consent.whyTitle')}</h3>
          <p>{t('consent.whyText')}</p>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-neutral-200)' }}>
          <h3>{t('consent.securityTitle')}</h3>
          <p>{t('consent.securityText')}</p>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-neutral-200)' }}>
          <h3>{t('consent.accessTitle')}</h3>
          <p>{t('consent.accessText')}</p>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-neutral-200)' }}>
          <h3>{t('consent.aiTitle')}</h3>
          <p>{t('consent.aiText')}</p>
        </div>
      </div>
      
      <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" id="consent" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: '20px', height: '20px' }} />
        <label htmlFor="consent">{t('consent.agreement')}</label>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '12px 24px', backgroundColor: 'var(--color-neutral-200)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('common.back')}</button>
        <button onClick={() => navigate('/patient-details')} disabled={!agreed} style={{ padding: '12px 24px', backgroundColor: agreed ? 'var(--color-primary)' : 'var(--color-neutral-200)', color: agreed ? 'white' : 'var(--color-neutral-600)', border: 'none', borderRadius: '8px', cursor: agreed ? 'pointer' : 'not-allowed' }}>{t('consent.continue')}</button>
      </div>
    </div>
  );
};
export default Consent;
