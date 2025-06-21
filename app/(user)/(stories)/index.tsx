import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import StoriesComponent from "@/components/StoriesComponent";
import NamazComponent from '@/components/NamazComponent';

export default function StoriesHomeScreen() {
    return (

        <ImageBackground
            source={require('@/assets/images/storyback.jpg')} // Replace with your image path
            style={styles.background}
        >
            <View style={styles.container}>
                <StoriesComponent />
            </View>
        </ImageBackground>
       
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1, // Ensures the background image covers the entire screen
        resizeMode: 'cover', // Makes the image cover the whole area
        width:'100%',
    },
    container: {
        flex: 1,
    },
});
