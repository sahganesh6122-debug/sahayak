import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';

// Pages - Patient
import Welcome from './pages/patient/Welcome';
import LanguageSelect from './pages/patient/LanguageSelect';
import Consent from './pages/patient/Consent';
import PatientDetails from './pages/patient/PatientDetails';
import ChiefComplaint from './pages/patient/ChiefComplaint';
import ClinicalHistory from './pages/patient/ClinicalHistory';
import AdaptiveQuestions from './pages/patient/AdaptiveQuestions';
import RedFlagScreen from './pages/patient/RedFlagScreen';
import DocumentUpload from './pages/patient/DocumentUpload';
import OcrResults from './pages/patient/OcrResults';
import Timeline from './pages/patient/Timeline';
import AiSummaryReview from './pages/patient/AiSummaryReview';

// Pages - Auth
import UnifiedLogin from './pages/UnifiedLogin';

// Pages - Doctor
import Dashboard from './pages/doctor/Dashboard';
import CaseView from './pages/doctor/CaseView';

// Layouts
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppContext();
  if (!user || user.role !== 'doctor') {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default route - Login Page */}
      <Route path="/" element={<UnifiedLogin />} />
      <Route path="/login" element={<UnifiedLogin />} />

      {/* Patient Portal Routes */}
      <Route element={<PatientLayout />}>
        <Route path="/patient/welcome" element={<Welcome />} />
        <Route path="/patient/language" element={<LanguageSelect />} />
        <Route path="/patient/consent" element={<Consent />} />
        <Route path="/patient/details" element={<PatientDetails />} />
        <Route path="/patient/chief-complaint" element={<ChiefComplaint />} />
        <Route path="/patient/clinical-history" element={<ClinicalHistory />} />
        <Route path="/patient/adaptive-questions" element={<AdaptiveQuestions />} />
        <Route path="/patient/red-flags" element={<RedFlagScreen />} />
        <Route path="/patient/documents" element={<DocumentUpload />} />
        <Route path="/patient/ocr-results" element={<OcrResults />} />
        <Route path="/patient/timeline" element={<Timeline />} />
        <Route path="/patient/summary" element={<AiSummaryReview />} />
      </Route>
      <Route element={<ProtectedRoute><DoctorLayout /></ProtectedRoute>}>
        <Route path="/doctor/dashboard" element={<Dashboard />} />
        <Route path="/doctor/cases/:caseId" element={<CaseView />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
