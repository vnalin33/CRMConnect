import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { BRAND_GRADIENT } from '../../theme/colors';
import AppText from './AppText';

const GradientText = ({ children, style, variant = "display" }) => {

  return (
    <MaskedView
      maskElement={
        <AppText
          variant={variant}
          style={[style, { backgroundColor: 'transparent' }]}
        >
          {children}
        </AppText>
      }
    >
      <LinearGradient
        colors={BRAND_GRADIENT.colors}
        start={BRAND_GRADIENT.start}
        end={BRAND_GRADIENT.end}
        locations={BRAND_GRADIENT.locations}
      >
        <AppText
          variant={variant}
          style={[style, { opacity: 0 }]}
        >
          {children}
        </AppText>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;