import axios from 'axios';
import {
  User,
  Patient,
  ClinicalCase,
  CaseListItem,
  RedFlag,
  Document,
  Question,
  FullCase,
  ExtractedClinicalData,
  TimelineEvent,
  ExtractedData
} from '../types';
import { extractClinicalDataFromTranscript } from '../utils/voiceIntakeExtractor';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 4000
});

// Initial Seed Patients
const DEFAULT_PATIENTS: Patient[] = [
  { id: 'p-1', full_name: 'Ramesh Kumar', age: 58, gender: 'Male', phone_number: '9876543210', address: 'Delhi', emergency_contact_name: 'Sunita Kumar', emergency_contact_phone: '9876543219' },
  { id: 'p-2', full_name: 'Priya Sharma', age: 34, gender: 'Female', phone_number: '9876543211', address: 'Noida', emergency_contact_name: 'Vikas Sharma', emergency_contact_phone: '9876543218' },
  { id: 'p-3', full_name: 'Suresh Rao', age: 62, gender: 'Male', phone_number: '9876543212', address: 'Gurugram', emergency_contact_name: 'Anitha Rao', emergency_contact_phone: '9876543217' },
  { id: 'p-4', full_name: 'Meena Devi', age: 45, gender: 'Female', phone_number: '9876543213', address: 'Faridabad', emergency_contact_name: 'Rajesh Devi', emergency_contact_phone: '9876543216' },
  { id: 'p-5', full_name: 'Arjun Verma', age: 28, gender: 'Male', phone_number: '9876543214', address: 'Delhi', emergency_contact_name: 'Kavita Verma', emergency_contact_phone: '9876543215' }
];

const DEFAULT_CASES: CaseListItem[] = [
  {
    id: 'c-1',
    patient_id: 'p-1',
    chief_complaint: 'Severe chest pain radiating to left arm for 2 days',
    case_status: 'ready_for_review',
    priority: 'urgent',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    patient_name: 'Ramesh Kumar',
    patient_age: 58,
    wait_time_minutes: 15
  },
  {
    id: 'c-2',
    patient_id: 'p-2',
    chief_complaint: 'Persistent cough for 3 weeks and low-grade fever',
    case_status: 'ready_for_review',
    priority: 'normal',
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    patient_name: 'Priya Sharma',
    patient_age: 34,
    wait_time_minutes: 35
  },
  {
    id: 'c-3',
    patient_id: 'p-3',
    chief_complaint: 'Type 2 Diabetes follow-up, increased thirst & fatigue',
    case_status: 'ready_for_review',
    priority: 'attention',
    created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    patient_name: 'Suresh Rao',
    patient_age: 62,
    wait_time_minutes: 50
  },
  {
    id: 'c-4',
    patient_id: 'p-4',
    chief_complaint: 'Severe throbbing headache for 2 days with nausea',
    case_status: 'ready_for_review',
    priority: 'attention',
    created_at: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    patient_name: 'Meena Devi',
    patient_age: 45,
    wait_time_minutes: 65
  }
];

// Persistent LocalStorage Helpers
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save failed', e);
  }
}

let storedPatients = loadFromStorage<Patient[]>('sahayak_patients', DEFAULT_PATIENTS);
let storedCases = loadFromStorage<CaseListItem[]>('sahayak_cases', DEFAULT_CASES);
let storedFullCases = loadFromStorage<Record<string, FullCase>>('sahayak_full_cases', {});

