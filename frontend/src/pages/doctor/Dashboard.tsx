import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  Search,
  RefreshCw,
  PlusCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { doctorApi } from '../../services/api';
import { CaseListItem } from '../../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<CaseListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'pending' | 'confirmed'>('all');
  const [loading, setLoading] = useState(false);

  const fetchQueue = () => {
    setLoading(true);
    doctorApi.getQueue().then((data) => {
      setQueue(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const totalCount = queue.length;
  const pendingCount = queue.filter((q) => q.case_status === 'ready_for_review').length;
  const urgentCount = queue.filter((q) => q.priority === 'urgent').length;
  const confirmedCount = queue.filter((q) => q.case_status === 'confirmed').length;

  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      item.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.chief_complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterPriority === 'urgent') return item.priority === 'urgent';
    if (filterPriority === 'pending') return item.case_status === 'ready_for_review';
    if (filterPriority === 'confirmed') return item.case_status === 'confirmed';
    return true;
  });

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-navy)' }}>
            Good day, Dr. Smith
          </h2>
          <div style={{ color: 'var(--color-neutral-600)', fontSize: '14px', marginTop: '2px' }}>
            All India Institute of Ayurveda (AIIA) • OPD Triage & Clinical Documentation Queue
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchQueue}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'white',
              border: '1px solid var(--color-neutral-200)',
              color: 'var(--color-neutral-800)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Queue</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/patient/welcome')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary-dark)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            <PlusCircle size={15} />
            <span>New Patient Intake Flow</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '24px' }}>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} color="var(--color-primary)" />
            <span>Total Patients Today</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-navy)', marginTop: '6px' }}>
            {totalCount}
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#0284c7" />
            <span>Pending Doctor Review</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>
            {pendingCount}
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-urgent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} />
            <span>Urgent Triage Flags</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-urgent)', marginTop: '6px' }}>
            {urgentCount}
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} />
            <span>Confirmed & Completed</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-success)', marginTop: '6px' }}>
            {confirmedCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginTop: '36px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>
          OPD Patient Queue ({filteredQueue.length})
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="var(--color-neutral-600)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by name, ID, symptom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '6px', border: '1px solid var(--color-neutral-200)', fontSize: '13px' }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-neutral-100)', padding: '3px', borderRadius: '8px', border: '1px solid var(--color-neutral-200)' }}>
            {(['all', 'urgent', 'pending', 'confirmed'] as const).map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                onClick={() => setFilterPriority(filterKey)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filterPriority === filterKey ? 'white' : 'transparent',
                  color: filterPriority === filterKey ? 'var(--color-primary)' : 'var(--color-neutral-600)',
                  boxShadow: filterPriority === filterKey ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {filterKey === 'all' ? 'All' : filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--color-neutral-200)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-neutral-50)' }}>
            <tr>
              <th style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-neutral-200)', fontSize: '13px', fontWeight: 700 }}>Patient</th>
              <th style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-neutral-200)', fontSize: '13px', fontWeight: 700 }}>Chief Complaint</th>
              <th style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-neutral-200)', fontSize: '13px', fontWeight: 700 }}>Priority Status</th>
              <th style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-neutral-200)', fontSize: '13px', fontWeight: 700 }}>Wait Time</th>
              <th style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-neutral-200)', fontSize: '13px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-neutral-200)', fontSize: '13px', fontWeight: 700 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.length > 0 ? (
              filteredQueue.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/doctor/cases/${item.id}`)}
                  style={{ cursor: 'pointer', transition: 'background-color 0.15s', borderBottom: '1px solid var(--color-neutral-200)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                >
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-navy)' }}>{item.patient_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)', marginTop: '2px' }}>
                      {item.patient_age} yrs • ID: {item.id}
                    </div>
                  </td>

                  <td style={{ padding: '16px 18px', maxWidth: '320px', fontSize: '14px', color: 'var(--color-neutral-800)' }}>
                    {item.chief_complaint}
                  </td>

                  <td style={{ padding: '16px 18px' }}>
                    {item.priority === 'urgent' && (
                      <span style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '16px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldAlert size={12} /> Urgent
                      </span>
                    )}
                    {item.priority === 'attention' && (
                      <span style={{ padding: '4px 10px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>
                        Attention
                      </span>
                    )}
                    {item.priority === 'normal' && (
                      <span style={{ padding: '4px 10px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>
                        Routine OPD
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '16px 18px', fontSize: '13px', color: 'var(--color-neutral-600)' }}>
                    {item.wait_time_minutes} mins
                  </td>

                  <td style={{ padding: '16px 18px' }}>
                    {item.case_status === 'confirmed' ? (
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> Confirmed
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7' }}>
                        Ready for Review
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '16px 18px' }}>
                    <button
                      type="button"
                      style={{
                        padding: '6px 14px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Review</span>
                      <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-neutral-600)' }}>
                  No cases match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
