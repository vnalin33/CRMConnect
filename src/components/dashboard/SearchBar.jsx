import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';

const SearchBar = ({ value, onChangeText, placeholder = 'Search leads, clients...' }) => {
    const { colors, spacing, radius } = useTheme();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.searchBg,
                    borderColor: colors.searchBorder,
                    borderRadius: radius.full,
                    paddingHorizontal: spacing.base,
                    marginHorizontal: spacing.base,
                    marginVertical: spacing.md,
                },
            ]}
        >
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textDisabled}
                style={[styles.input, { color: colors.textPrimary, fontSize: 14 }]}
                accessibilityLabel="Search"
            />
            <Feather name="search" size={18} color={colors.primary} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        height: 48,
    },
    input: {
        flex: 1,
        padding: 0,
        margin: 0,
        includeFontPadding: false,
    },
});

export default SearchBar;