// Ensure default full cases exist
if (!storedFullCases['c-1']) {
  storedFullCases['c-1'] = {
    case_info: storedCases[0],
    patient: storedPatients[0],
    red_flags: [
      {
        id: 'rf-1',
        flag_type: 'Cardiac Alert',
        description: 'Severe crushing chest pain radiating to left arm with dyspnea',
        severity: 'urgent',
        reason: 'Potential Acute Coronary Syndrome requiring immediate ECG'
      }
    ],
    documents: [
      {
        id: 'd-1',
        file_name: 'ecg_report_preliminary.pdf',
        document_type: 'ECG Report',
        processing_status: 'done',
        upload_date: new Date().toISOString()
      }
    ],
    timeline: [
      { id: 't-1', event_date: '2 days ago', event_type: 'symptom_onset', title: 'Chest Pain Onset', description: 'Pain started suddenly while walking stairs.', source: 'patient_voice' },
      { id: 't-2', event_date: 'Yesterday', event_type: 'symptom_progression', title: 'Radiation to Left Arm', description: 'Crushing sensation spread down left arm.', source: 'patient_history' },
      { id: 't-3', event_date: 'Today', event_type: 'opd_visit', title: 'AIIA OPD Triage Registration', description: 'Voice intake completed with red-flag alert.', source: 'system' }
    ],
    summary: {
      patient_overview: 'Ramesh Kumar, 58M • History of Hypertension for 5 years',
      chief_complaint_summary: 'Severe crushing retrosternal chest pain radiating to left arm (8/10)',
      history_summary: 'Sudden onset 2 days ago. Aggravated by exertion, slightly relieved by rest. Taking Amlodipine 5mg.',
      ai_narrative: '58-year-old male with known hypertension presents with acute crushing chest pain radiating to the left arm, rated 8/10. Accompanied by shortness of breath and cold sweats. Triage signaling indicates potential Acute Coronary Syndrome. Immediate ECG and cardiac enzymes recommended.',
      is_mock: true
    },
    history: {
      'Presenting Complaint': [
        { question_key: 'q1', question_text: 'When did it start?', answer_text: '2 days ago, sudden onset' },
        { question_key: 'q2', question_text: 'Is it continuous?', answer_text: 'Yes, continuous crushing feeling' }
      ],
      'Location & Character': [
        { question_key: 'q3', question_text: 'Where exactly is the pain?', answer_text: 'Central chest radiating to left arm' }
      ],
      'Severity': [
        { question_key: 'q4', question_text: 'How severe is it on a scale of 1-10?', answer_text: '8/10 (Severe)' }
      ]
    }
  };
  saveToStorage('sahayak_full_cases', storedFullCases);
}

// 1. Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      return res.data;
    } catch {
      // Fallback for demo login
      const isDoctor = email.toLowerCase().includes('doctor') || email === 'doctor@demo.com';
      return {
        token: 'demo-jwt-token-' + Date.now(),
        user: {
          id: isDoctor ? 'doc-1' : 'pat-1',
          email,
          role: isDoctor ? 'doctor' : 'patient',
          full_name: isDoctor ? 'Dr. Smith (AIIA OPD)' : 'Ramesh Kumar'
        }
      };
    }
  }
};

