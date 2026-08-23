import React from 'react';
import { Outlet } from 'react-router-dom';
import { HeartPulse, ShieldCheck } from 'lucide-react';

const PatientLayout: React.FC = () => {
  return (
    <div className="patient-shell">
      <header className="patient-header">
        <div className="patient-brand">
          <span className="patient-brand-mark"><HeartPulse size={21} /></span>
          <span className="patient-brand-name">Sahayak</span>
        </div>
        <span className="patient-header-note"><ShieldCheck size={16} /> Your information stays private</span>
      </header>
      <main className="patient-main">
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;
