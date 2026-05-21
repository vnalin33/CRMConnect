import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { scale } from '../theme/metrics';
import AppText from '../components/common/AppText';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import FilterChips from '../components/status/FilterChips';
import CustomerCard from '../components/customers/CustomerCard';
import { useLeadList, STATUS_MAP } from '../hooks/useLeadList';

// Filter chip labels matching Figma
const LOAN_FILTERS = ['All', 'Home Loan', 'Business Loan', 'Personal Loan', 'Loan Against Property'];

const matchesLoanFilter = (loanType = '', filter = 'All') => {
    if (filter === 'All') return true;
    return loanType.toLowerCase().includes(filter.toLowerCase());
};

const transformCustomer = (apiLead) => {
    const statusCode = apiLead.track_status || apiLead.lead_status || apiLead.status || 1;
    const mapped = STATUS_MAP[statusCode] || { label: 'New Lead' };
    
    // Format amounts
    const rawAmount = apiLead.loanamount ? parseFloat(apiLead.loanamount) : 0;
    const formattedAmount = `₹ ${rawAmount.toLocaleString('en-IN')}`;
    
    const disbursedRaw = apiLead.disbursementamount ? parseFloat(apiLead.disbursementamount) : 0;
    const formattedDisbursed = `₹ ${disbursedRaw.toLocaleString('en-IN')}`;
    
    // Compute Payout amount if needed, though mostly disbursed is what we want here
    const payoutPercent = apiLead.payoutpercent ? parseFloat(apiLead.payoutpercent) : 0;
    const payoutAmountRaw = Math.round(disbursedRaw * payoutPercent / 100);
    const formattedPayout = `₹ ${payoutAmountRaw.toLocaleString('en-IN')}`;
    
    const dateStr = apiLead.createdon
        ? new Date(apiLead.createdon).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'N/A';
        
    const disbursedDateStr = apiLead.track_modified && statusCode >= 17
        ? new Date(apiLead.track_modified).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'N/A';

    return {
        id: String(apiLead.id),
        name: `${apiLead.firstname || ''} ${apiLead.lastname || ''}`.trim(),
        loanType: apiLead.loantype || 'N/A',
        status: apiLead.processingtype || mapped.label, // Use Instant/Cycle for the badge if available
        serviceType: apiLead.servicetype || 'N/A',
        loanAmount: formattedAmount,
        disbursedAmount: statusCode >= 17 ? formattedDisbursed : 'N/A', 
        payoutAmount: statusCode >= 17 ? formattedPayout : 'N/A',
        disbursementDate: statusCode >= 17 ? disbursedDateStr : 'N/A',
        createdDate: dateStr,
    };
};

// ─── Screen ──────────────────────────────────────────────────────────────────
const CustomersScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { allLeads, loading, isRefreshing, refresh } = useLeadList();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredCustomers = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        // Here we just map all leads. In the future, we could filter for disbursed only.
        const mapped = allLeads.map(transformCustomer);
        
        return mapped.filter(c => {
            const matchesSearch = !q ||
                c.name.toLowerCase().includes(q) ||
                c.loanType.toLowerCase().includes(q);
            const matchesFilter = matchesLoanFilter(c.loanType, activeFilter);
            return matchesSearch && matchesFilter;
        });
    }, [allLeads, searchQuery, activeFilter]);

    const renderItem = ({ item }) => (
        <CustomerCard customer={item} onPress={() => { }} />
    );

    return (
        <ScreenWrapper
            withPadding={false}
            edges={['left', 'right']}
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
                    { paddingBottom: 16 },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : (
                            <>
                                <Feather name="users" size={48} color={colors.textDisabled} />
                                <AppText color="secondary" style={styles.emptyText}>
                                    No customers found
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
        paddingTop: scale(4),
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: scale(60),
    },
    emptyText: {
        marginTop: scale(12),
    },
});

export default CustomersScreen;