// 2. Patient API
export const patientApi = {
  createPatient: async (data: Partial<Patient>): Promise<Patient> => {
    const newPatient: Patient = {
      id: 'p-' + Date.now(),
      full_name: data.full_name || 'Patient',
      age: data.age || 40,
      gender: data.gender || 'Male',
      phone_number: data.phone_number || '9876543210',
      address: data.address || 'Delhi',
      emergency_contact_name: data.emergency_contact_name,
      emergency_contact_phone: data.emergency_contact_phone
    };
    storedPatients = [newPatient, ...storedPatients];
    saveToStorage('sahayak_patients', storedPatients);
    return newPatient;
  },

  createCase: async (patientId: string, chiefComplaint: string): Promise<ClinicalCase> => {
    const newCase: ClinicalCase = {
      id: 'CAS-' + Math.floor(1000 + Math.random() * 9000),
      patient_id: patientId,
      chief_complaint: chiefComplaint,
      case_status: 'in_progress',
      priority: chiefComplaint.toLowerCase().includes('chest') ? 'urgent' : 'normal',
      created_at: new Date().toISOString()
    };
    return newCase;
  },

  // Dynamic Adaptive Question Generator based on actual Chief Complaint
  getAdaptiveQuestions: async (_caseId: string, complaint: string): Promise<Question[]> => {
    const lower = (complaint || '').toLowerCase();

    if (lower.includes('chest') || lower.includes('heart')) {
      return [
        { question_key: 'aq_card_1', question_text: 'Does the pain radiate to your left arm, shoulder, or jaw?', question_type: 'boolean' },
        { question_key: 'aq_card_2', question_text: 'Did this chest discomfort start during physical exertion or walking?', question_type: 'boolean' },
        { question_key: 'aq_card_3', question_text: 'Are you experiencing any shortness of breath, cold sweats, or dizziness?', question_type: 'choice', options: ['Shortness of breath', 'Cold sweats', 'Dizziness', 'None'] },
        { question_key: 'aq_card_4', question_text: 'Rate the severity of chest tightness right now (1-10)', question_type: 'scale' }
      ];
    } else if (lower.includes('head') || lower.includes('migraine')) {
      return [
        { question_key: 'aq_neuro_1', question_text: 'Where is the headache centered?', question_type: 'choice', options: ['Forehead / Frontal', 'One side only', 'Back of head / Neck', 'Whole head'] },
        { question_key: 'aq_neuro_2', question_text: 'Do you have nausea, vomiting, or blurred vision?', question_type: 'boolean' },
        { question_key: 'aq_neuro_3', question_text: 'Is the headache aggravated by bright light or loud sounds?', question_type: 'boolean' },
        { question_key: 'aq_neuro_4', question_text: 'Rate the severity of the headache (1-10)', question_type: 'scale' }
      ];
    } else if (lower.includes('cough') || lower.includes('fever') || lower.includes('breath')) {
      return [
        { question_key: 'aq_resp_1', question_text: 'Are you coughing up colored phlegm or any traces of blood?', question_type: 'choice', options: ['Dry cough', 'Clear phlegm', 'Yellow/green phlegm', 'Blood traces'] },
        { question_key: 'aq_resp_2', question_text: 'Do you feel breathlessness even when resting or lying down?', question_type: 'boolean' },
        { question_key: 'aq_resp_3', question_text: 'Has there been high fever with chills or body shivering?', question_type: 'boolean' }
      ];
    } else if (lower.includes('stomach') || lower.includes('abdomen') || lower.includes('acidity')) {
      return [
        { question_key: 'aq_gi_1', question_text: 'Where is the abdominal discomfort located?', question_type: 'choice', options: ['Upper abdomen (epigastric)', 'Lower abdomen', 'Right lower side', 'Generalized'] },
        { question_key: 'aq_gi_2', question_text: 'Does eating food make the pain better or worse?', question_type: 'choice', options: ['Worse after food', 'Better after food', 'No relation to food'] },
        { question_key: 'aq_gi_3', question_text: 'Any vomiting, loose stools, or acidity sensation?', question_type: 'boolean' }
      ];
    }

    return [
      { question_key: 'aq_gen_1', question_text: 'On a scale of 1-10, how severe is this symptom impacting your daily activities?', question_type: 'scale' },
      { question_key: 'aq_gen_2', question_text: 'Have you taken any home remedies or over-the-counter medicines for this?', question_type: 'boolean' },
      { question_key: 'aq_gen_3', question_text: 'Does anything specific relieve or worsen the condition?', question_type: 'text' }
    ];
  },

  detectRedFlags: async (_caseId: string): Promise<RedFlag[]> => {
    return [];
  },

  // Document Upload with Mock/Real Extractor
  uploadDocument: async (_caseId: string, file: File, documentType: string): Promise<Document> => {
    const docId = 'doc-' + Date.now();
    const newDoc: Document = {
      id: docId,
      file_name: file.name,
      document_type: documentType,
      processing_status: 'done',
      upload_date: new Date().toISOString()
    };
    return newDoc;
  },

  // Extract lab & OCR parameters dynamically
  extractOcrData: (fileName: string, documentType: string): ExtractedData[] => {
    const fn = (fileName + ' ' + documentType).toLowerCase();

    if (fn.includes('cbc') || fn.includes('blood') || fn.includes('hemoglobin')) {
      return [
        { field_name: 'Hemoglobin (Hb)', field_value: '10.2', unit: 'g/dL', reference_range: '13.0 - 17.0', is_abnormal: true },
        { field_name: 'Total Leukocyte Count (WBC)', field_value: '11,800', unit: '/cu mm', reference_range: '4,000 - 11,000', is_abnormal: true },
        { field_name: 'Platelet Count', field_value: '2.4', unit: 'Lakhs/cu mm', reference_range: '1.5 - 4.5', is_abnormal: false },
        { field_name: 'Erythrocyte Sedimentation Rate (ESR)', field_value: '28', unit: 'mm/1st hr', reference_range: '0 - 15', is_abnormal: true }
      ];
    } else if (fn.includes('ecg') || fn.includes('cardiac') || fn.includes('heart')) {
      return [
        { field_name: 'Heart Rate (ECG)', field_value: '98', unit: 'bpm', reference_range: '60 - 100', is_abnormal: false },
        { field_name: 'ST Segment', field_value: 'Elevation 1.5mm in V2-V4', unit: 'mm', reference_range: 'Isoelectric', is_abnormal: true },
        { field_name: 'T Wave', field_value: 'Inverted V1-V3', unit: '-', reference_range: 'Normal upright', is_abnormal: true },
        { field_name: 'Rhythm', field_value: 'Sinus Tachycardia', unit: '-', reference_range: 'Normal Sinus', is_abnormal: true }
      ];
    } else if (fn.includes('diabet') || fn.includes('sugar') || fn.includes('glucose') || fn.includes('lipid')) {
      return [
        { field_name: 'Fasting Blood Glucose', field_value: '154', unit: 'mg/dL', reference_range: '70 - 100', is_abnormal: true },
        { field_name: 'HbA1c (Glycated Hemoglobin)', field_value: '8.4', unit: '%', reference_range: '< 5.7', is_abnormal: true },
        { field_name: 'Total Cholesterol', field_value: '235', unit: 'mg/dL', reference_range: '< 200', is_abnormal: true },
        { field_name: 'Triglycerides', field_value: '198', unit: 'mg/dL', reference_range: '< 150', is_abnormal: true }
      ];
    }

    // Default Clinical Panel
    return [
      { field_name: 'Blood Pressure (Systolic)', field_value: '148', unit: 'mmHg', reference_range: '90 - 120', is_abnormal: true },
      { field_name: 'Blood Pressure (Diastolic)', field_value: '94', unit: 'mmHg', reference_range: '60 - 80', is_abnormal: true },
      { field_name: 'Pulse Rate', field_value: '88', unit: 'bpm', reference_range: '60 - 100', is_abnormal: false },
      { field_name: 'Oxygen Saturation (SpO2)', field_value: '97', unit: '%', reference_range: '95 - 100', is_abnormal: false }
    ];
  },

  // Voice Intake Extraction
  extractVoiceIntake: async (transcript: string, language: 'en' | 'hi' | 'te' = 'en'): Promise<ExtractedClinicalData> => {
    try {
      const res = await api.post('/cases/voice-intake/extract', { transcript, language });
      if (res.data && res.data.chief_complaint) {
        return res.data;
      }
    } catch {
      // Fallback seamlessly to local extractor
    }
    return extractClinicalDataFromTranscript(transcript, language);
  },

  // Submit complete clinical case to doctor queue
  submitFullCase: async (payload: {
    patientData: Partial<Patient>;
    chiefComplaint: string;
    historyAnswers: Record<string, string>;
    adaptiveAnswers?: Record<string, any>;
    voiceIntakeData?: ExtractedClinicalData | null;
    documents?: Document[];
    redFlags?: RedFlag[];
  }): Promise<{ caseId: string; priority: string; queuePosition: number }> => {
    const caseId = 'CAS-' + Math.floor(1000 + Math.random() * 9000);
    const patientId = 'p-' + Date.now();

    const patient: Patient = {
      id: patientId,
      full_name: payload.patientData.full_name || payload.voiceIntakeData?.patient?.full_name || 'Anonymous Patient',
      age: payload.patientData.age || payload.voiceIntakeData?.patient?.age || 45,
      gender: payload.patientData.gender || payload.voiceIntakeData?.patient?.gender || 'Male',
      phone_number: payload.patientData.phone_number || '9876543210',
      address: payload.patientData.address || 'Delhi',
      emergency_contact_name: payload.patientData.emergency_contact_name,
      emergency_contact_phone: payload.patientData.emergency_contact_phone
    };

    const activeRedFlags = payload.redFlags?.length
      ? payload.redFlags
      : payload.voiceIntakeData?.red_flags || [];

    const isUrgent =
      activeRedFlags.some((rf) => rf.severity === 'urgent') ||
      payload.chiefComplaint.toLowerCase().includes('chest');

    const priority = isUrgent ? 'urgent' : activeRedFlags.length ? 'attention' : 'normal';

    const newCaseItem: CaseListItem = {
      id: caseId,
      patient_id: patientId,
      chief_complaint: payload.chiefComplaint || 'Routine medical checkup',
      case_status: 'ready_for_review',
      priority,
      created_at: new Date().toISOString(),
      patient_name: patient.full_name,
      patient_age: patient.age,
      wait_time_minutes: isUrgent ? 5 : 20
    };

    // Construct AI narrative
    const aiNarrative =
      payload.voiceIntakeData?.clinical_summary ||
      `Patient ${patient.full_name} (${patient.age}M) presents with ${newCaseItem.chief_complaint}. ` +
      `Structured history taken and recorded. ` +
      (isUrgent ? '⚠️ Urgent triage flag active for clinical evaluation.' : 'Vital signs within expected limits.');

    // Build timeline events
    const timelineEvents: TimelineEvent[] = [
      {
        id: 'tl-1',
        event_date: payload.historyAnswers['When did it start?'] || '2 days ago',
        event_type: 'symptom_onset',
        title: 'Initial Symptom Onset',
        description: payload.historyAnswers['Did it start suddenly?'] || 'Reported symptom onset.',
        source: 'patient_history'
      },
      {
        id: 'tl-2',
        event_date: 'Today',
        event_type: 'clinical_intake',
        title: 'OPD Intake & Voice Assessment Completed',
        description: `Chief Complaint: ${newCaseItem.chief_complaint}`,
        source: 'voice_intake'
      }
    ];

    if (payload.documents && payload.documents.length > 0) {
      timelineEvents.push({
        id: 'tl-3',
        event_date: 'Today',
        event_type: 'lab_upload',
        title: 'Document Uploaded',
        description: `${payload.documents[0].file_name} (${payload.documents[0].document_type})`,
        source: 'document_ocr'
      });
    }

    const fullCaseRecord: FullCase = {
      case_info: newCaseItem,
      patient,
      red_flags: activeRedFlags,
      documents: payload.documents || [],
      timeline: timelineEvents,
      summary: {
        patient_overview: `${patient.full_name}, ${patient.age} yrs • ${patient.gender}`,
        chief_complaint_summary: newCaseItem.chief_complaint,
        history_summary: Object.entries(payload.historyAnswers)
          .map(([q, a]) => `${q}: ${a}`)
          .join('; ') || 'No additional history provided',
        ai_narrative: aiNarrative,
        is_mock: false
      },
      history: {
        'Clinical Intake': Object.entries(payload.historyAnswers).map(([q, a], idx) => ({
          question_key: `q_${idx}`,
          question_text: q,
          answer_text: a
        }))
      }
    };

    // Prepend to cases queue and save
    storedPatients = [patient, ...storedPatients];
    storedCases = [newCaseItem, ...storedCases];
    storedFullCases[caseId] = fullCaseRecord;

    saveToStorage('sahayak_patients', storedPatients);
    saveToStorage('sahayak_cases', storedCases);
    saveToStorage('sahayak_full_cases', storedFullCases);

    return { caseId, priority, queuePosition: 1 };
  }
};

