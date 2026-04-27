
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const LOGO = require('../../assets/images/logo.png');


const BRAND_GRADIENT = {
    colors: ['#816FF5', '#6395EC', '#2DBFE6'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
};

const AppLogo = ({ size = 72, animated = true, style }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        if (!animated) return;
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.06, duration: 2400, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 2400, useNativeDriver: true }),
            ])
        ).start();
    }, [animated, pulseAnim]);

    return (
        <Animated.View
            style={[
                {
                    width: size,
                    height: size,
                    transform: animated ? [{ scale: pulseAnim }] : [],
                },
                style,
            ]}
            accessibilityLabel="CRM Connect logo"
            accessibilityRole="image"
        >
            {!imgError ? (

                <Image
                    source={LOGO}
                    style={{ width: size, height: size, borderRadius: size / 2 }}
                    resizeMode="cover"
                    onError={() => setImgError(true)}
                    accessibilityIgnoresInvertColors
                />
            ) : (
                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    locations={BRAND_GRADIENT.locations}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
                >
                    <Text style={[styles.letter, { fontSize: size * 0.47 }]}>d</Text>
                </LinearGradient>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    circle: { justifyContent: 'center', alignItems: 'center' },
    letter: { color: '#FFFFFF', fontWeight: '800', fontStyle: 'italic', includeFontPadding: false },
});

export default AppLogo;