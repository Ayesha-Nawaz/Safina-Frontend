import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getKidsGuidance,
  KidsGuidance,
  commonTranslations,
  eventTranslations,
  eventDescriptionsUrdu,
  dateFormatTranslations,
  eventSignificance
} from "@/assets/data/Events";

export default function Events_Details() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [event, setEvent] = useState<any>(null);
  const [kidsGuidance, setKidsGuidance] = useState<KidsGuidance | null>(null);
  const [language, setLanguage] = useState<"english" | "urdu">("english");

  const { width: screenWidth } = Dimensions.get('window');

  // Animation values - consolidated for better performance
  const animations = {
    fade: useRef(new Animated.Value(0)).current,
    headerSlide: useRef(new Animated.Value(-100)).current,
    eventCardSlide: useRef(new Animated.Value(50)).current,
    scale: useRef(new Animated.Value(0.9)).current,
    bounce: useRef(new Animated.Value(0)).current,
    wiggle: useRef(new Animated.Value(0)).current,
    iconJump: useRef(new Animated.Value(0)).current,
    sections: {
      about: useRef(new Animated.Value(100)).current,
      guidance: useRef(new Animated.Value(100)).current,
      significance: useRef(new Animated.Value(100)).current,
    }
  };

  // Slide toggle animation
  const slideAnimation = useRef(new Animated.Value(0)).current;

  // Floating bubbles animation values
  const bubbles = Array.from({ length: 3 }, (_, i) => ({
    position: useRef(new Animated.Value(-50 - i * 20)).current,
    opacity: useRef(new Animated.Value(0)).current
  }));

  useEffect(() => {
    if (params.event) {
      try {
        const parsedEvent = JSON.parse(params.event as string);
        setEvent(parsedEvent);

        if (parsedEvent?.name) {
          const guidance = getKidsGuidance(parsedEvent.name);
          setKidsGuidance(guidance);
        }
      } catch (error) {
        console.error("Error parsing event data:", error);
      }
    }
  }, [params.event]);

  // Language toggle animation
  useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: language === "urdu" ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [language]);

  // Continuous animations
  useEffect(() => {
    if (!event) return;

    // Wiggle animation
    const wiggleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animations.wiggle, {
          toValue: 1,
          duration: 700,
          easing: Easing.sine,
          useNativeDriver: true,
        }),
        Animated.timing(animations.wiggle, {
          toValue: -1,
          duration: 700,
          easing: Easing.sine,
          useNativeDriver: true,
        }),
        Animated.timing(animations.wiggle, {
          toValue: 0,
          duration: 700,
          easing: Easing.sine,
          useNativeDriver: true,
        }),
      ])
    );

    // Icon jump animation
    const jumpAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animations.iconJump, {
          toValue: -15,
          duration: 600,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animations.iconJump, {
          toValue: 0,
          duration: 400,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    );

    // Bubble animations
    const bubbleAnimations = bubbles.map((bubble, index) => {
      const duration = 7000 + index * 1000;
      const delay = (index + 1) * 1000;

      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(bubble.position, {
              toValue: -350,
              duration,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(bubble.opacity, {
                toValue: 0.7,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(bubble.opacity, {
                toValue: 0,
                duration: duration - 1000,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(bubble.position, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    });

    wiggleAnimation.start();
    jumpAnimation.start();
    bubbleAnimations.forEach(anim => anim.start());

    return () => {
      wiggleAnimation.stop();
      jumpAnimation.stop();
      bubbleAnimations.forEach(anim => anim.stop());
    };
  }, [event]);

  // Entry animations
  useEffect(() => {
    if (!event) return;

    // Main entry animations
    Animated.parallel([
      Animated.timing(animations.fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animations.headerSlide, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.back(2.5)),
        useNativeDriver: true,
      }),
      Animated.timing(animations.scale, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.elastic(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Event card animation
    setTimeout(() => {
      Animated.spring(animations.bounce, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();

      Animated.timing(animations.eventCardSlide, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }).start();
    }, 200);

    // Staggered section animations
    setTimeout(() => {
      Animated.stagger(150, [
        Animated.timing(animations.sections.about, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: true,
        }),
        Animated.timing(animations.sections.guidance, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: true,
        }),
        Animated.timing(animations.sections.significance, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);
  }, [event]);

  // Helper functions
  const getEventIcon = (eventName: string) => {
    const name = eventName.toLowerCase();
    const iconMap = {
      ramadan: "🌙",
      "eid-ul-fitr": "🍮",
      "eid al-fitr": "🍮",
      "eid-ul-adha": "🐐",
      "eid al-adha": "🐐",
      ashura: "📚",
      "lailat-ul-qadr": "🙏",
      "night of power": "🙏",
      mawlid: "🕌",
      miraj: "🌠",
      "new year": "🎊",
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) return icon;
    }
    return "📅";
  };

  const formatDate = (date) => {
    if (!date) return language === "english" ? "Date not available" : "تاریخ دستیاب نہیں ہے";
    return dateFormatTranslations[language](date.hijri, date.gregorian);
  };

  const getEventName = () => {
    if (language === "urdu" && event.name) {
      return eventTranslations[event.name] || event.name;
    }
    return event.name;
  };

  const getEventDescription = () => {
    if (language === "urdu" && event.name) {
      return eventDescriptionsUrdu[event.name] || event.description;
    }
    return event.description;
  };

  const getGuidancePoints = () => {
    if (!kidsGuidance) return [];
    return kidsGuidance.points.map(point =>
      language === "english" ? point.pointEnglish : point.pointUrdu
    );
  };

  const getGuidanceTitle = () => {
    if (!kidsGuidance) return "";
    return language === "english" ? kidsGuidance.title : kidsGuidance.titleUrdu;
  };

  const handleEidAdhaNavigation = () => {
    const id = '67a983f806e0aa51c2206c69';
    if (event.name.toLowerCase().includes("eid-ul-adha") || event.name.toLowerCase().includes("eid al-adha")) {
      router.push({
        pathname: '(detailsscreens)/StoriesDetails',
        params: { id: id }
      });
    }
  };

  const getTextStyle = (baseStyle, isUrdu = false) => {
    return [
      baseStyle,
      isUrdu ? styles.urduFont : styles.englishFont,
      language === "urdu" && isUrdu ? styles.urduTextAlign : null,
      language === "urdu" && isUrdu ? styles.urduLineHeight : null
    ];
  };

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.errorContainer, { opacity: animations.fade }]}>
          <Text style={getTextStyle(styles.errorText, language === "urdu")}>
            {language === "english" ? "Event details not available" : "تقریب کی تفصیلات دستیاب نہیں ہیں"}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={getTextStyle(styles.backButtonText, language === "urdu")}>
              {language === "english" ? "Go Back" : "واپس جائیں"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const wiggle = animations.wiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg']
  });

  const slideTranslateX = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80], // Adjust based on your toggle width
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Slide Toggle */}
      <View style={styles.languageToggleContainer}>
        <View style={styles.slideToggle}>
          <Animated.View 
            style={[
              styles.slideIndicator,
              {
                transform: [{ translateX: slideTranslateX }]
              }
            ]}
          />
          <TouchableOpacity
            style={[styles.slideOption, language === "english" && styles.activeSlideOption]}
            onPress={() => setLanguage("english")}
          >
            <Text style={[
              styles.slideOptionText,
              language === "english" && styles.activeSlideOptionText
            ]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.slideOption, language === "urdu" && styles.activeSlideOption]}
            onPress={() => setLanguage("urdu")}
          >
            <Text style={[
              styles.slideOptionText,
              language === "urdu" && styles.activeSlideOptionText
            ]}>
              Urdu
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Decorative Background Elements */}
      {[
        { colors: ["#EAFFD0", "#45A29E"], style: styles.decorativeCircle2 },
        { colors: ["#86A8E7", "#D16BA5"], style: styles.decorativeCircle3 },
        { colors: ["#FFD3A5", "#FD6585"], style: styles.decorativeCircle4 },
        { colors: ["#D4FC79", "#96E6A1"], style: styles.decorativeCircle5 },
      ].map((circle, index) => (
        <LinearGradient
          key={index}
          colors={circle.colors}
          style={circle.style}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      ))}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Event Header Card */}
        <Animated.View
          style={[
            styles.eventHeaderCard,
            {
              opacity: animations.fade,
              transform: [
                { translateY: animations.eventCardSlide },
                { scale: animations.bounce }
              ],
            },
          ]}
        >
          {/* Confetti decorations */}
          {[
            { emoji: "🎉", style: { transform: [{ rotate: '15deg' }], top: -10, left: 20 } },
            { emoji: "✨", style: { transform: [{ rotate: '-25deg' }], top: -5, right: 30 } },
            { emoji: "⭐", style: { transform: [{ rotate: '10deg' }], bottom: 20, right: 15 } },
          ].map((confetti, index) => (
            <Animated.View key={index} style={[styles.confetti, confetti.style]}>
              <Text style={{ fontSize: index === 1 ? 18 : 22 }}>{confetti.emoji}</Text>
            </Animated.View>
          ))}

          <Animated.View
            style={[
              styles.eventIconContainer,
              { transform: [{ translateY: animations.iconJump }] }
            ]}
          >
            <Text style={styles.eventIcon}>{getEventIcon(event.name)}</Text>
          </Animated.View>

          <Animated.Text
            style={[
              ...getTextStyle(styles.eventTitle, language === "urdu"),
              { transform: [{ rotate: wiggle }] }
            ]}
          >
            {getEventName()}
          </Animated.Text>

          {event.date && (
            <Text style={getTextStyle(styles.eventDate, language === "urdu")}>
              {formatDate(event.date)}
            </Text>
          )}

          {/* Eid-ul-Adha Story Navigation Button */}
          {(event.name.toLowerCase().includes("eid-ul-adha") || event.name.toLowerCase().includes("eid al-adha")) && (
            <TouchableOpacity 
              style={styles.storyButton} 
              onPress={handleEidAdhaNavigation}
            >
              <MaterialCommunityIcons name="book-open-variant" size={20} color="#fff" />
              <Text style={getTextStyle(styles.storyButtonText, language === "urdu")}>
                {language === "english" ? "Story of Hazrat Ismail" : "حضرت اسماعیل کی کہانی "}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* About Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: animations.fade,
              transform: [{ translateY: animations.sections.about }],
            },
          ]}
        >
          <Text style={getTextStyle(styles.sectionTitle, language === "urdu")}>
            {language === "english" ? commonTranslations.english.aboutThisEvent : commonTranslations.urdu.aboutThisEvent}
          </Text>
          <View style={styles.infoCard}>
            <Text style={getTextStyle(styles.infoText, language === "urdu")}>
              {getEventDescription()}
            </Text>
          </View>
        </Animated.View>

        {/* Kids Guidance Section */}
        {kidsGuidance && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: animations.fade,
                transform: [{ translateY: animations.sections.guidance }],
              },
            ]}
          >
            <Text style={getTextStyle(styles.sectionTitle, language === "urdu")}>
              {getGuidanceTitle()}
            </Text>
            <View style={styles.guidanceCard}>
              {getGuidancePoints().map((point, index) => {
                const bulletEmojis = ['🌟', '🎯', '🎨', '🎊', '📚', '🧩'];
                const bulletEmoji = bulletEmojis[index % bulletEmojis.length];

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.guidancePoint,
                      {
                        opacity: animations.fade,
                        transform: [
                          {
                            translateX: animations.fade.interpolate({
                              inputRange: [0, 1],
                              outputRange: [30 * (index + 1), 0]
                            })
                          },
                          {
                            scale: animations.fade.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1]
                            })
                          }
                        ]
                      }
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.bulletPoint,
                        {
                          transform: [
                            {
                              rotate: animations.wiggle.interpolate({
                                inputRange: [-1, 0, 1],
                                outputRange: [(index % 2 === 0 ? '-' : '') + '5deg', '0deg', (index % 2 === 0 ? '' : '-') + '5deg']
                              })
                            }
                          ]
                        }
                      ]}
                    >
                      <Text style={styles.bulletIcon}>{bulletEmoji}</Text>
                    </Animated.View>
                    <Text style={getTextStyle(styles.guidanceText, language === "urdu")}>
                      {point}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Significance Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: animations.fade,
              transform: [{ translateY: animations.sections.significance }],
            },
          ]}
        >
          <Text style={getTextStyle(styles.sectionTitle, language === "urdu")}>
            {language === "english" ? commonTranslations.english.significance : commonTranslations.urdu.significance}
          </Text>
          <View style={styles.infoCard}>
            <Text style={getTextStyle(styles.infoText, language === "urdu")}>
              {language === "english"
                ? (eventSignificance.english[event.name] || eventSignificance.english.default)
                : (eventSignificance.urdu[event.name] || eventSignificance.urdu.default)
              }
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F1",
    overflow: 'hidden',
    paddingTop: 10
  },
  // Font styles
  englishFont: {
    fontFamily: 'Poppins-Regular',
  },
  urduFont: {
    fontFamily: 'NotoNastaliqUrdu-Regular', // You'll need to add this font to your project
  },
  urduTextAlign: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  urduLineHeight: {
    lineHeight: 32, // Increased line height for Urdu text
  },
  languageToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  slideToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    borderRadius: 25,
    padding: 4,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#E0E7FF',
  },
  slideIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 80,
    height: 32,
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  slideOption: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  activeSlideOption: {
    // Active state handled by indicator
  },
  slideOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    fontFamily: 'Poppins-Regular', // Both options use English font
  },
  activeSlideOptionText: {
    color: '#FFFFFF',
  },
  // Decorative circles
  decorativeCircle2: {
    position: "absolute",
    bottom: 70,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.7,
  },
  decorativeCircle3: {
    position: "absolute",
    top: 80,
    left: -70,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.9,
  },
  decorativeCircle4: {
    position: "absolute",
    bottom: -80,
    right: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.7,
  },
  decorativeCircle5: {
    position: "absolute",
    top: 150,
    right: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.7,
  },
  confetti: {
    position: 'absolute',
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 25,
  },
  eventHeaderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  eventIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  eventIcon: {
    fontSize: 45,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#FF61D2",
    textAlign: "center",
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
  },
  storyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  storyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#8B5CF6",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoText: {
    fontSize: 15,
    color: "#4A5568",
    lineHeight: 24,
  },
  guidanceCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#10B981",
    borderStyle: "dashed",
  },
  guidancePoint: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    height: 30,
  },
  bulletIcon: {
    fontSize: 20,
  },
  guidanceText: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: "#8B5CF6",
  },
});