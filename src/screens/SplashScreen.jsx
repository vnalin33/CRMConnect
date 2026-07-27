import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const LOGO_JPG = require('../assets/images/logo.jpg');

const GRADIENT_COLORS = ['#816FF5', '#6395EC', '#2DBFE6'];

// ── Brand name config ────────────────────────────────────────────────────────
// Use dotless-i (ı) so the dot can roll in separately
const BRAND_LETTERS = ['O', 'n', 'e', 'B', '\u0131', 'n', 'd'];
const DOT_LETTER_INDEX = 4;
const DOT_SIZE = 6;
const FONT_SIZE = 40;
const LETTER_DELAY = 75;

// ── Theme palettes ───────────────────────────────────────────────────────────
const THEMES = {
    light: {
        bg: '#D5E1EF',
        bgGradient: ['#DCE6F2', '#E8F0FA', '#DCE6F2'],
        glowOuter: 'rgba(129,111,245,0.05)',
        glowMiddle: 'rgba(99,149,236,0.08)',
        glowInner: 'rgba(129,111,245,0.10)',
        shimmerColors: [
            'rgba(255,255,255,0.0)',
            'rgba(255,255,255,0.0)',
            'rgba(129,111,245,0.12)',
            'rgba(99,149,236,0.15)',
            'rgba(45,191,230,0.12)',
            'rgba(255,255,255,0.0)',
            'rgba(255,255,255,0.0)',
        ],
        taglineColor: 'rgba(104,85,240,0.50)',
        statusBar: 'dark-content',
        logoSource: LOGO_PNG,
        logoBorderColors: ['#816FF5', '#6395EC', '#2DBFE6'],
        logoShadow: 'rgba(129,111,245,0.15)',
        orb1: 'rgba(129,111,245,0.06)',
        orb2: 'rgba(45,191,230,0.05)',
        orb3: 'rgba(99,149,236,0.04)',
    },
    dark: {
        bg: '#06081A',
        bgGradient: ['#060818', '#0C1028', '#060818'],
        glowOuter: 'rgba(129,111,245,0.06)',
        glowMiddle: 'rgba(99,149,236,0.10)',
        glowInner: 'rgba(129,111,245,0.18)',
        shimmerColors: [
            'rgba(0,0,0,0.0)',
            'rgba(0,0,0,0.0)',
            'rgba(129,111,245,0.20)',
            'rgba(99,149,236,0.25)',
            'rgba(45,191,230,0.20)',
            'rgba(0,0,0,0.0)',
            'rgba(0,0,0,0.0)',
        ],
        taglineColor: 'rgba(157,143,255,0.55)',
        statusBar: 'light-content',
        logoSource: LOGO_JPG,
        logoBorderColors: ['#816FF5', '#6395EC', '#2DBFE6'],
        logoShadow: 'rgba(129,111,245,0.40)',
        orb1: 'rgba(129,111,245,0.05)',
        orb2: 'rgba(45,191,230,0.04)',
        orb3: 'rgba(99,149,236,0.03)',
    },
};

// ── Single letter that fades in smoothly ─────────────────────────────────────
const SmoothLetter = ({ char, delay, fontSize, onFinish, onContainerLayout }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(12)).current;
    const scale = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 260,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 260,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            if (onFinish) onFinish();
        });
    }, []);

    return (
        <Animated.View
            style={{ opacity, transform: [{ translateY }, { scale }] }}
            onLayout={onContainerLayout}
        >
            <Text style={[styles.letterText, { fontSize }]}>{char}</Text>
        </Animated.View>
    );
};

// ── Floating ambient orb ─────────────────────────────────────────────────────
const FloatingOrb = ({ size, color, startX, startY, delay }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -15,
                    duration: 3000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 15,
                    duration: 3000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.floatingOrb,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    left: startX,
                    top: startY,
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        />
    );
};

