
import React, { useState, useEffect } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';

const LOGO_JPG = require('../../assets/images/logo.jpg');
const DASH_LIGHT_JPG = require('../../assets/images/dash_light.jpg');


const BRAND_GRADIENT = {
    colors: ['#816FF5', '#6395EC', '#2DBFE6'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
};

const AppLogo = ({ size = 96, style, isDashboard = false }) => {
    const [imgError, setImgError] = useState(false);
    const { isDark } = useTheme();

    const logoSource = (isDashboard && !isDark) ? DASH_LIGHT_JPG : LOGO_JPG;

    useEffect(() => {
        setImgError(false);
    }, [logoSource]);

    return (
        <View
            style={[
                {
                    width: size,
                    height: size,
                },
                style,
            ]}
            accessibilityLabel="ONEBind logo"
            accessibilityRole="image"
        >
            {!imgError ? (
                <Image
                    source={logoSource}
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
        </View>
    );
};

const styles = StyleSheet.create({
    circle: { justifyContent: 'center', alignItems: 'center' },
    letter: { color: '#FFFFFF', fontWeight: '800', fontStyle: 'italic', includeFontPadding: false },
});

export default AppLogo;