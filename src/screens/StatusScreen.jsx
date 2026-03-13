import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import AppText from '../components/common/AppText';
import FilterChips from '../components/status/FilterChips';
import StatusCard from '../components/status/StatusCard';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { DUMMY_LEADS } from '../api/mockData';

const StatusScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredLeads = useMemo(() => {
        return DUMMY_LEADS.filter(lead => {
            const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.loanType.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === 'All' || lead.status === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, activeFilter]);

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
                renderItem={({ item }) => <StatusCard lead={item} />}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="search" size={48} color={colors.textDisabled} />
                        <AppText color="secondary" style={styles.emptyText}>No leads found</AppText>
                    </View>
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingTop: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 12,
    },
});

export default StatusScreen;
