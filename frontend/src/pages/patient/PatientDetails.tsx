import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { MicDictationButton } from '../../components/MicDictationButton';

const PatientDetails: React.FC = () => {
  const navigate = useNavigate();
  const { patientData, setPatientData } = useAppContext();

  const [formData, setFormData] = useState({
    full_name: patientData.full_name || '',
    age: patientData.age ? String(patientData.age) : '',
    gender: patientData.gender || 'Male',
    phone_number: patientData.phone_number || '',
    address: patientData.address || '',
    dob: patientData.dob || '',
    emergency_contact_name: patientData.emergency_contact_name || '',
    emergency_contact_phone: patientData.emergency_contact_phone || ''
  });

  useEffect(() => {
    if (patientData) {
      setFormData((prev) => ({
        ...prev,
        ...(patientData.full_name ? { full_name: patientData.full_name } : {}),
        ...(patientData.age ? { age: String(patientData.age) } : {}),
        ...(patientData.gender ? { gender: patientData.gender } : {}),
        ...(patientData.phone_number ? { phone_number: patientData.phone_number } : {})
      }));
    }
  }, [patientData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPatientData({
      ...formData,
      age: parseInt(formData.age, 10) || 0
    } as any);
    navigate('/patient/chief-complaint');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ color: 'var(--color-neutral-600)', marginBottom: '8px' }}>Step 3 of 12</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-navy)' }}>Your Details</h2>
          <p style={{ color: 'var(--color-neutral-600)', fontSize: '14px', marginTop: '4px' }}>
            Enter your basic registration details or skip typing by using Voice Intake in the next step.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/patient/chief-complaint')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary)',
            color: 'var(--color-primary-dark)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Sparkles size={15} />
          <span>Skip to Voice Intake</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '24px', display: 'grid', gap: '16px', backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-neutral-200)' }}>
        <div style={{ display: 'grid', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>Full Name *</label>
            <MicDictationButton
              onTranscript={(spoken) => setFormData((prev) => ({ ...prev, full_name: spoken }))}
              title="Dictate full name"
            />
          </div>
          <input
            required
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="e.g. Ramesh Kumar"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--color-neutral-200)', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>Age *</label>
            <input
              required
              type="number"
              min="1"
              max="120"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 58"
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--color-neutral-200)', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--color-neutral-200)', fontSize: '14px', backgroundColor: 'white' }}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>Phone Number *</label>
            <input
              required
              type="tel"
              pattern="[0-9]{10}"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="10 digit mobile number"
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--color-neutral-200)', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--color-neutral-200)', fontSize: '14px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>City / Address</label>
            <MicDictationButton
              onTranscript={(spoken) => setFormData((prev) => ({ ...prev, address: spoken }))}
              title="Dictate city / address"
            />
          </div>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. New Delhi"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--color-neutral-200)', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>Emergency Contact Name</label>
            <input
              type="text"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--color-neutral-200)', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>Emergency Contact Phone</label>
            <input
              type="tel"
              name="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={handleChange}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--color-neutral-200)', fontSize: '14px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: '16px',
            padding: '12px 24px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          Continue to Chief Complaint
        </button>
      </form>
    </div>
  );
};

export default PatientDetails;
