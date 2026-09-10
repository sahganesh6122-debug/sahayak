import { ExtractedClinicalData, RedFlag } from '../types';

/**
 * Intelligent Clinical Voice Intake Extractor
 * Parses natural conversational patient speech across English, Hindi, and Telugu
 * to extract structured clinical history, triage red flags, and patient demographics.
 */
export function extractClinicalDataFromTranscript(
  rawTranscript: string,
  language: 'en' | 'hi' | 'te' = 'en'
): ExtractedClinicalData {
  const text = rawTranscript.trim();
  const lower = text.toLowerCase();

  // 1. Patient Demographics Extraction
  const patient: { full_name?: string; age?: number; gender?: string; phone_number?: string } = {};

  // Name extraction (e.g., "My name is Ramesh Kumar", "I am Ramesh Kumar", "मेरा नाम रमेश कुमार है", "నా పేరు రమేష్")
  const nameMatch =
    text.match(/(?:my name is|i am|this is|i'm|name:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i) ||
    text.match(/(?:मेरा नाम|नाम)\s+([^\s,।]+(?:\s+[^\s,।]+)?)/i) ||
    text.match(/(?:నా పేరు)\s+([^\s,।]+(?:\s+[^\s,।]+)?)/i);
  if (nameMatch && nameMatch[1]) {
    const rawName = nameMatch[1].trim();
    if (!['i', 'a', 'the', 'having', 'feeling', 'suffering'].includes(rawName.toLowerCase())) {
      patient.full_name = rawName;
    }
  }

  // Age extraction (e.g., "58 years old", "age 58", "58 साल", "58 సంవత్సరాలు")
  const ageMatch =
    lower.match(/(\d{1,3})\s*(?:years?\s*old|yrs?\s*old|years?|yrs?|साल|वर्ष|సంవత్సరాలు)/i) ||
    lower.match(/(?:age|aged)\s*(?:is|:)?\s*(\d{1,3})/i);
  if (ageMatch && ageMatch[1]) {
    const parsedAge = parseInt(ageMatch[1], 10);
    if (parsedAge > 0 && parsedAge <= 120) {
      patient.age = parsedAge;
    }
  }

  // Gender extraction
  if (/(?:\b(?:male|man|gentleman|boy)\b|पुरुष|మగ)/i.test(lower) && !/\bfemale\b/i.test(lower)) {
    patient.gender = 'Male';
  } else if (/(?:\b(?:female|woman|lady|girl)\b|महिला|స్త్రీ)/i.test(lower)) {
    patient.gender = 'Female';
  }


  // Phone number extraction (10 digits)
  const phoneMatch = text.match(/(?:\+91[\-\s]?)?[6-9]\d{9}/);
  if (phoneMatch) {
    patient.phone_number = phoneMatch[0].replace(/\D/g, '').slice(-10);
  }

  // 2. Chief Complaint Identification
  let chiefComplaint = '';
  if (/chest\s*pain|heart\s*pain|सीने\s*में\s*दर्द|छाती\s*में\s*दर्द|గుండె\s*నొప్పి/i.test(lower)) {
    chiefComplaint = 'Chest pain and discomfort';
  } else if (/headache|migraine|सिर\s*दर्द|తలనొప్పి/i.test(lower)) {
    chiefComplaint = 'Severe headache';
  } else if (/cough|phlegm|खांसी|దగ్గు/i.test(lower)) {
    chiefComplaint = 'Persistent cough with respiratory irritation';
  } else if (/fever|temperature|बुखार|జ్వరం/i.test(lower)) {
    chiefComplaint = 'Fever with chills and body ache';
  } else if (/stomach\s*pain|abdominal\s*pain|acidity|पेट\s*दर्द|కడుపు\s*నొప్పి/i.test(lower)) {
    chiefComplaint = 'Abdominal pain and gastric discomfort';
  } else if (/joint\s*pain|knee\s*pain|back\s*pain|जोड़ों\s*में\s*दर्द|కీళ్ల\s*నొప్పులు/i.test(lower)) {
    chiefComplaint = 'Joint pain and stiffness';
  } else if (/breathless|shortness of breath|difficulty breathing|सांस\s*फूलना|శ్వాస\s*తీసుకోవడంలో\s*ఇబ్బంది/i.test(lower)) {
    chiefComplaint = 'Shortness of breath / Dyspnea';
  } else {
    const firstPeriod = text.indexOf('.');
    chiefComplaint = firstPeriod > 10 ? text.substring(0, firstPeriod).trim() : text.substring(0, 120).trim();
  }

  // 3. Onset & Duration
  let onsetAndDuration = 'Reported recently';
  const durationMatch =
    lower.match(/(?:for\s*(?:the\s*past|the\s*last)?|since)\s*(\d+\s*(?:days?|weeks?|months?|hours?|years?)|yesterday|today|last\s*night)/i) ||
    lower.match(/(\d+)\s*(?:दिनों?\s*से|घंटे\s*से|महीनों?\s*से|हफ्तों?\s*से|साल\s*से|రోజుల\s*నుండి)/i);
  const sudden = /\b(?:sudden|suddenly|abruptly|all of a sudden|अचानक|హఠాత్తుగా)\b/i.test(lower);

  if (durationMatch) {
    onsetAndDuration = `${sudden ? 'Sudden onset, ' : 'Started '}${durationMatch[0].trim()}`;
  } else if (sudden) {
    onsetAndDuration = 'Sudden acute onset';
  } else if (/chronic|long\s*time|महीनों\s*से/i.test(lower)) {
    onsetAndDuration = 'Gradual onset, chronic duration';
  }

  // 4. Location & Character of Pain / Discomfort
  let locationAndCharacter = '';
  if (/radiat(?:ing|es)|spread(?:ing|s)|left\s*arm|बाएं\s*हाथ|ఎడమ\s*చేతి/i.test(lower)) {
    locationAndCharacter = 'Central retrosternal pain radiating to left arm and shoulder';
  } else if (/chest|सीने|छाती|గుండె/i.test(lower)) {
    locationAndCharacter = 'Retrosternal chest area with crushing sensation';
  } else if (/head|forehead|temple|सिर|తల/i.test(lower)) {
    locationAndCharacter = 'Bilateral / frontal throbbing sensation';
  } else if (/stomach|abdomen|epigastric|पेट|కడుపు/i.test(lower)) {
    locationAndCharacter = 'Upper abdomen / epigastric burning';
  } else if (/knee|back|joint|जोड़|కీళ్లు/i.test(lower)) {
    locationAndCharacter = 'Peripheral joint / lumbar area with stiffness';
  } else {
    locationAndCharacter = 'Localized to affected region';
  }

  // 5. Severity Rating (1-10 or descriptive)
  let severity = 'Moderate';
  const scaleMatch = lower.match(/(?:severity|scale|rate|level)?\s*(\d{1,2})\s*(?:out of 10|\/10|on 10)/i);
  if (scaleMatch && scaleMatch[1]) {
    severity = `${scaleMatch[1]}/10`;
  } else if (/severe|crushing|unbearable|excruciating|very high|असहनीय|बहुत तेज|తీవ్రమైన/i.test(lower)) {
    severity = '8/10 (Severe)';
  } else if (/mild|slight|कम|हल्का|తేలికపాటి/i.test(lower)) {
    severity = '3/10 (Mild)';
  } else {
    severity = '6/10 (Moderate)';
  }

  // 6. Associated Symptoms
  const symptoms: string[] = [];
  if (/shortness of breath|breathless|dyspnea|सांस फूलना|శ్వాస ఇబ్బంది/i.test(lower)) symptoms.push('Shortness of breath');
  if (/sweat|cold sweat|perspir|पसीना|చెమట/i.test(lower)) symptoms.push('Cold sweats');
  if (/nausea|vomit|उल्टी|జీర్ణ సమస్య/i.test(lower)) symptoms.push('Nausea / Vomiting');
  if (/dizz|gidd|lightheaded|चक्कर|తలతిరగడం/i.test(lower)) symptoms.push('Dizziness');
  if (/fever|temperature|बुखार|జ్వరం/i.test(lower)) symptoms.push('Fever');
  if (/cough|खांसी|దగ్గు/i.test(lower)) symptoms.push('Cough');
  if (/fatigue|tired|कमजोरी|అలసట/i.test(lower)) symptoms.push('Fatigue / Weakness');
  if (symptoms.length === 0) {
    symptoms.push('No acute associated symptoms noted');
  }

  // 7. Aggravating & Relieving Factors
  let aggravatingRelieving = 'Worse with physical exertion, slightly relieved at rest';
  if (/walking|climbing|stairs|exertion|चलने|నడవడం/i.test(lower)) {
    aggravatingRelieving = 'Aggravated by exertion or walking; relieved by resting';
  } else if (/food|eating|meals|खाना खाने/i.test(lower)) {
    aggravatingRelieving = 'Aggravated following meals; relieved with warm fluids';
  } else if (/movement|bending|stretching/i.test(lower)) {
    aggravatingRelieving = 'Aggravated by posture changes and movement';
  }

  // 8. Past Medical History
  let pastHistory = 'No prior chronic conditions mentioned';
  const pastConditions: string[] = [];
  if (/hypertension|high bp|blood pressure|बीपी|రక్తపోటు/i.test(lower)) pastConditions.push('Hypertension');
  if (/diabet|sugar|मधुमेह|షుగర్/i.test(lower)) pastConditions.push('Type 2 Diabetes');
  if (/asthma|दमा|ఆస్తమా/i.test(lower)) pastConditions.push('Bronchial Asthma');
  if (/thyroid|थायरॉयड/i.test(lower)) pastConditions.push('Thyroid Disorder');
  if (/cholesterol|lipids/i.test(lower)) pastConditions.push('Dyslipidemia');
  if (/cardiac|heart attack|angina|हार्ट/i.test(lower)) pastConditions.push('Prior Cardiac History');
  if (pastConditions.length > 0) {
    pastHistory = pastConditions.join(', ');
  }

  // 9. Medications & Allergies
  let medications = 'None reported';
  const medsMatch = lower.match(/(?:taking|medication|meds?|tablets?|dawa|दवा|మందులు)\s*:?\s*([a-zA-Z0-9\s,\-]+)/i);
  if (medsMatch && medsMatch[1] && medsMatch[1].length < 60) {
    medications = medsMatch[1].trim();
  } else if (/bp med|amlodipine|metformin|aspirin|paracetamol|statin/i.test(lower)) {
    medications = 'Prescribed regular oral medications (cardiovascular/metabolic)';
  }

  let allergies = 'No known drug allergies (NKDA)';
  if (/allergi|allergic to|एलर्जी|అలెర్జీ/i.test(lower)) {
    allergies = 'Patient reported drug or environmental sensitivity';
  }

  // 10. Ayurveda Module / Prakriti Inferences
  let prakriti = 'Vata-Pitta';
  let dietaryHabits = 'Vegetarian, standard regular meals';
  let sleepPattern = 'Disturbed sleep due to symptoms';
  let exerciseLevel = 'Sedentary / Light daily walking';

  if (/vata/i.test(lower)) prakriti = 'Vata';
  else if (/pitta/i.test(lower)) prakriti = 'Pitta';
  else if (/kapha/i.test(lower)) prakriti = 'Kapha';
  else if (/acidity|burning|heat|पसीना/i.test(lower)) prakriti = 'Pitta-Vata';
  else if (/cold|stiff|pain/i.test(lower)) prakriti = 'Vata-Kapha';

  if (/spicy|oily|तीखा|मसालेदार/i.test(lower)) {
    dietaryHabits = 'Spicy/oily foods, irregular digestion (Agni)';
  }

  // 11. Red Flag Detection (Triage Signaling)
  const redFlags: RedFlag[] = [];
  const isCardiacUrgent =
    (/chest\s*pain|छाती|सीने/i.test(lower) && /radiat|left\s*arm|breath|sweat|बाएं/i.test(lower)) ||
    (/chest\s*pain/i.test(lower) && /8|9|10|severe|crushing/i.test(lower));

  if (isCardiacUrgent) {
    redFlags.push({
      id: 'rf-voice-cardiac-' + Date.now(),
      flag_type: 'Cardiac Alert',
      description: 'Acute chest pain with radiation and autonomic symptoms (dyspnea/sweating)',
      severity: 'urgent',
      reason: 'Potential Acute Coronary Syndrome (ACS) / Ischemia requiring prompt ECG and triage evaluation'
    });
  }

  if (/severe headache/i.test(lower) && /vomit|vision|loss of consciousness|चक्कर/i.test(lower)) {
    redFlags.push({
      id: 'rf-voice-neuro-' + Date.now(),
      flag_type: 'Neurological Alert',
      description: 'Severe acute headache accompanied by vomiting or neurological symptoms',
      severity: 'urgent',
      reason: 'Rule out intracranial hemorrhage or acute hypertensive emergency'
    });
  }

  if (/coughing\s*blood|hemoptysis|खून/i.test(lower)) {
    redFlags.push({
      id: 'rf-voice-resp-' + Date.now(),
      flag_type: 'Respiratory Alert',
      description: 'Patient reports hemoptysis (coughing up blood)',
      severity: 'urgent',
      reason: 'Critical sign for infectious (TB) or pulmonary vascular etiology'
    });
  }

  if (/loss of consciousness|fainted|blackout|बेहोश/i.test(lower)) {
    redFlags.push({
      id: 'rf-voice-syncope-' + Date.now(),
      flag_type: 'Syncope Alert',
      description: 'Transient loss of consciousness reported',
      severity: 'urgent',
      reason: 'Requires evaluation for cardiogenic syncope or arrhythmia'
    });
  }

  if (redFlags.length === 0 && (symptoms.length > 2 || /severe|unbearable/i.test(lower))) {
    redFlags.push({
      id: 'rf-voice-attn-' + Date.now(),
      flag_type: 'Clinical Evaluation',
      description: 'Multi-symptom presentation requires thorough OPD physician review',
      severity: 'attention',
      reason: 'Symptom severity warrants prioritized OPD consultation'
    });
  }

  // 12. Map directly to ClinicalHistory question titles
  const historyAnswers: Record<string, string> = {
    'When did it start?': onsetAndDuration,
    'Is it continuous?': /continuous|constant|लगातार|నిరంతరం/i.test(lower) ? 'Yes, continuous' : 'Intermittent / episodic',
    'Did it start suddenly?': sudden ? 'Yes, started abruptly' : 'Gradual progression',
    'Where exactly is the pain?': locationAndCharacter,
    'How severe is it on a scale of 1-10?': severity,
    'What makes it better or worse?': aggravatingRelieving,
    'Any fever or vomiting?': symptoms.filter(s => ['Fever', 'Nausea / Vomiting'].includes(s)).join(', ') || 'No fever or vomiting reported',
    'Any previous medical conditions?': pastHistory,
    'Are you taking any medications?': medications,
    'Any similar conditions in the family?': /family|father|mother|brother|sister|माता|पिता|కుటుంబం/i.test(lower) ? 'Family history of cardiovascular/metabolic illness' : 'No known family history',
    'Prakriti': prakriti,
    'Dietary habits': dietaryHabits,
    'Sleep pattern': sleepPattern,
    'Exercise level': exerciseLevel
  };

  // 13. Clinical Summary Narrative
  const clinicalSummary =
    `${patient.full_name || 'Patient'}${patient.age ? ` (${patient.age}${patient.gender ? patient.gender[0] : ''})` : ''} presents with ${chiefComplaint.toLowerCase()}. ` +
    `${onsetAndDuration}. Severity rated at ${severity}. ${locationAndCharacter}. ` +
    `Associated symptoms: ${symptoms.join(', ')}. ` +
    `Past Medical History: ${pastHistory}. Medications: ${medications}. ` +
    (redFlags.length > 0 ? `⚠️ Triage Alert: ${redFlags[0].description}.` : 'Vital signs and routine assessment recommended.');

  return {
    patient: Object.keys(patient).length > 0 ? patient : undefined,
    chief_complaint: chiefComplaint,
    onset_and_duration: onsetAndDuration,
    location_and_character: locationAndCharacter,
    severity,
    associated_symptoms: symptoms,
    aggravating_relieving: aggravatingRelieving,
    past_medical_history: pastHistory,
    medications,
    allergies,
    ayurveda: {
      prakriti,
      dietary_habits: dietaryHabits,
      sleep_pattern: sleepPattern,
      exercise_level: exerciseLevel
    },
    red_flags: redFlags,
    clinical_summary: clinicalSummary,
    history_answers: historyAnswers,
    transcript: text,
    detected_language: language
  };
}
