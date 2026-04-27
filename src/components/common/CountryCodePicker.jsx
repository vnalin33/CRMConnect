import React, { useState, useMemo, memo } from 'react';
import {
    View,
    Modal,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import { scale } from '../../theme/metrics';
import AppText from './AppText';

/**
 * Country list — India first (primary), rest alphabetical.
 */
const COUNTRIES = [
    { code: 'IN', name: 'India',          dial: '+91',  flag: '🇮🇳' },
    { code: 'AF', name: 'Afghanistan',    dial: '+93',  flag: '🇦🇫' },
    { code: 'AU', name: 'Australia',      dial: '+61',  flag: '🇦🇺' },
    { code: 'BD', name: 'Bangladesh',     dial: '+880', flag: '🇧🇩' },
    { code: 'BR', name: 'Brazil',         dial: '+55',  flag: '🇧🇷' },
    { code: 'CA', name: 'Canada',         dial: '+1',   flag: '🇨🇦' },
    { code: 'CN', name: 'China',          dial: '+86',  flag: '🇨🇳' },
    { code: 'EG', name: 'Egypt',          dial: '+20',  flag: '🇪🇬' },
    { code: 'FR', name: 'France',         dial: '+33',  flag: '🇫🇷' },
    { code: 'DE', name: 'Germany',        dial: '+49',  flag: '🇩🇪' },
    { code: 'ID', name: 'Indonesia',      dial: '+62',  flag: '🇮🇩' },
    { code: 'IQ', name: 'Iraq',           dial: '+964', flag: '🇮🇶' },
    { code: 'IE', name: 'Ireland',        dial: '+353', flag: '🇮🇪' },
    { code: 'IL', name: 'Israel',         dial: '+972', flag: '🇮🇱' },
    { code: 'IT', name: 'Italy',          dial: '+39',  flag: '🇮🇹' },
    { code: 'JP', name: 'Japan',          dial: '+81',  flag: '🇯🇵' },
    { code: 'KE', name: 'Kenya',          dial: '+254', flag: '🇰🇪' },
    { code: 'KW', name: 'Kuwait',         dial: '+965', flag: '🇰🇼' },
    { code: 'MY', name: 'Malaysia',       dial: '+60',  flag: '🇲🇾' },
    { code: 'MX', name: 'Mexico',         dial: '+52',  flag: '🇲🇽' },
    { code: 'NP', name: 'Nepal',          dial: '+977', flag: '🇳🇵' },
    { code: 'NL', name: 'Netherlands',    dial: '+31',  flag: '🇳🇱' },
    { code: 'NZ', name: 'New Zealand',    dial: '+64',  flag: '🇳🇿' },
    { code: 'NG', name: 'Nigeria',        dial: '+234', flag: '🇳🇬' },
    { code: 'OM', name: 'Oman',           dial: '+968', flag: '🇴🇲' },
    { code: 'PK', name: 'Pakistan',       dial: '+92',  flag: '🇵🇰' },
    { code: 'PH', name: 'Philippines',    dial: '+63',  flag: '🇵🇭' },
    { code: 'QA', name: 'Qatar',          dial: '+974', flag: '🇶🇦' },
    { code: 'RU', name: 'Russia',         dial: '+7',   flag: '🇷🇺' },
    { code: 'SA', name: 'Saudi Arabia',   dial: '+966', flag: '🇸🇦' },
    { code: 'SG', name: 'Singapore',      dial: '+65',  flag: '🇸🇬' },
    { code: 'ZA', name: 'South Africa',   dial: '+27',  flag: '🇿🇦' },
    { code: 'KR', name: 'South Korea',    dial: '+82',  flag: '🇰🇷' },
    { code: 'ES', name: 'Spain',          dial: '+34',  flag: '🇪🇸' },
    { code: 'LK', name: 'Sri Lanka',      dial: '+94',  flag: '🇱🇰' },
    { code: 'SE', name: 'Sweden',         dial: '+46',  flag: '🇸🇪' },
    { code: 'CH', name: 'Switzerland',    dial: '+41',  flag: '🇨🇭' },
    { code: 'TH', name: 'Thailand',       dial: '+66',  flag: '🇹🇭' },
    { code: 'TR', name: 'Turkey',         dial: '+90',  flag: '🇹🇷' },
    { code: 'AE', name: 'UAE',            dial: '+971', flag: '🇦🇪' },
    { code: 'GB', name: 'United Kingdom', dial: '+44',  flag: '🇬🇧' },
    { code: 'US', name: 'United States',  dial: '+1',   flag: '🇺🇸' },
    { code: 'VN', name: 'Vietnam',        dial: '+84',  flag: '🇻🇳' },
];

/**
 * Minimal inline country code picker.
 * Renders as small faded text: +91 ▾
 * Tapping opens a bottom-sheet country list.
 */
const CountryCodePicker = memo(({ selected, onSelect, style }) => {
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return COUNTRIES;
        const q = search.toLowerCase();
        return COUNTRIES.filter(
            c => c.name.toLowerCase().includes(q) || c.dial.includes(q),
        );
    }, [search]);

    const pick = (country) => {
        onSelect(country);
        setVisible(false);
        setSearch('');
    };

    return (
        <>
            {/* Inline trigger — small, subtle, faded */}
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => setVisible(true)}
                style={[styles.trigger, style]}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
                <AppText style={[styles.dialText, { color: colors.textSecondary }]}>
                    {selected.dial}
                </AppText>
                <Feather name="chevron-down" size={10} color={colors.textDisabled} style={{ marginLeft: 1 }} />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </TouchableOpacity>

            {/* Bottom-sheet modal */}
            <Modal
                visible={visible}
                animationType="fade"
                transparent
                onRequestClose={() => { setVisible(false); setSearch(''); }}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => { setVisible(false); setSearch(''); }}
                    style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
                />

                <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
                    {/* Drag handle */}
                    <View style={[styles.handle, { backgroundColor: colors.border }]} />

                    {/* Title */}
                    <AppText style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                        Country Code
                    </AppText>

                    {/* Search bar */}
                    <View style={[styles.searchRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                        <Feather name="search" size={14} color={colors.textPlaceholder} />
                        <TextInput
                            placeholder="Search..."
                            placeholderTextColor={colors.textPlaceholder}
                            value={search}
                            onChangeText={setSearch}
                            style={[styles.searchInput, { color: colors.textPrimary }]}
                            autoCorrect={false}
                        />
                    </View>

                    {/* Country list */}
                    <FlatList
                        data={filtered}
                        keyExtractor={c => c.code}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const active = item.code === selected.code;
                            return (
                                <TouchableOpacity
                                    onPress={() => pick(item)}
                                    activeOpacity={0.6}
                                    style={[
                                        styles.row,
                                        { borderBottomColor: colors.divider },
                                        active && { backgroundColor: colors.primaryLight || (colors.primary + '10') },
                                    ]}
                                >
                                    <AppText style={styles.rowFlag}>{item.flag}</AppText>
                                    <AppText
                                        numberOfLines={1}
                                        style={[
                                            styles.rowName,
                                            { color: active ? colors.primary : colors.textPrimary },
                                            active && { fontWeight: '600' },
                                        ]}
                                    >
                                        {item.name}
                                    </AppText>
                                    <AppText style={[styles.rowDial, { color: colors.textSecondary }]}>
                                        {item.dial}
                                    </AppText>
                                    {active && <Feather name="check" size={14} color={colors.primary} style={{ marginLeft: 6 }} />}
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <AppText color="secondary" style={{ textAlign: 'center', marginTop: 30, fontSize: 13 }}>
                                No results
                            </AppText>
                        }
                    />
                </View>
            </Modal>
        </>
    );
});

const styles = StyleSheet.create({
    /* ── Inline trigger ── */
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dialText: {
        fontSize: 13,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 16,
        marginLeft: 6,
        opacity: 0.5,
    },

    /* ── Modal ── */
    backdrop: {
        flex: 1,
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '60%',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingHorizontal: 16,
        paddingBottom: 16,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
    },
    handle: {
        width: 32,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 12,
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },

    /* ── Search ── */
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 10,
        height: 38,
        marginBottom: 6,
    },
    searchInput: {
        flex: 1,
        marginLeft: 6,
        fontSize: 13,
        padding: 0,
    },

    /* ── Country row ── */
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowFlag: {
        fontSize: 18,
        marginRight: 10,
    },
    rowName: {
        flex: 1,
        fontSize: 13,
        fontWeight: '400',
    },
    rowDial: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export { COUNTRIES };
export default CountryCodePicker;
