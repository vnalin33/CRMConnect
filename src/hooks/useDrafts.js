import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDraftsApi, saveDraftApi, deleteDraftApi } from '../api/draftApi';

const DRAFTS_CACHE_KEY = '@crm_drafts_cache';

export const useDrafts = () => {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    // Hydrate from cache immediately on mount
    useEffect(() => {
        const hydrateCache = async () => {
            try {
                const cached = await AsyncStorage.getItem(DRAFTS_CACHE_KEY);
                if (cached) {
                    setDrafts(JSON.parse(cached));
                }
            } catch (e) {
                console.error("Failed to hydrate drafts cache", e);
            }
        };
        hydrateCache();
    }, []);

    const fetchDrafts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getDraftsApi();
            const fetchedDrafts = data || [];
            setDrafts(fetchedDrafts);
            AsyncStorage.setItem(DRAFTS_CACHE_KEY, JSON.stringify(fetchedDrafts));
        } catch (err) {
            console.error('Failed to fetch drafts', err);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }, []);

    const saveDraft = async (draftData) => {
        try {
            const saved = await saveDraftApi(draftData);
            await fetchDrafts();
            return saved;
        } catch (err) {
            console.error('Failed to save draft', err);
            throw err;
        }
    };

    const deleteDraft = async (id) => {
        try {
            await deleteDraftApi(id);
            setDrafts(prev => {
                const updated = prev.filter(d => d.id !== id);
                AsyncStorage.setItem(DRAFTS_CACHE_KEY, JSON.stringify(updated));
                return updated;
            });
        } catch (err) {
            console.error('Failed to delete draft', err);
            throw err;
        }
    };

    return {
        drafts,
        loading: loading && initialLoad && drafts.length === 0,
        fetchDrafts,
        saveDraft,
        deleteDraft,
    };
};
