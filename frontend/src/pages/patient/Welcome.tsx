import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BrainCircuit, HeartPulse, LockKeyhole, Sparkles, Stethoscope } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="welcome-grid">
      <section className="welcome-copy">
        <span className="welcome-kicker"><Sparkles size={15} /> A calmer way to begin care</span>
        <h1>{t('welcome.title')}</h1>
        <p>{t('welcome.subtitle')}</p>
        <button className="welcome-action" onClick={() => navigate('/patient/language')}>
          {t('welcome.start')} <ArrowRight size={18} />
        </button>
        <div className="welcome-trust">
          <span><LockKeyhole size={15} /> Secure</span>
          <span><Stethoscope size={15} /> Doctor reviewed</span>
          <span><BrainCircuit size={15} /> AI assisted</span>
        </div>
      </section>
      <aside className="welcome-visual" aria-label="Sahayak care assistant">
        <div className="care-orbit" />
        <div className="care-center"><span className="care-center-icon"><HeartPulse size={52} /></span></div>
        <span className="care-caption">Helping your doctor understand you better.</span>
      </aside>
    </div>
  );
};
export default Welcome;
