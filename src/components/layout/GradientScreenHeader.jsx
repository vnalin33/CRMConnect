import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    StatusBar,
    Animated,
    Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import { BRAND_GRADIENT } from '../../theme/colors';
import AppText from '../common/AppText';

/**
 * GradientScreenHeader
 *
 * Design — Default:
 *   ┌──────────────────────────────────────────┐  ← GRADIENT (status bar area)
 *   │  [status bar icons from OS]              │
 *   ├──────────────────────────────────────────┤  ← SURFACE BAR
 *   │  ← back     Title / Subtitle     🔍     │
 *   └──────────────────────────────────────────┘
 *
 * Design — Search Active:
 *   ┌──────────────────────────────────────────┐  ← GRADIENT
 *   │  [status bar icons from OS]              │
 *   ├──────────────────────────────────────────┤  ← SURFACE BAR
 *   │  ← back  [ Search input...    ]    ✕    │
 *   └──────────────────────────────────────────┘
 */
const GradientScreenHeader = ({
    title,
    subtitle,
    showBack = false,
    navigation,
    onBackPress,
    rightElement,
    children,
    gradientStyle,
    searchable = false,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Search...',
}) => {
    const { colors, spacing, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const [isSearchActive, setIsSearchActive] = useState(false);
    const inputRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    /**
     * AUTO-RESET SEARCH ON UNFOCUS:
     * When the user navigates away (e.g., switches tabs),
     * we reset the search bar to its "pre-state" (hidden).
     */
    useEffect(() => {
        if (!isFocused && isSearchActive) {
            handleCloseSearch();
        }
    }, [isFocused, isSearchActive, handleCloseSearch]);

    useEffect(() => {
        if (isSearchActive) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }).start();
            // Small delay to ensure view is rendered before focusing
            const timer = setTimeout(() => inputRef.current?.focus(), 150);
            return () => clearTimeout(timer);
        } else {
            fadeAnim.setValue(0);
        }
    }, [isSearchActive, fadeAnim]);

    const handleSearchToggle = () => {
        if (isSearchActive) {
            handleCloseSearch();
        } else {
            setIsSearchActive(true);
        }
    };

    const handleCloseSearch = useCallback(() => {
        onSearchChange?.('');
        setIsSearchActive(false);
        Keyboard.dismiss();
    }, [onSearchChange]);

    // In dark mode render a solid dark strip instead of the gradient
    const GradientOrDark = isDark ? View : LinearGradient;
    const gradientProps = isDark
        ? { style: [{ paddingTop: insets.top, backgroundColor: colors.background }, gradientStyle] }
        : {
            colors: BRAND_GRADIENT.colors,
            start: BRAND_GRADIENT.start,
            end: BRAND_GRADIENT.end,
            locations: BRAND_GRADIENT.locations,
            style: [{ paddingTop: insets.top }, gradientStyle],
          };

    // Determine what goes on the right side of the surface bar
    const renderRightElement = () => {
        if (searchable) {
            return (
                <TouchableOpacity
                    onPress={handleSearchToggle}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Feather
                        name={isSearchActive ? 'x' : 'search'}
                        size={22}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>
            );
        }
        if (rightElement) return rightElement;
        return <View style={styles.sideSpace} />;
    };

    return (
        <View>
            <GradientOrDark {...gradientProps}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="transparent"
                    translucent
                />
                {children}
            </GradientOrDark>

            {title ? (
                <View
                    style={[
                        styles.surfaceBar,
                        {
                            backgroundColor: colors.surface,
                            paddingHorizontal: spacing.base,
                            borderBottomColor: colors.border,
                        },
                    ]}
                >
                    {/* Left — back button or placeholder */}
                    <View style={styles.side}>
                        {showBack ? (
                            <TouchableOpacity
                                onPress={() => {
                                    handleCloseSearch();
                                    if (onBackPress) {
                                        onBackPress();
                                    } else {
                                        navigation?.goBack();
                                    }
                                }}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <Feather
                                    name="arrow-left"
                                    size={22}
                                    color={colors.textPrimary}
                                />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.sideSpace} />
                        )}
                    </View>

                    {/* Center — title OR search input */}
                    <View style={styles.center}>
                        {isSearchActive ? (
                            <Animated.View style={[styles.searchInputWrapper, {
                                opacity: fadeAnim,
                                transform: [{
                                    scale: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.95, 1],
                                    }),
                                }],
                                backgroundColor: colors.searchBg,
                                borderColor: colors.searchBorder,
                            }]}>
                                <Feather name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
                                <TextInput
                                    ref={inputRef}
                                    value={searchValue}
                                    onChangeText={onSearchChange}
                                    placeholder={searchPlaceholder}
                                    placeholderTextColor={colors.textDisabled}
                                    style={[styles.searchInput, { color: colors.textPrimary }]}
                                    returnKeyType="search"
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    onSubmitEditing={Keyboard.dismiss}
                                />
                            </Animated.View>
                        ) : (
                            <>
                                <AppText
                                    variant="h2"
                                    style={[styles.title, { color: colors.textPrimary }]}
                                    numberOfLines={1}
                                >
                                    {title}
                                </AppText>
                                {subtitle ? (
                                    <AppText
                                        variant="caption"
                                        style={[styles.subtitle, { color: colors.textSecondary }]}
                                        numberOfLines={1}
                                    >
                                        {subtitle}
                                    </AppText>
                                ) : null}
                            </>
                        )}
                    </View>

                    {/* Right — search toggle, custom element, or placeholder */}
                    <View style={styles.side}>
                        {renderRightElement()}
                    </View>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    surfaceBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    side: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sideSpace: {
        width: 22,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 1,
        textAlign: 'center',
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        borderWidth: 1,
        height: 38,
        paddingHorizontal: 12,
        width: '100%',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 0,
        includeFontPadding: false,
    },
});

export default GradientScreenHeader;
