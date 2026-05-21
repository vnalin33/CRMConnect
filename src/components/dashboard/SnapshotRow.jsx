import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { BRAND_GRADIENT } from '../../theme/colors';
import AppText from '../common/AppText';
import SnapshotCard from './SnapshotCard';

const SnapshotRow = ({ data }) => {
    const { spacing } = useTheme();

    // Show only first 3 items in a single row
    const items = (data || []).slice(0, 3);

    const titleStyle = {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    };

    return (
        <View>
            <MaskedView
                style={{ flexDirection: 'row', marginBottom: spacing.md }}
                maskElement={
                    <AppText style={[titleStyle, { backgroundColor: 'transparent' }]}>
                        OPERATIONAL SNAPSHOT
                    </AppText>
                }
            >
                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    locations={BRAND_GRADIENT.locations}
                >
                    <AppText style={[titleStyle, { opacity: 0 }]}>
                        OPERATIONAL SNAPSHOT
                    </AppText>
                </LinearGradient>
            </MaskedView>
            <View style={[styles.row, { gap: spacing.sm }]}>
                {items.map((item) => (
                    <SnapshotCard
                        key={item.id}
                        icon={item.icon}
                        iconBgColor={item.iconBgColor}
                        count={item.count}
                        label={item.label}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
    },
});

export default SnapshotRow;
