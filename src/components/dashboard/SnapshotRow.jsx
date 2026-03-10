import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';
import SnapshotCard from './SnapshotCard';

const SNAPSHOT_DATA = [
    { id: '1', icon: 'file-text', iconBgColor: '#6855F0', count: '34', label: 'Files in Progress' },
    { id: '2', icon: 'check-circle', iconBgColor: '#00C896', count: '128', label: 'Disbursed Files' },
    { id: '3', icon: 'clock', iconBgColor: '#F59E0B', count: '11', label: 'Pending Approval' },
    { id: '4', icon: 'users', iconBgColor: '#2DBFE6', count: '26', label: 'Active Clients' },
];

const SnapshotRow = ({ data = SNAPSHOT_DATA }) => {
    const { spacing } = useTheme();

    return (
        <View style={{ marginTop: spacing.lg }}>
            <AppText
                variant="label"
                color="secondary"
                style={{ marginHorizontal: spacing.base, marginBottom: spacing.md }}
            >
                OPERATIONAL SNAPSHOT
            </AppText>
            <FlatList
                data={data}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing.base }}
                ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
                renderItem={({ item }) => (
                    <SnapshotCard
                        icon={item.icon}
                        iconBgColor={item.iconBgColor}
                        count={item.count}
                        label={item.label}
                    />
                )}
            />
        </View>
    );
};

export default SnapshotRow;
