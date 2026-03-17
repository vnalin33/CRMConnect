import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import AppText from '../components/common/AppText';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import FilterChips from '../components/status/FilterChips';
import CustomerCard from '../components/customers/CustomerCard';

// ─── Static Mock Data (from Figma) ────────────────────────────────────────────
const CUSTOMERS = [
    {
        id: '1',
        name: 'Manoj Kumar',
        loanType: 'Home Loan',
        status: 'Instant',
        loanAmount: '₹ 12,00,000',
        disbursedAmount: '₹ 11,80,000.00',
        disbursementDate: '20 Feb 2026',
    },
    {
        id: '2',
        name: 'Mani',
        loanType: 'Personal Loan',
        status: 'Cycle',
        loanAmount: '₹ 5,00,000',
        disbursedAmount: '₹ 4,80,000.00',
        disbursementDate: '22 Feb 2026',
    },
    {
        id: '3',
        name: 'Vikram',
        loanType: 'Business Loan',
        status: 'Cycle',
        loanAmount: '₹ 40,00,000',
        disbursedAmount: '₹ 38,00,000.00',
        disbursementDate: '10 Feb 2026',
    },
    {
        id: '4',
        name: 'Rajesh',
        loanType: 'Loan Against Property',
        status: 'Instant',
        loanAmount: '₹ 25,00,000',
        disbursedAmount: '₹ 24,50,000.00',
        disbursementDate: '15 Feb 2026',
    },
    {
        id: '5',
        name: 'Priya Sharma',
        loanType: 'Home Loan',
        status: 'Instant',
        loanAmount: '₹ 35,00,000',
        disbursedAmount: '₹ 33,75,000.00',
        disbursementDate: '05 Mar 2026',
    },
    {
        id: '6',
        name: 'Arjun Nair',
        loanType: 'Business Loan',
        status: 'Cycle',
        loanAmount: '₹ 18,00,000',
        disbursedAmount: '₹ 17,50,000.00',
        disbursementDate: '01 Mar 2026',
    },
];

// Filter chip labels matching Figma
const LOAN_FILTERS = ['All', 'Home Loan', 'Business Loan', 'Personal Loan', 'Loan Against Property'];

// Normalize loan type to match a filter chip label
const matchesLoanFilter = (loanType = '', filter = 'All') => {
    if (filter === 'All') return true;
    return loanType.toLowerCase().includes(filter.toLowerCase());
};

// ─── Screen ──────────────────────────────────────────────────────────────────
const CustomersScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredCustomers = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return CUSTOMERS.filter(c => {
            const matchesSearch = !q ||
                c.name.toLowerCase().includes(q) ||
                c.loanType.toLowerCase().includes(q);
            const matchesFilter = matchesLoanFilter(c.loanType, activeFilter);
            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, activeFilter]);

    const renderItem = ({ item }) => (
        <CustomerCard customer={item} onPress={() => { }} />
    );

    return (
        <ScreenWrapper
            withPadding={false}
            edges={['bottom', 'left', 'right']}
            style={{ backgroundColor: colors.background }}
        >
            {/* ── Fixed top bar ── */}
            <GradientScreenHeader
                title="Customers"
                showBack
                navigation={navigation}
                searchable
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search customers..."
            />

            {/* ── Filter chips ── */}
            <FilterChips
                filters={LOAN_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* ── Customer list ── */}
            <FlatList
                data={filteredCustomers}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + 20 },
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="users" size={48} color={colors.textDisabled} />
                        <AppText color="secondary" style={styles.emptyText}>
                            No customers found
                        </AppText>
                    </View>
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 12,
    },
});

export default CustomersScreen;
