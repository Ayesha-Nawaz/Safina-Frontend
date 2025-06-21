import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import KalmaComponent from '@/components/KalmaComponent';

export default function KalmasHomeScreen() {
    return (

        <ImageBackground
            source={require('@/assets/images/kalmas.jpeg')}
            style={styles.background}>
            <View style={styles.container}>
                <KalmaComponent />
            </View>
            </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        padding: 20,
    },
    background: {
        flex: 1,
        width:"100%"
      },
});
