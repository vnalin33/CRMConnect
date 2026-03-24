import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { scale } from '../theme/metrics';
import AppText from '../components/common/AppText';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import DraftCard from '../components/drafts/DraftCard';

// ─── Static Mock Data (from Figma) ────────────────────────────────────────────
const INITIAL_DRAFTS = [
    {
        id: '1',
        name: 'Praveen Kumar',
        loanType: 'Home Loan',
        amount: '₹ 15,00,000',
        savedAt: '27 Feb 2026, 2:30 PM',
    },
    {
        id: '2',
        name: 'Mohan',
        loanType: 'Personal Loan',
        amount: '₹ 42,00,000',
        savedAt: '24 Feb 2026, 6:30 AM',
    },
    {
        id: '3',
        name: 'Maaran',
        loanType: 'Business Loan',
        amount: '₹ 32,00,000',
        savedAt: '23 Feb 2026, 12:00 PM',
    },
    {
        id: '4',
        name: 'Suhash',
        loanType: 'Home Loan',
        amount: '₹ 5,00,000',
        savedAt: '20 Feb 2026, 9:30 AM',
    },
    {
        id: '5',
        name: 'Monish',
        loanType: 'Loan Against Property',
        amount: '₹ 19,50,000',
        savedAt: '12 Feb 2026, 10:00 AM',
    },
];

// ─── Screen ──────────────────────────────────────────────────────────────────
const DraftsScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const [drafts, setDrafts] = useState(INITIAL_DRAFTS);
    const [searchQuery, setSearchQuery] = useState('');

    // ── Delete: confirm then remove from list ──────────────────────────────
    const handleDelete = useCallback((id, name) => {
        Alert.alert(
            'Delete Draft',
            `Are you sure you want to delete the draft for "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => setDrafts(prev => prev.filter(d => d.id !== id)),
                },
            ],
        );
    }, []);

    // ── Resume: navigate to lead creation / editing flow ──────────────────
    const handleResume = useCallback((draft) => {
        // Navigate to NewLead tab and pass draft data for pre-fill
        navigation.navigate('NewLead', { draftId: draft.id, prefill: draft });
    }, [navigation]);

    const filteredDrafts = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return drafts;
        return drafts.filter(d =>
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
            edges={['bottom', 'left', 'right']}
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
                    { paddingBottom: insets.bottom + 20 },
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="file-text" size={48} color={colors.textDisabled} />
                        <AppText color="secondary" style={styles.emptyText}>
                            No drafts found
                        </AppText>
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