// ── Main Splash Screen ───────────────────────────────────────────────────────
const SplashScreen = ({ navigation }) => {
    const { isDark } = useTheme();
    const theme = isDark ? THEMES.dark : THEMES.light;

    // Background
    const bgOpacity = useRef(new Animated.Value(0)).current;

    // Multi-layered glow
    const glowOuterOpacity = useRef(new Animated.Value(0)).current;
    const glowOuterScale = useRef(new Animated.Value(0.3)).current;
    const glowMiddleOpacity = useRef(new Animated.Value(0)).current;
    const glowMiddleScale = useRef(new Animated.Value(0.3)).current;
    const glowInnerOpacity = useRef(new Animated.Value(0)).current;
    const glowInnerScale = useRef(new Animated.Value(0.3)).current;

    // Glow breathing
    const breatheScale = useRef(new Animated.Value(1)).current;
    const breatheOpacity = useRef(new Animated.Value(1)).current;

    // Logo
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.5)).current;

    // Typewriter
    const [showLetters, setShowLetters] = useState(false);

    // Rolling dot for the "i"
    const dotRollX = useRef(new Animated.Value(100)).current;
    const dotRollOpacity = useRef(new Animated.Value(0)).current;
    const dotRollScale = useRef(new Animated.Value(0.4)).current;
    const [dotPos, setDotPos] = useState({ x: 0, y: 0 });

    // Shimmer
    const shimmerTranslateX = useRef(new Animated.Value(-SCREEN_W * 0.6)).current;
    const shimmerOpacity = useRef(new Animated.Value(0)).current;

    // Tagline
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const taglineTranslateY = useRef(new Animated.Value(18)).current;

    // Screen exit
    const screenOpacity = useRef(new Animated.Value(1)).current;

    // ── Rolling dot animation ────────────────────────────────────
    const startDotRoll = useCallback(() => {
        Animated.sequence([
            // Quick fade in
            Animated.timing(dotRollOpacity, {
                toValue: 1,
                duration: 100,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            // Roll from right to position
            Animated.timing(dotRollX, {
                toValue: 0,
                duration: 550,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                useNativeDriver: true,
            }),
            // Settle bounce
            Animated.sequence([
                Animated.timing(dotRollScale, {
                    toValue: 1.6,
                    duration: 100,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.spring(dotRollScale, {
                    toValue: 1,
                    friction: 3,
                    tension: 280,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    // ── Measure dotless-i position for dot placement ─────────────
    const handleDotLetterLayout = useCallback((e) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        setDotPos({
            x: x + (width - DOT_SIZE) / 2,
            y: y + height * 0.08,
        });
    }, []);

    // ── After last letter → shimmer + tagline + fade ─────────────
    const onLastLetterDone = useCallback(() => {
        // Wait for the dot to finish rolling, then shimmer
        Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
                Animated.timing(shimmerOpacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerTranslateX, {
                    toValue: SCREEN_W * 0.6,
                    duration: 600,
                    easing: Easing.inOut(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(shimmerOpacity, {
                toValue: 0,
                duration: 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();

        // Tagline
        Animated.sequence([
            Animated.delay(250),
            Animated.parallel([
                Animated.timing(taglineOpacity, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(taglineTranslateY, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Fade out
        Animated.sequence([
            Animated.delay(900),
            Animated.timing(screenOpacity, {
                toValue: 0,
                duration: 300,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => {
            navigation.replace('Login');
        });
    }, []);

    useEffect(() => {
        // ── Background ───────────────────────────────────────────
        Animated.timing(bgOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();

        // ── Layered glow reveal (outer → middle → inner) ─────────
        const glowSequence = Animated.stagger(100, [
            Animated.parallel([
                Animated.timing(glowOuterOpacity, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(glowOuterScale, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(glowMiddleOpacity, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(glowMiddleScale, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(glowInnerOpacity, {
                    toValue: 1,
                    duration: 350,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(glowInnerScale, {
                    toValue: 1,
                    duration: 450,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]);

        // ── Logo reveal ──────────────────────────────────────────
        const logoReveal = Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 450,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 8,
                    tension: 60,
                    useNativeDriver: true,
                }),
            ]),
        ]);

        // ── Gentle breathing glow ────────────────────────────────
        Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(breatheScale, {
                        toValue: 1.08,
                        duration: 2000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(breatheOpacity, {
                        toValue: 0.7,
                        duration: 2000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(breatheScale, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(breatheOpacity, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ).start();

        // ── Run main sequence ────────────────────────────────────
        Animated.sequence([
            Animated.delay(100),
            Animated.parallel([glowSequence, logoReveal]),
        ]).start(() => {
            setTimeout(() => {
                setShowLetters(true);
                // Start the dot rolling as the "ı" letter begins appearing
                setTimeout(startDotRoll, DOT_LETTER_INDEX * LETTER_DELAY);
            }, 250);
        });
    }, []);

    return (
        <Animated.View style={[styles.container, { backgroundColor: theme.bg, opacity: screenOpacity }]}>
            <StatusBar barStyle={theme.statusBar} backgroundColor="transparent" translucent />

            {/* ── Gradient background ──────────────────────────────── */}
            <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: bgOpacity }]}>
                <LinearGradient
                    colors={theme.bgGradient}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />
            </Animated.View>

            {/* ── Floating ambient orbs ────────────────────────────── */}
            <FloatingOrb size={180} color={theme.orb1} startX={SCREEN_W * 0.1} startY={SCREEN_H * 0.15} delay={200} />
            <FloatingOrb size={140} color={theme.orb2} startX={SCREEN_W * 0.6} startY={SCREEN_H * 0.7} delay={400} />
            <FloatingOrb size={100} color={theme.orb3} startX={SCREEN_W * 0.75} startY={SCREEN_H * 0.25} delay={600} />

            {/* ── Layered glow (breathes) ──────────────────────────── */}
            <Animated.View
                style={[styles.glowCenter, { transform: [{ scale: breatheScale }], opacity: breatheOpacity }]}
            >
                <Animated.View
                    style={[
                        styles.glowLayer,
                        styles.glowOuter,
                        {
                            backgroundColor: theme.glowOuter,
                            opacity: glowOuterOpacity,
                            transform: [{ scale: glowOuterScale }],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.glowLayer,
                        styles.glowMiddle,
                        {
                            backgroundColor: theme.glowMiddle,
                            opacity: glowMiddleOpacity,
                            transform: [{ scale: glowMiddleScale }],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.glowLayer,
                        styles.glowInner,
                        {
                            backgroundColor: theme.glowInner,
                            opacity: glowInnerOpacity,
                            transform: [{ scale: glowInnerScale }],
                        },
                    ]}
                />
            </Animated.View>

            {/* ── Logo ─────────────────────────────────────────────── */}
            <Animated.View
                style={[
                    styles.logoArea,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    },
                ]}
            >
                <LinearGradient
                    colors={[...theme.logoBorderColors, theme.logoBorderColors[0]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.logoBorder}
                >
                    <View style={[styles.logoInnerBg, { backgroundColor: theme.bg }]}>
                        <Image
                            source={theme.logoSource}
                            style={styles.logoImage}
                            resizeMode="cover"
                        />
                    </View>
                </LinearGradient>
                <View style={[styles.logoShadow, { backgroundColor: theme.logoShadow }]} />
            </Animated.View>

            {/* ── Brand name with rolling "i" dot ──────────────────── */}
            <View style={styles.brandRow}>
                {showLetters && (
                    <MaskedView
                        maskElement={
                            <View style={styles.maskInner}>
                                {/* Letter shapes as mask (dotless-i for "i") */}
                                {BRAND_LETTERS.map((char, i) => (
                                    <SmoothLetter
                                        key={`letter-${i}`}
                                        char={char}
                                        delay={i * LETTER_DELAY}
                                        fontSize={FONT_SIZE}
                                        onFinish={i === BRAND_LETTERS.length - 1 ? onLastLetterDone : undefined}
                                        onContainerLayout={i === DOT_LETTER_INDEX ? handleDotLetterLayout : undefined}
                                    />
                                ))}

                                {/* Rolling dot — part of the mask so it gets gradient fill */}
                                <Animated.View
                                    style={[
                                        styles.rollingDot,
                                        {
                                            left: dotPos.x,
                                            top: dotPos.y,
                                            opacity: dotRollOpacity,
                                            transform: [
                                                { translateX: dotRollX },
                                                { scale: dotRollScale },
                                            ],
                                        },
                                    ]}
                                />
                            </View>
                        }
                    >
                        <LinearGradient
                            colors={GRADIENT_COLORS}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            locations={[0, 0.5, 1]}
                        >
                            {/* Invisible sizing text (must match mask layout) */}
                            <View style={styles.maskInner}>
                                {BRAND_LETTERS.map((char, i) => (
                                    <Text key={`size-${i}`} style={[styles.letterText, { fontSize: FONT_SIZE, opacity: 0 }]}>
                                        {char}
                                    </Text>
                                ))}
                            </View>
                        </LinearGradient>
                    </MaskedView>
                )}

                {/* Shimmer light sweep */}
                <Animated.View
                    style={[
                        styles.shimmerWrap,
                        { opacity: shimmerOpacity, transform: [{ translateX: shimmerTranslateX }] },
                    ]}
                    pointerEvents="none"
                >
                    <LinearGradient
                        colors={theme.shimmerColors}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.shimmerBar}
                    />
                </Animated.View>
            </View>

            {/* ── Tagline ──────────────────────────────────────────── */}
            <Animated.View
                style={[
                    styles.taglineWrap,
                    {
                        opacity: taglineOpacity,
                        transform: [{ translateY: taglineTranslateY }],
                    },
                ]}
            >
                <Text style={[styles.tagline, { color: theme.taglineColor }]}>
                    Let's Grow Together
                </Text>
            </Animated.View>
        </Animated.View>
    );
};

const LOGO_SIZE = 104;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Floating orbs ─────────────────────────────────────────────
    floatingOrb: {
        position: 'absolute',
    },

    // ── Glow layers ───────────────────────────────────────────────
    glowCenter: {
        position: 'absolute',
        width: 300,
        height: 300,
        top: SCREEN_H / 2 - 190,
        left: SCREEN_W / 2 - 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowLayer: {
        position: 'absolute',
        borderRadius: 999,
    },
    glowOuter: {
        width: 280,
        height: 280,
    },
    glowMiddle: {
        width: 200,
        height: 200,
    },
    glowInner: {
        width: 140,
        height: 140,
    },

    // ── Logo ──────────────────────────────────────────────────────
    logoArea: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoBorder: {
        width: LOGO_SIZE + 8,
        height: LOGO_SIZE + 8,
        borderRadius: (LOGO_SIZE + 8) / 2,
        padding: 3.5,
    },
    logoInnerBg: {
        width: LOGO_SIZE + 1,
        height: LOGO_SIZE + 1,
        borderRadius: (LOGO_SIZE + 1) / 2,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        borderRadius: LOGO_SIZE / 2,
    },
    logoShadow: {
        position: 'absolute',
        bottom: -10,
        width: LOGO_SIZE * 0.6,
        height: 18,
        borderRadius: 9,
        opacity: 0.25,
    },

    // ── Brand text ────────────────────────────────────────────────
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 58,
    },
    maskInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    letterText: {
        fontWeight: '900',
        letterSpacing: 2,
        includeFontPadding: false,
        color: 'black',
    },

    // ── Rolling dot ───────────────────────────────────────────────
    rollingDot: {
        position: 'absolute',
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: 'black',
    },

    // ── Shimmer ───────────────────────────────────────────────────
    shimmerWrap: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    shimmerBar: {
        width: 140,
        height: '100%',
    },

    // ── Tagline ───────────────────────────────────────────────────
    taglineWrap: {
        marginTop: 10,
        alignItems: 'center',
    },
    tagline: {
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 2.5,
        textTransform: 'uppercase',
    },
});

export default SplashScreen;
