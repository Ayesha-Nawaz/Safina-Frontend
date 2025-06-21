import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import WuzuComponent from '@/components/WuduComponent';

export default function WuzuHomeScreen() {
    return (

        <ImageBackground
            source={require('@/assets/images/wuduback.jpeg')} // Replace with your image path
            style={styles.background}
        >
            <View style={styles.container}>
                <WuzuComponent/>
            </View>
        </ImageBackground>
       
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1, // Ensures the background image covers the entire screen
        resizeMode: 'cover', // Makes the image cover the whole area
    },
    container: {
        flex: 1,
    },
});