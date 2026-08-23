import React from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../../i18n';
import { useAppContext } from '../../context/AppContext';
import { Check, Globe2, Languages } from 'lucide-react';

const LanguageSelect: React.FC = () => {
  const navigate = useNavigate();
  const { setLanguage } = useAppContext();

  const selectLanguage = (language: 'en' | 'hi' | 'te') => {
    setLanguage(language);
    void i18n.changeLanguage(language);
    navigate('/consent');
  };

  return (
    <div className="language-page">
      <span className="welcome-kicker"><Languages size={15} /> One step before your visit</span>
      <h1>Choose your language</h1>
      <p>Select the language you are most comfortable using. You can take your time.</p>
      <div className="language-options">
        <button className="language-card" onClick={() => selectLanguage('en')}>
          <Globe2 size={24} /><span>English</span><small>Continue in English</small><Check size={18} />
        </button>
        <button className="language-card" onClick={() => selectLanguage('hi')}>
          <Globe2 size={24} /><span>हिंदी</span><small>हिंदी में जारी रखें</small><Check size={18} />
        </button>
        <button className="language-card" onClick={() => selectLanguage('te')}>
          <Globe2 size={24} /><span>తెలుగు</span><small>తెలుగులో కొనసాగించండి</small><Check size={18} />
        </button>
      </div>
    </div>
  );
};
export default LanguageSelect;
