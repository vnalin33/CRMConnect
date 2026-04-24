import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { scale } from '../theme/metrics';
import AppText from '../components/common/AppText';
import FilterChips from '../components/status/FilterChips';
import StatusCard from '../components/status/StatusCard';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { getMyLeadsApi, deleteLeadApi } from '../api/leadApi';
import { useFocusEffect } from '@react-navigation/native';
import { STATUS_MAP } from '../hooks/useLeadList';
import { Alert } from 'react-native';

/**
 * Transforms an API lead row into the shape StatusCard expects.
 */
const transformLead = (apiLead) => {
    const statusCode = apiLead.track_status || apiLead.lead_status || apiLead.status || 1;
    const mapped = STATUS_MAP[statusCode] || { label: 'New Lead', progress: 0 };
    const amount = apiLead.loanamount
        ? `${(parseFloat(apiLead.loanamount) / 100000).toFixed(1)}L`
        : '0.0L';
    const dateStr = apiLead.createdon
        ? new Date(apiLead.createdon).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';

    return {
        id: String(apiLead.id),
        name: `${apiLead.firstname || ''} ${apiLead.lastname || ''}`.trim(),
        loanType: apiLead.loantype || 'N/A',
        amount,
        status: mapped.label,
        statusCode,
        date: dateStr,
        progress: mapped.progress,
    };
};

const StatusScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getMyLeadsApi();
            const transformed = (result.data || []).map(transformLead);
            setLeads(transformed);
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDeleteLead = useCallback(async (lead) => {
        Alert.alert(
            'Delete Lead',
            `Are you sure you want to delete ${lead.name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deleteLeadApi(lead.id);
                            await fetchLeads(); // Refresh list after deletion
                        } catch (err) {
                            Alert.alert('Error', err.message || 'Failed to delete lead');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    }, [fetchLeads]);

    // Auto-refresh when screen gains focus (tab switch, returning from detail)
    useFocusEffect(
        useCallback(() => {
            fetchLeads();
        }, [fetchLeads])
    );

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.loanType.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (activeFilter === 'All') return matchesSearch;
            
            const label = lead.status.toLowerCase();
            const filter = activeFilter.toLowerCase();
            
            // Handle filter matching by label
            if (filter === 'unassigned') {
                return (label === 'unassigned' || label === 'new lead' || label === 'new contact') && matchesSearch;
            }
            if (filter === 'assigned') {
                return (label === 'assigned') && matchesSearch;
            }
            if (filter === 'no response') {
                return (label === 'no response') && matchesSearch;
            }
            
            return label.includes(filter) && matchesSearch;
        });
    }, [leads, searchQuery, activeFilter]);

    return (
        <ScreenWrapper withPadding={false} edges={['bottom', 'left', 'right']} style={{ backgroundColor: colors.background }}>
            <GradientScreenHeader
                title="Status List"
                subtitle={`All Leads : ${filteredLeads.length} total`}
                showBack
                navigation={navigation}
                searchable
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search leads, status..."
            />

            <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

            <FlatList
                data={filteredLeads}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <StatusCard
                        lead={item}
                        onPress={(id) => navigation.navigate('LeadDetail', { leadId: id })}
                        onDelete={handleDeleteLead}
                    />
                )}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchLeads} colors={[colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : (
                            <>
                                <Feather name="search" size={48} color={colors.textDisabled} />
                                <AppText color="secondary" style={styles.emptyText}>No leads found</AppText>
                            </>
                        )}
                    </View>
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingTop: scale(8),
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: scale(60),
    },
    emptyText: {
        marginTop: scale(12),
    },
});

export default StatusScreen;
