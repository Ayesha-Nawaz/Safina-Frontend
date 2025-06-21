import React, { useEffect, useRef, useContext } from "react";
import { 
    StyleSheet, 
    View, 
    Text, 
    ImageBackground,
    Animated,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    SafeAreaView
} from "react-native";
import HomeScreenComp from "@/components/HomeScreenComp";
import AdditionalFeatures from "@/components/AdditionalFeatures";
import { UserContext } from "@/context/UserContext";

export default function MainScreen() {
    const { user, loading } = useContext(UserContext);
    console.log("user at home",user);
    const floatAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Floating animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 15,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const onTitlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#FF1493" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
    source={require("@/assets/images/back2.jpeg")}
    style={styles.backgroundImage}
>

                <View style={styles.overlay}>
                    <View style={styles.headerTextContainer}>
                        <TouchableOpacity onPress={onTitlePress}>
                            <Animated.View
                                style={[
                                    styles.titleContainer,
                                    {
                                        transform: [
                                            { translateY: floatAnim },
                                            { scale: scaleAnim }
                                        ],
                                    },
                                ]}
                            >
                                <Text style={styles.headerText}>
                                    <Text style={styles.safinaText}>Safina </Text>
                                    <Text style={styles.separatorText}>✨</Text>
                                    <Text style={styles.subtitleText}>
                                        A vessel of  Knowledge
                                    </Text>
                                </Text>
                               
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                    
                    <AdditionalFeatures />
                    <HomeScreenComp />
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
        width:'100%'
    },backgroundImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',  // Ensures the image covers the entire screen
        position: 'absolute',
    },
    
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
    },
    headerTextContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    titleContainer: {
        padding: 10,
        borderRadius: 25,     
    },
    headerText: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
    },
    safinaText: {
        color: "#FF1493",
        fontSize: 38,
        fontFamily: "Airtravelers",
        textShadowColor: "rgba(216, 140, 181, 0.3)",
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    separatorText: {
        fontSize: 30,
        marginHorizontal: 10,
    },
    subtitleText: {
        color: "#4169E1",
        fontSize: 22,
        textAlign: "center",
        fontFamily: "Airtravelers",
    },
    welcomeText: {
        color: "#4169E1",
        fontSize: 18,
        textAlign: "center",
        fontFamily: "Airtravelers",
        marginTop: 10,
    },
});