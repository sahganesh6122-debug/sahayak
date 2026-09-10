import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Patient, ExtractedClinicalData, RedFlag, Document, ExtractedData } from '../types';

interface AppContextType {
  language: 'en' | 'hi' | 'te';
  setLanguage: (lang: 'en' | 'hi' | 'te') => void;
  user: User | null;
  setUser: (user: User | null) => void;
  patientId: string | null;
  setPatientId: (id: string | null) => void;
  caseId: string | null;
  setCaseId: (id: string | null) => void;
  patientData: Partial<Patient>;
  setPatientData: (data: Partial<Patient>) => void;
  chiefComplaint: string;
  setChiefComplaint: (complaint: string) => void;
  historyAnswers: Record<string, string>;
  setHistoryAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  adaptiveAnswers: Record<string, any>;
  setAdaptiveAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  uploadedDocuments: Document[];
  setUploadedDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  extractedOcrData: ExtractedData[];
  setExtractedOcrData: React.Dispatch<React.SetStateAction<ExtractedData[]>>;
  voiceIntakeData: ExtractedClinicalData | null;
  setVoiceIntakeData: (data: ExtractedClinicalData | null) => void;
  redFlags: RedFlag[];
  setRedFlags: React.Dispatch<React.SetStateAction<RedFlag[]>>;
  applyVoiceIntakeData: (data: ExtractedClinicalData) => void;
  resetCaseFlow: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en');
  const [user, setUser] = useState<User | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<Partial<Patient>>({});
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [historyAnswers, setHistoryAnswers] = useState<Record<string, string>>({});
  const [adaptiveAnswers, setAdaptiveAnswers] = useState<Record<string, any>>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  const [extractedOcrData, setExtractedOcrData] = useState<ExtractedData[]>([]);
  const [voiceIntakeData, setVoiceIntakeData] = useState<ExtractedClinicalData | null>(null);
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);

  const applyVoiceIntakeData = (data: ExtractedClinicalData) => {
    setVoiceIntakeData(data);
    if (data.chief_complaint) {
      setChiefComplaint(data.chief_complaint);
    }
    if (data.patient) {
      setPatientData((prev) => ({
        ...prev,
        ...(data.patient?.full_name ? { full_name: data.patient.full_name } : {}),
        ...(data.patient?.age ? { age: data.patient.age } : {}),
        ...(data.patient?.gender ? { gender: data.patient.gender } : {}),
        ...(data.patient?.phone_number ? { phone_number: data.patient.phone_number } : {}),
      }));
    }
    if (data.history_answers && Object.keys(data.history_answers).length > 0) {
      setHistoryAnswers((prev) => ({
        ...prev,
        ...data.history_answers,
      }));
    }
    if (data.red_flags && data.red_flags.length > 0) {
      setRedFlags(data.red_flags);
    }
  };

  const resetCaseFlow = () => {
    setPatientData({});
    setChiefComplaint('');
    setHistoryAnswers({});
    setAdaptiveAnswers({});
    setUploadedDocuments([]);
    setExtractedOcrData([]);
    setVoiceIntakeData(null);
    setRedFlags([]);
    setCaseId(null);
    setPatientId(null);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        user,
        setUser,
        patientId,
        setPatientId,
        caseId,
        setCaseId,
        patientData,
        setPatientData,
        chiefComplaint,
        setChiefComplaint,
        historyAnswers,
        setHistoryAnswers,
        adaptiveAnswers,
        setAdaptiveAnswers,
        uploadedDocuments,
        setUploadedDocuments,
        extractedOcrData,
        setExtractedOcrData,
        voiceIntakeData,
        setVoiceIntakeData,
        redFlags,
        setRedFlags,
        applyVoiceIntakeData,
        resetCaseFlow
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
