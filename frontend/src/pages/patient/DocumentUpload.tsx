import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { patientApi } from '../../services/api';
import { Document } from '../../types';

const SAMPLE_DOCS = [
  { name: 'ECG_Preliminary_Report.pdf', type: 'ECG Report', desc: 'Pre-recorded ECG tracing with ST-T changes' },
  { name: 'Complete_Blood_Count_CBC.pdf', type: 'Hematology Lab Report', desc: 'Complete hemogram with Hb & TLC' },
  { name: 'Fasting_Blood_Sugar_Lipid.pdf', type: 'Biochemistry Panel', desc: 'HbA1c & serum cholesterol report' }
];

const DocumentUpload: React.FC = () => {
  const navigate = useNavigate();
  const { uploadedDocuments, setUploadedDocuments, setExtractedOcrData } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState('Lab Report');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesAdded = async (fileList: FileList | File[]) => {
    setIsProcessing(true);
    const newDocs: Document[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const doc: Document = {
        id: 'doc-' + Date.now() + '-' + i,
        file_name: f.name,
        document_type: selectedType,
        processing_status: 'done',
        upload_date: new Date().toISOString()
      };
      newDocs.push(doc);

      // Extract parameters dynamically
      const ocrItems = patientApi.extractOcrData(f.name, selectedType);
      setExtractedOcrData((prev) => [...prev, ...ocrItems]);
    }

    setUploadedDocuments((prev) => [...prev, ...newDocs]);
    setTimeout(() => {
      setIsProcessing(false);
    }, 400);
  };

  const handlePresetSelect = (preset: typeof SAMPLE_DOCS[0]) => {
    setIsProcessing(true);
    const doc: Document = {
      id: 'doc-' + Date.now(),
      file_name: preset.name,
      document_type: preset.type,
      processing_status: 'done',
      upload_date: new Date().toISOString()
    };

    setUploadedDocuments((prev) => [...prev, doc]);
    const ocrItems = patientApi.extractOcrData(preset.name, preset.type);
    setExtractedOcrData((prev) => [...prev, ...ocrItems]);

    setTimeout(() => {
      setIsProcessing(false);
    }, 400);
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ color: 'var(--color-neutral-600)', marginBottom: '8px' }}>Step 8 of 12</div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-navy)' }}>
        Upload Medical Records & Reports (Optional)
      </h2>
      <p style={{ color: 'var(--color-neutral-600)', fontSize: '14px', marginTop: '4px' }}>
        Our clinical OCR engine will automatically extract lab values, vitals, and diagnoses for doctor verification.
      </p>

      {/* Preset Fast Demo Buttons */}
      <div style={{ marginTop: '20px', padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Sparkles size={15} color="var(--color-primary)" />
          <span>Quick Demo: Click any sample medical report to upload instantly:</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SAMPLE_DOCS.map((doc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetSelect(doc)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid var(--color-neutral-200)',
                backgroundColor: 'white',
                color: 'var(--color-neutral-800)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <FileText size={13} color="var(--color-primary)" />
              <strong>{doc.name}</strong>
              <span style={{ color: 'var(--color-neutral-600)' }}>({doc.type})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Document Type Selector */}
      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-neutral-800)' }}>Document Category:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-neutral-200)', fontSize: '14px', backgroundColor: 'white' }}
        >
          <option>Lab Report (CBC, Blood Sugar)</option>
          <option>ECG Report</option>
          <option>Prior Prescription</option>
          <option>Discharge Summary</option>
          <option>Imaging / X-Ray Report</option>
        </select>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleFilesAdded(e.dataTransfer.files);
          }
        }}
        style={{
          marginTop: '16px',
          padding: '40px',
          border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-primary-light)'}`,
          borderRadius: '12px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? '#e0f2fe' : 'var(--color-neutral-50)',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) {
              handleFilesAdded(e.target.files);
            }
          }}
        />
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <UploadCloud size={30} />
        </div>
        <div style={{ marginTop: '14px', fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)' }}>
          {isProcessing ? 'Processing & extracting OCR parameters...' : 'Click to choose file or drag & drop here'}
        </div>
        <div style={{ fontSize: '13px', marginTop: '6px', color: 'var(--color-neutral-600)' }}>
          {isProcessing ? 'Extracting clinical values...' : 'Supported file formats: PDF, JPG, PNG (Max size: 10MB)'}
        </div>
      </div>

      {/* Uploaded Documents List */}
      {uploadedDocuments.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '12px' }}>
            Uploaded Documents ({uploadedDocuments.length})
          </h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {uploadedDocuments.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={20} color="var(--color-primary)" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)' }}>{doc.file_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{doc.document_type} • Ready for OCR</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                    <CheckCircle2 size={12} /> OCR Processed
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDoc(doc.id);
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    title="Remove document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ marginTop: '36px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => navigate('/patient/ocr-results')}
          style={{ padding: '12px 20px', backgroundColor: 'transparent', color: 'var(--color-neutral-600)', border: 'none', cursor: 'pointer', fontSize: '15px' }}
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={() => navigate('/patient/ocr-results')}
          style={{
            padding: '12px 28px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>{uploadedDocuments.length > 0 ? 'View Extracted OCR Results' : 'Continue'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;
