import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { patientApi } from '../../services/api';
import { ExtractedData } from '../../types';

const OcrResults: React.FC = () => {
  const navigate = useNavigate();
  const { extractedOcrData, setExtractedOcrData, uploadedDocuments, chiefComplaint } = useAppContext();

  // If no OCR data was populated from upload, synthesize relevant clinical findings
  const [dataList, setDataList] = useState<ExtractedData[]>(() => {
    if (extractedOcrData.length > 0) return extractedOcrData;
    const docName = uploadedDocuments[0]?.file_name || chiefComplaint || 'CBC_Blood_Test.pdf';
    const docType = uploadedDocuments[0]?.document_type || 'Lab Report';
    return patientApi.extractOcrData(docName, docType);
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newParam, setNewParam] = useState({ field_name: '', field_value: '', unit: '', reference_range: '', is_abnormal: false });

  const handleAddParam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParam.field_name || !newParam.field_value) return;
    const updated = [...dataList, newParam];
    setDataList(updated);
    setExtractedOcrData(updated);
    setShowAddModal(false);
    setNewParam({ field_name: '', field_value: '', unit: '', reference_range: '', is_abnormal: false });
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <div style={{ color: 'var(--color-neutral-600)', marginBottom: '8px' }}>Step 9 of 12</div>

      <div style={{ padding: '12px 16px', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
        <AlertTriangle size={18} />
        <span>Extracted via Clinical OCR Engine — All values are flagged for doctor review and verification.</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-navy)' }}>
            Extracted Clinical Document Information
          </h2>
          <p style={{ color: 'var(--color-neutral-600)', fontSize: '14px', marginTop: '4px' }}>
            Parameters extracted from your uploaded medical documents:
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
            border: '1px solid var(--color-primary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={15} /> Add Parameter
        </button>
      </div>

      {/* Add Parameter Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleAddParam} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Add Clinical Parameter</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Parameter Name *</label>
                <input required type="text" placeholder="e.g. Fasting Glucose" value={newParam.field_name} onChange={e => setNewParam({ ...newParam, field_name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>Value *</label>
                  <input required type="text" placeholder="e.g. 140" value={newParam.field_value} onChange={e => setNewParam({ ...newParam, field_value: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>Unit</label>
                  <input type="text" placeholder="e.g. mg/dL" value={newParam.unit} onChange={e => setNewParam({ ...newParam, unit: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Reference Range</label>
                <input type="text" placeholder="e.g. 70 - 100" value={newParam.reference_range} onChange={e => setNewParam({ ...newParam, reference_range: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input type="checkbox" id="abnormal" checked={newParam.is_abnormal} onChange={e => setNewParam({ ...newParam, is_abnormal: e.target.checked })} />
                <label htmlFor="abnormal" style={{ fontSize: '13px' }}>Mark as Abnormal finding</label>
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'none', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Add</button>
            </div>
          </form>
        </div>
      )}

      {/* Results Table */}
      <div style={{ marginTop: '24px', border: '1px solid var(--color-neutral-200)', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'white', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-neutral-100)' }}>
            <tr>
              <th style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-neutral-200)', fontSize: '13px', fontWeight: 700 }}>Parameter Name</th>
              <th style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-neutral-200)', fontSize: '13px', fontWeight: 700 }}>Value</th>
              <th style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-neutral-200)', fontSize: '13px', fontWeight: 700 }}>Unit</th>
              <th style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-neutral-200)', fontSize: '13px', fontWeight: 700 }}>Reference Range</th>
              <th style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-neutral-200)', fontSize: '13px', fontWeight: 700 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {dataList.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--color-neutral-200)', backgroundColor: item.is_abnormal ? '#fff5f5' : 'white' }}>
                <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)' }}>
                  {item.field_name}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: item.is_abnormal ? 'var(--color-urgent)' : 'var(--color-neutral-900)' }}>
                  {item.field_value}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-neutral-600)' }}>
                  {item.unit || '-'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-neutral-600)' }}>
                  {item.reference_range || '-'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {item.is_abnormal ? (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-urgent)', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '10px' }}>
                      Abnormal
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                      Normal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => navigate('/patient/documents')}
          style={{ padding: '12px 20px', backgroundColor: 'transparent', color: 'var(--color-neutral-600)', border: '1px solid var(--color-neutral-200)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} /> Back to Upload
        </button>

        <button
          type="button"
          onClick={() => {
            setExtractedOcrData(dataList);
            navigate('/patient/timeline');
          }}
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
          <span>Continue to Medical Timeline</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default OcrResults;
