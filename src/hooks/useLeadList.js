import { useState, useEffect, useCallback } from 'react';
import { getMyLeadsApi } from '../api/leadApi';

/**
 * STATUS_MAP — mirrors backend leadTrackModel.STATUS_MAP
 */
export const STATUS_MAP = {
  // ── Contact-phase statuses ──
  1:  { label: 'Unassigned',                 progress: 0,   color: '#2DBFE6' },  // New lead, leadpersonaldetails only
  2:  { label: 'Assigned',                   progress: 20,  color: '#6366F1' },  // CRM web admin → leadtrackdetails
  3:  { label: 'Following',                  progress: 30,  color: '#F59E0B' },
  4:  { label: 'Approved',                   progress: 50,  color: '#10B981' },
  5:  { label: 'Reject',                     progress: 0,   color: '#EF4444' },  // All rejections = 0%
  6:  { label: 'CIBIL Check',                progress: 30,  color: '#8B5CF6' },
  7:  { label: 'CIBIL Rejected',             progress: 0,   color: '#EF4444' },  // Rejection = 0%
  22: { label: 'No Response',                progress: 0,   color: '#6B7280' },  // 0% per corrected spec
  24: { label: 'Not Exist/Out of Service',   progress: 10,  color: '#6B7280' },

  // ── Lead-phase statuses (post-approved) ──
  10: { label: 'New Lead',                   progress: 0,   color: '#2DBFE6' },
  11: { label: 'Assigned',                   progress: 20,  color: '#6366F1' },  // Web-only, skip in mobile stepper
  12: { label: 'Doc Collection',             progress: 60,  color: '#8B5CF6' },
  13: { label: 'File Login',                 progress: 70,  color: '#3B82F6' },
  14: { label: 'File Login Rejected',        progress: 0,   color: '#EF4444' },  // Rejection = 0%
  15: { label: 'Sanction',                   progress: 80,  color: '#10B981' },
  16: { label: 'Sanction Rejected',          progress: 0,   color: '#EF4444' },  // Rejection = 0%
  17: { label: 'Disbursement',               progress: 100, color: '#059669' },  // Final stage
  18: { label: 'Completed',                  progress: 100, color: '#00C896' },
  23: { label: 'Doc Collection Rejected',    progress: 0,   color: '#EF4444' },  // Rejection = 0%
};

const FILTER_TABS = [
  { id: 'all',        label: 'All' },
  { id: 'new',        label: 'New',         statusCodes: [1, 10] },
  { id: 'assigned',   label: 'Assigned',    statusCodes: [2, 11] },
  { id: 'progress',   label: 'In Progress', statusCodes: [3, 4, 6, 12, 13, 15, 17] },
  { id: 'completed',  label: 'Completed',   statusCodes: [18] },
  { id: 'rejected',   label: 'Rejected',    statusCodes: [5, 7, 14, 16, 22, 23, 24] },
];

export const useLeadList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyLeadsApi();
      setLeads(result.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = leads.filter((lead) => {
    const statusCode = lead.statusCode || lead.track_status || lead.lead_status || 1;

    // Tab filter
    const tab = FILTER_TABS.find(t => t.id === activeTab);
    if (tab && tab.statusCodes && !tab.statusCodes.includes(statusCode)) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = `${lead.firstname || ''} ${lead.lastname || ''}`.toLowerCase();
      const phone = (lead.mobilenumber || '').toLowerCase();
      const loan = (lead.loantype || '').toLowerCase();
      if (!name.includes(q) && !phone.includes(q) && !loan.includes(q)) {
        return false;
      }
    }

    return true;
  });

  // Count per tab
  const tabCounts = {};
  FILTER_TABS.forEach((tab) => {
    if (tab.id === 'all') {
      tabCounts.all = leads.length;
    } else {
      tabCounts[tab.id] = leads.filter((l) => {
        const sc = l.statusCode || l.track_status || l.lead_status || 1;
        return tab.statusCodes.includes(sc);
      }).length;
    }
  });

  return {
    leads: filteredLeads,
    allLeads: leads,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    refresh: fetchLeads,
    FILTER_TABS,
    tabCounts,
    STATUS_MAP,
  };
};
