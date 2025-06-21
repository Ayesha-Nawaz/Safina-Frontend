import DuaComponent from '@/components/DuaComponent';
import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';


export default function KalmasHomeScreen() {
    return (
        <ImageBackground
        source={require('@/assets/images/dua.jpg')} 
        style={styles.background}
      >
        <View style={styles.container}>
            <DuaComponent/>
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
        width:'100%',
        height:'100%',
      },
});