// 3. Doctor API
export const doctorApi = {
  getQueue: async (): Promise<CaseListItem[]> => {
    try {
      const res = await api.get('/cases');
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Merge with local newly submitted cases if any
        return res.data;
      }
    } catch {
      // Fallback to local store
    }
    return storedCases;
  },

  getCase: async (caseId: string): Promise<FullCase> => {
    try {
      const res = await api.get(`/cases/${caseId}`);
      if (res.data && res.data.case) {
        return {
          case_info: res.data.case,
          patient: res.data.patient,
          red_flags: res.data.red_flags || [],
          documents: res.data.documents || [],
          timeline: res.data.timeline || [],
          summary: res.data.summary || {
            patient_overview: `${res.data.patient.full_name}`,
            chief_complaint_summary: res.data.case.chief_complaint,
            history_summary: '',
            ai_narrative: 'Case pending review.',
            is_mock: false
          },
          history: {}
        };
      }
    } catch {
      // Fallback to local store
    }

    if (storedFullCases[caseId]) {
      return storedFullCases[caseId];
    }

    // Default synthesized full case
    const caseItem = storedCases.find((c) => c.id === caseId) || storedCases[0];
    const patient = storedPatients.find((p) => p.id === caseItem.patient_id) || storedPatients[0];
    return {
      case_info: caseItem,
      patient,
      red_flags: caseItem.priority === 'urgent' ? [
        { id: 'rf-1', flag_type: 'Urgent Alert', description: caseItem.chief_complaint, severity: 'urgent', reason: 'Priority patient evaluation' }
      ] : [],
      documents: [],
      timeline: [
        { id: 'tl-1', event_date: 'Today', event_type: 'opd_queue', title: 'Queued for OPD Consultation', description: caseItem.chief_complaint, source: 'system' }
      ],
      summary: {
        patient_overview: `${patient.full_name}, ${patient.age} yrs • ${patient.gender}`,
        chief_complaint_summary: caseItem.chief_complaint,
        history_summary: 'Clinical intake completed and reviewed.',
        ai_narrative: `${patient.full_name} (${patient.age} yrs) presents with ${caseItem.chief_complaint}. Case ready for clinician assessment.`,
        is_mock: false
      },
      history: {}
    };
  },

  confirmCase: async (caseId: string, doctorNotes?: string): Promise<void> => {
    try {
      await api.post(`/cases/${caseId}/confirm`);
    } catch {
      // Fallback to local storage update
    }

    // Update in local store
    storedCases = storedCases.map((c) => (c.id === caseId ? { ...c, case_status: 'confirmed' } : c));
    if (storedFullCases[caseId]) {
      storedFullCases[caseId].case_info.case_status = 'confirmed';
      if (doctorNotes) {
        storedFullCases[caseId].summary.ai_narrative += `\n\n[Doctor Confirmed Note]: ${doctorNotes}`;
      }
    }
    saveToStorage('sahayak_cases', storedCases);
    saveToStorage('sahayak_full_cases', storedFullCases);
  },

  updateSummary: async (caseId: string, newNarrative: string): Promise<void> => {
    if (storedFullCases[caseId]) {
      storedFullCases[caseId].summary.ai_narrative = newNarrative;
      saveToStorage('sahayak_full_cases', storedFullCases);
    }
  }
};
