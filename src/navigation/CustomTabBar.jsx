import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import { useTheme } from '../theme';
import AppText from '../components/common/AppText';
import { BRAND_GRADIENT } from '../theme/colors';

const CustomTabBar = ({ state, navigation }) => {

    const { colors } = useTheme();

    const icons = {
        Home: 'home',
        Status: 'users',
        NewLead: 'plus',
        Payout: 'credit-card',
        Profile: 'user'
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>

            {state.routes.map((route, index) => {

                const isFocused = state.index === index;

                const onPress = () => {
                    navigation.navigate(route.name);
                };

                // CENTER BUTTON
                if (route.name === 'NewLead') {
                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.centerContainer}
                        >
                            <LinearGradient
                                colors={BRAND_GRADIENT.colors}
                                start={BRAND_GRADIENT.start}
                                end={BRAND_GRADIENT.end}
                                style={styles.centerButton}
                            >
                                <Feather name="plus" size={35} color="#fff" />
                            </LinearGradient>

                            <AppText
                                variant="caption"
                                color="secondary"
                                style={{ marginTop: 8 }}
                            >
                                New Lead
                            </AppText>
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        style={styles.tabItem}
                    >

                        {/* ICON */}
                        {isFocused ? (
                           <MaskedView
                               style={{ width: 30, height: 30, marginBottom: 2}}
                               maskElement={
                                   <Feather
                                       name={icons[route.name]}
                                       size={30}
                                       color="black"
                                   />
                               }
                           >
                               <LinearGradient
                                   colors={BRAND_GRADIENT.colors}
                                   start={BRAND_GRADIENT.start}
                                   end={BRAND_GRADIENT.end}
                                   style={{ width: 30, height: 30,marginBottom: 2 }}
                               />
                           </MaskedView>
                        ) : (
                            <Feather
                                name={icons[route.name]}
                                size={30}
                                color={colors.iconColor}
                                style={{ marginBottom: 2 }}
                            />
                        )}

                        {/* TEXT */}
                        {isFocused ? (
                            <MaskedView
                                maskElement={
                                    <AppText
                                        variant="caption"
                                        style={{ fontWeight: '700' }}
                                    >
                                        {route.name}
                                    </AppText>
                                }
                            >
                                <LinearGradient
                                    colors={BRAND_GRADIENT.colors}
                                    start={BRAND_GRADIENT.start}
                                    end={BRAND_GRADIENT.end}
                                >
                                    <AppText
                                        variant="caption"
                                        color="secondary"
                                        style={{ opacity: 0, fontWeight: '700' }}
                                    >
                                        {route.name}
                                    </AppText>
                                </LinearGradient>
                            </MaskedView>
                        ) : (
                            <AppText variant="caption" color="secondary">
                                {route.name}
                            </AppText>
                        )}

                        {/* ACTIVE LINE */}
                        {isFocused && (
                            <LinearGradient
                                colors={BRAND_GRADIENT.colors}
                                start={BRAND_GRADIENT.start}
                                end={BRAND_GRADIENT.end}
                                style={styles.activeLine}
                            />
                        )}

                    </TouchableOpacity>
                );

            })}

        </View>
    );
};

const styles = StyleSheet.create({

    container: {
        flexDirection: 'row',
        height: 90,
        paddingBottom: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        borderTopWidth: 0.5,
        borderColor: '#ddd'
    },

    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingTop: 10
    },

    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -40
    },

    centerButton: {
        width: 65,
        height: 65,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3
    },

    activeLine: {
        width: 20,
        height: 3,
        borderRadius: 2,
        marginTop: 4
    }

});

export default CustomTabBar;