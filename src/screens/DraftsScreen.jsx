import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { scale } from '../theme/metrics';
import AppText from '../components/common/AppText';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import DraftCard from '../components/drafts/DraftCard';
import { useDrafts } from '../hooks/useDrafts';
import { useAlert } from '../context/AlertContext';

const transformDraft = (dbDraft) => {
    const data = dbDraft.draft_data || {};
    const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Untitled Draft';
    
    const rawAmount = data.loanAmount ? parseFloat(data.loanAmount.replace(/[^0-9]/g, '')) : 0;
    const formattedAmount = rawAmount > 0 ? `₹ ${rawAmount.toLocaleString('en-IN')}` : 'Amount not set';
    
    const dateStr = dbDraft.updated_at
        ? new Date(dbDraft.updated_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Unknown Date';

    return {
        id: String(dbDraft.id),
        name,
        loanType: data.loanType || 'Type not set',
        amount: formattedAmount,
        savedAt: dateStr,
        draft_data: data,
    };
};

// ─── Screen ──────────────────────────────────────────────────────────────────
const DraftsScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();
    
    const { drafts, loading, isRefreshing, fetchDrafts, refresh, deleteDraft } = useDrafts();

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDrafts();
    }, [fetchDrafts]);

    // ── Delete: confirm then remove from list ──────────────────────────────
    const handleDelete = useCallback((id, name) => {
        showAlert({
            type: 'warning',
            title: 'Delete Draft',
            message: `Are you sure you want to delete the draft for "${name}"?`,
            showConfirm: true,
            buttonText: 'Delete',
            onConfirm: async () => {
                try {
                    await deleteDraft(id);
                } catch (err) {
                    showAlert({
                        type: 'error',
                        title: 'Error',
                        message: 'Failed to delete draft'
                    });
                }
            },
        });
    }, [deleteDraft, showAlert]);

    // ── Resume: navigate to lead creation / editing flow ──────────────────
    const handleResume = useCallback((draft) => {
        // Navigate to NewLead tab and pass draft data for pre-fill
        navigation.navigate('NewLead', { draftId: draft.id, prefill: draft });
    }, [navigation]);

    const filteredDrafts = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        const mapped = drafts.map(transformDraft);
        if (!q) return mapped;
        return mapped.filter(d =>
            d.name.toLowerCase().includes(q) ||
            d.loanType.toLowerCase().includes(q),
        );
    }, [searchQuery, drafts]);

    const renderItem = ({ item }) => (
        <DraftCard
            draft={item}
            onResume={() => handleResume(item)}
            onDelete={() => handleDelete(item.id, item.name)}
        />
    );

    return (
        <ScreenWrapper
            withPadding={false}
            edges={['left', 'right']}
            style={{ backgroundColor: colors.background }}
        >
            {/* ── Fixed top bar ── */}
            <GradientScreenHeader
                title="Drafts"
                subtitle="Continue where you left off"
                showBack
                navigation={navigation}
                searchable
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search drafts..."
            />

            {/* ── Draft list ── */}
            <FlatList
                data={filteredDrafts}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: 16 },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[colors.primary]} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : (
                            <>
                                <Feather name="file-text" size={48} color={colors.textDisabled} />
                                <AppText color="secondary" style={styles.emptyText}>
                                    No drafts found
                                </AppText>
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
        paddingTop: scale(12),
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: scale(60),
    },
    emptyText: {
        marginTop: scale(12),
    },
});

export default DraftsScreen;


