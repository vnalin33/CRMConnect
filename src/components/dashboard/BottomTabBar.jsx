import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';

const TABS = [
    { key: 'Home', icon: 'home', label: 'Home' },
    { key: 'Status', icon: 'bar-chart-2', label: 'Status' },
    { key: 'NewLead', icon: 'plus', label: 'New Lead', isFab: true },
    { key: 'Payout', icon: 'briefcase', label: 'Payout' },
    { key: 'Profile', icon: 'user', label: 'Profile' },
];

const BottomTabBar = ({ activeTab = 'Home', onTabPress }) => {
    const { colors, spacing, radius } = useTheme();

    return (
        <View style={[styles.bar, { backgroundColor: colors.tabBg, borderTopColor: colors.tabBorder }]}>
            {TABS.map(tab => {
                const isActive = activeTab === tab.key;

                if (tab.isFab) {
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => onTabPress?.(tab.key)}
                            style={[styles.fabBtn, { backgroundColor: colors.primary }]}
                            accessibilityRole="button"
                            accessibilityLabel={tab.label}
                        >
                            <Feather name={tab.icon} size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => onTabPress?.(tab.key)}
                        style={styles.tabItem}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isActive }}
                        accessibilityLabel={tab.label}
                    >
                        <Feather
                            name={tab.icon}
                            size={22}
                            color={isActive ? colors.tabActive : colors.tabInactive}
                        />
                        <AppText
                            variant="caption"
                            style={{
                                color: isActive ? colors.tabActive : colors.tabInactive,
                                marginTop: 2,
                                fontSize: 10,
                                fontWeight: isActive ? '600' : '400',
                            }}
                        >
                            {tab.label}
                        </AppText>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: 8,
        paddingBottom: 12,
    },
    tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    fabBtn: {
        width: 52, height: 52, borderRadius: 26,
        justifyContent: 'center', alignItems: 'center',
        marginTop: -20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
});

export default BottomTabBar;
