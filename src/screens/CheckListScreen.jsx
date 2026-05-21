import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { scale } from '../theme/metrics';
import AppText from '../components/common/AppText';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import CheckListCard from '../components/checklist/CheckListCard';

// ─── Static checklist data (from Figma) ──────────────────────────────────────
const CHECKLIST_ITEMS = [
    { id: '1', title: 'Pan card' },
    { id: '2', title: 'Aadhaar card' },
    { id: '3', title: 'Current address proof' },
    { id: '4', title: 'Latest 4 months payslips' },
    { id: '5', title: 'Bonus credit payslip and bank statement' },
    { id: '6', title: 'Latest 6 months salary credit bank statement' },
    { id: '7', title: 'Latest year form 16 (Part A & B)' },
    { id: '8', title: 'Work experience proof or offer letter' },
    { id: '9', title: 'Company ID card' },
    { id: '10', title: 'PF statement (If applicable) or Form 26 AS for latest year' },
];

// ─── Screen ──────────────────────────────────────────────────────────────────
const CheckListScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return CHECKLIST_ITEMS;
        return CHECKLIST_ITEMS.filter(item =>
            item.title.toLowerCase().includes(q),
        );
    }, [searchQuery]);

    const renderItem = ({ item }) => (
        <CheckListCard title={item.title} />
    );

    return (
        <ScreenWrapper
            withPadding={false}
            edges={['left', 'right']}
            style={{ backgroundColor: colors.background }}
        >
            {/* Fixed top bar */}
            <GradientScreenHeader
                title="Check Lists"
                showBack
                navigation={navigation}
                searchable
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search documents..."
            />

            {/* Scrollable checklist */}
            <FlatList
                data={filteredItems}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: 16 },
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="search" size={48} color={colors.textDisabled} />
                        <AppText color="secondary" style={styles.emptyText}>
                            No documents found
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

export default CheckListScreen;


