import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyLeadsApi } from '../api/leadApi';
import { useSocket } from '../context/SocketContext';

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

const LEADS_CACHE_KEY = '@crm_leads_cache';

export const useLeadList = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cachedLeads, setCachedLeads] = useState(null);

  // Hydrate from cache immediately on mount
  useEffect(() => {
      const hydrateCache = async () => {
          try {
              const cached = await AsyncStorage.getItem(LEADS_CACHE_KEY);
              if (cached) {
                  const parsed = JSON.parse(cached);
                  setCachedLeads(parsed);
                  if (!queryClient.getQueryData(['leads'])) {
                      queryClient.setQueryData(['leads'], parsed);
                  }
              }
          } catch (e) {
              console.error("Failed to hydrate leads cache", e);
          }
      };
      hydrateCache();
  }, [queryClient]);

  const {
    data: queryData,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const result = await getMyLeadsApi();
      const data = result.data || [];
      AsyncStorage.setItem(LEADS_CACHE_KEY, JSON.stringify(data));
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes stale time
  });

  const leads = queryData || cachedLeads || [];
  const loading = queryLoading && !leads.length && !cachedLeads;
  const error = queryError ? queryError.message : null;

  // Listen for real-time WebSocket updates
  useEffect(() => {
    if (!socket) return;

    const handleLeadUpdated = (data) => {
      // Instantly invalidate cache when backend pushes update
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      // You can also optimistically update the cache here if the socket payload has full data
    };

    socket.on('lead_updated', handleLeadUpdated);
    socket.on('lead_added', handleLeadUpdated);

    return () => {
      socket.off('lead_updated', handleLeadUpdated);
      socket.off('lead_added', handleLeadUpdated);
    };
  }, [socket, queryClient]);

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

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  return {
    leads: filteredLeads,
    allLeads: leads,
    loading,
    isRefreshing,
    error,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    refresh: handleRefresh,
    FILTER_TABS,
    tabCounts,
    STATUS_MAP,
  };
};
