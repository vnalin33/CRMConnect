import { useState, useEffect, useCallback } from 'react';
import { getLeadDetailApi, updateLeadStatusApi, assignLeadApi } from '../api/leadApi';
import { STATUS_MAP } from './useLeadList';
import { useFocusEffect } from '@react-navigation/native';

export const useLeadDetail = (leadId) => {
  const [lead, setLead] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getLeadDetailApi(leadId);
      setLead(result.lead || null);
      setHistory(result.history || []);
    } catch (err) {
      setError(err.message || 'Failed to load lead detail');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  // Auto-refresh when screen gains focus
  useFocusEffect(
      useCallback(() => {
          fetchDetail();
      }, [fetchDetail])
  );

  const updateStatus = useCallback(async (newStatus, notes) => {
    setUpdating(true);
    setError(null);
    try {
      await updateLeadStatusApi(leadId, newStatus, notes);
      await fetchDetail(); // Refresh
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [leadId, fetchDetail]);

  const assignLead = useCallback(async (notes) => {
    setUpdating(true);
    setError(null);
    try {
      await assignLeadApi(leadId, notes);
      await fetchDetail(); // Refresh
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [leadId, fetchDetail]);

  return {
    lead,
    history,
    loading,
    updating,
    error,
    updateStatus,
    assignLead,
    refresh: fetchDetail,
    STATUS_MAP,
  };
};
