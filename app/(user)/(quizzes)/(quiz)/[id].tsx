import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { UserContext } from "../../../../context/UserContext";
import * as Haptics from "expo-haptics";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import CustomAlert from "@/components/CustomAlert";

// Array of background colors for questions
const questionColors = [
  "#D0DAFF", // Medium Blue
  "#FFD6C5", // Medium Peach
  "#C5FFD6", // Medium Mint
  "#FFC5E1", // Medium Pink
  "#FFFFC5", // Medium Cream
];

const optionColors = [
  "#B0BFFF", // Deeper Blue
  "#FFB0BF", // Deeper Pink
  "#B0FFC5", // Deeper Green
  "#FFC5A0", // Deeper Orange
];

const { width, height } = Dimensions.get("window");

export default function QuizScreen() {
  const [language, setLanguage] = useState(null);
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);

  const handleLanguageSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setIsLanguageSelected(true);
  };

  if (!isLanguageSelected) {
    return (
      <ImageBackground
        source={require("@/assets/images/profile2.jpeg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.languageSelectionContainer}>
            <Text style={styles.languageSelectionTitle}>Select Language</Text>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => handleLanguageSelect("en")}
            >
              <Text style={styles.languageButtonText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => handleLanguageSelect("ur")}
            >
              <Text style={styles.languageButtonText}>اردو</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return <QuizQuestionsScreen language={language} />;
}

const QuizQuestionsScreen = ({ language }) => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useContext(UserContext);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;
  const optionAnimations = useRef(
    [...Array(4)].map(() => new Animated.Value(height))
  ).current;
  const resultScaleAnim = useRef(new Animated.Value(0.3)).current;
  const resultOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (language !== null) {
      fetchQuizData();
      startBounceAnimation();

      // Start spin animation
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [language]);

  useEffect(() => {
    if (!loading && quizData) {
      animateQuestionEntrance();
    }
  }, [loading, currentQuestionIndex]);

  useEffect(() => {
    if (showResult) {
      animateResults();
    }
  }, [showResult]);

  const animateQuestionEntrance = () => {
    // Reset animations
    slideAnim.setValue(width);
    optionAnimations.forEach((anim) => anim.setValue(height));

    // Animate question slide in from right
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Animate options with staggered entrance from bottom
    Animated.stagger(
      150,
      optionAnimations.map((anim) =>
        Animated.spring(anim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        })
      )
    ).start();
  };

  const animateResults = () => {
    // Animate the result entrance with a bounce effect
    Animated.sequence([
      Animated.parallel([
        Animated.timing(resultOpacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(resultScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startBounceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/quiz/quizzes`);
      if (!response.ok) {
        throw new Error(`Failed to fetch quiz data: HTTP ${response.status}`);
      }
      const data = await response.json();
      const selectedQuiz = data.find((quiz) =>
        quiz.quizzes.some((q) => q._id === id)
      );
      if (!selectedQuiz) throw new Error("Quiz not found");

      const quizDetails = selectedQuiz.quizzes.find((q) => q._id === id);

      // Shuffle and select 5 random questions
      const shuffledQuestions = [...quizDetails.questions].sort(
        () => 0.5 - Math.random()
      );
      const selectedQuestions = shuffledQuestions.slice(0, 5);

      // Create a new quiz object with only the selected questions
      const modifiedQuiz = {
        ...quizDetails,
        questions: selectedQuestions,
      };

      setQuizData(modifiedQuiz);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      CustomAlert({
        title: "Error",
        message: `Failed to load quiz: ${error.message}`,
        type: "error",
        confirmText: "OK",
        onConfirm: () => router.back(),
      });
    } finally {
      setLoading(false);
    }
  };

 const submitQuizScore = async () => {
  if (submitting) return;

  setSubmitting(true);
  console.log("🔄 Starting quiz score submission...");

  try {
    // Validate user data
    const userId = user?.user?._id || user?._id;
    if (!userId) {
      throw new Error("User ID is missing. Please log in again.");
    }

    // Validate quiz data
    if (!id || !quizData) {
      throw new Error("Quiz data is missing");
    }

    console.log("📋 User ID:", userId);
    console.log("📋 Quiz ID:", id);
    console.log("📋 Selected Answers:", selectedAnswers);

    // Prepare score data with validation
    const scoreData = {
      userId: userId.toString(),
      scores: [
        {
          quizId: id.toString(),
          category: quizData?.category || "General Knowledge",
          selectedAnswers: selectedAnswers.map((ans) => ({
            questionId: ans.questionId.toString(),
            selectedOption: ans.selectedOption.toString(),
            isCorrect: ans.isCorrect || false,
          })),
          score: score,
          totalQuestions: 5,
          date: new Date().toISOString(),
        },
      ],
    };

    console.log("📤 Submitting score data:", JSON.stringify(scoreData, null, 2));

    // Submit to server
    const response = await fetch(`${BASE_URL}/quiz/submitscore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(scoreData),
    });

    console.log("📡 Response status:", response.status);
    console.log(
      "📡 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // Get response text first
    const responseText = await response.text();
    console.log("📡 Raw response:", responseText);

    // Check if response is HTML (error page)
    if (
      responseText.trim().startsWith("<!DOCTYPE html>") ||
      responseText.includes("<html")
    ) {
      throw new Error(
        `Server returned HTML error page. This usually means the API route is not properly configured. Response: ${responseText.substring(
          0,
          200
        )}...`
      );
    }

    // Check if response is JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(
        `Server returned invalid JSON: ${responseText.substring(0, 200)}...`
      );
    }

    // Check response status
    if (!response.ok) {
      console.error("❌ Server error response:", responseData);
      throw new Error(
        responseData.message ||
          responseData.error ||
          `HTTP error ${response.status}`
      );
    }

    console.log("✅ Score submission successful:", responseData);

    // Show total score in alert instead of success message
    const maxPossibleScore = 5 * 2;
    const scorePercentage = (score / maxPossibleScore) * 100;
    setShowFeedback(true);
    setFeedback({
      title: "Quiz Completed! 🎉",
      message: `Your total score is ${score} out of ${maxPossibleScore} points (${scorePercentage.toFixed(
        1
      )}%)`,
      type: "success",
      confirmText: "Great!",
    });
  } catch (error) {
    console.error("❌ Error submitting quiz score:", error);

    // Show user-friendly error message using CustomAlert
    let errorMessage = "Failed to save your score. ";

    if (error.message.includes("HTML error page")) {
      errorMessage += "The server is not properly configured. Please contact support.";
    } else if (error.message.includes("User ID is missing")) {
      errorMessage += "Please log in again and try again.";
    } else if (error.message.includes("Network")) {
      errorMessage += "Please check your internet connection and try again.";
    } else {
      errorMessage += error.message || "Please try again later.";
    }

    setShowFeedback(true);
    setFeedback({
      title: "Error Saving Score",
      message: errorMessage,
      type: "error",
      confirmText: "OK",
      showCancel: true,
      cancelText: "Try Again",
      onCancel: () => submitQuizScore(),
    });
  } finally {
    setSubmitting(false);
  }
};
  const handleAnswerSelection = (option) => {
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isCorrect =
      option[language] === currentQuestion.correctAnswer[language];

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore((prev) => prev + 2);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setSelectedOption(option[language]);
    setIsAnswerCorrect(isCorrect);

    const newAnswer = {
      questionId: currentQuestion._id,
      selectedOption: option[language],
      isCorrect: isCorrect,
    };

    setSelectedAnswers((prev) => {
      const updatedAnswers = [...prev];
      const existingIndex = prev.findIndex(
        (a) => a.questionId === currentQuestion._id
      );

      if (existingIndex >= 0) {
        updatedAnswers[existingIndex] = newAnswer;
      } else {
        updatedAnswers.push(newAnswer);
      }

      return updatedAnswers;
    });

    if (isCorrect) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Show feedback using CustomAlert
    setShowFeedback(true);
    setFeedback({
      title: isCorrect ? "Correct!" : "Incorrect",
      message: isCorrect ? "🌟 Wonderful! +2 points! 🌟" : "💪 Try again! 💪",
      type: isCorrect ? "success" : "warning",
      confirmText: "OK",
    });

    // Auto-dismiss alert after 2 seconds and proceed
    setTimeout(() => {
      setShowFeedback(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          setSelectedOption(null);
          setIsAnswerCorrect(null);
          fadeAnim.setValue(1);

          setCurrentQuestionIndex((prevIndex) => {
            if (prevIndex < 4) {
              return prevIndex + 1;
            } else {
              setShowResult(true);
              // Submit score after showing result
              setTimeout(() => {
                submitQuizScore();
              }, 1000);
              return prevIndex;
            }
          });
        }, 1000);
      });
    }, 2000);
  };

  const handleQuit = () => {
    setShowFeedback(true);
    setFeedback({
      title: "Quit Quiz",
      message: "Are you sure you want to quit the quiz? Your progress will not be saved.",
      type: "warning",
      confirmText: "Quit",
      showCancel: true,
      cancelText: "Cancel",
      onConfirm: () => router.back(),
    });
  };

  const renderOption = (option, index) => {
    const isSelected = selectedOption === option[language];
    const isCorrectAnswer =
      quizData.questions[currentQuestionIndex].correctAnswer[language] ===
      option[language];

    let optionStyle = [
      styles.optionButton,
      {
        backgroundColor: optionColors[index % optionColors.length],
        transform: [
          {
            scale: isSelected ? (isAnswerCorrect ? 1.0 : 0.98) : 1,
          },
        ],
      },
    ];

    if (isSelected) {
      optionStyle.push({
        backgroundColor: isAnswerCorrect
          ? "rgba(54, 235, 54, 0.2)"
          : "rgba(255, 99, 71, 0.2)",
        borderWidth: 1,
        borderColor: isAnswerCorrect ? "#32CD32" : "#FF6347",
      });
    }

    return (
      <Animated.View
        key={index}
        style={{
          transform: [
            { translateY: optionAnimations[index] },
            { scale: isSelected ? scaleAnim : 1 },
          ],
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          style={optionStyle}
          onPress={() => handleAnswerSelection(option)}
          disabled={selectedOption !== null}
          activeOpacity={0.7}
        >
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionText,
                isSelected && {
                  fontWeight: "700",
                  color: isAnswerCorrect ? "#32CD32" : "#FF6347",
                },
              ]}
            >
              {option[language]}
            </Text>
            {isSelected && (
              <MaterialCommunityIcons
                name={isAnswerCorrect ? "check-circle" : "close-circle"}
                size={28}
                color={isAnswerCorrect ? "#32CD32" : "#FF6347"}
                style={styles.feedbackIcon}
              />
            )}
            {!isSelected && selectedOption !== null && isCorrectAnswer && (
              <MaterialCommunityIcons
                name="check-circle"
                size={28}
                color="#32CD32"
                style={styles.feedbackIcon}
              />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderConfetti = () => {
    if (!showResult) return null;

    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 8 + 5;
      const color = [
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffff00",
        "#ff00ff",
        "#00ffff",
      ][Math.floor(Math.random() * 6)];
      const startPositionX = Math.random() * width;

      return (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: size / 2,
            top: 0,
            left: startPositionX,
            opacity: confettiAnim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0, 1, 1, 0],
            }),
            transform: [
              {
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, height * 0.7],
                }),
              },
              {
                translateX: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, (Math.random() - 0.5) * 200],
                }),
              },
              {
                rotate: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", `${Math.random() * 360}deg`],
                }),
              },
            ],
          }}
        />
      );
    });
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("@/assets/images/profile2.jpeg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingIcon,
              {
                transform: [
                  {
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                  {
                    rotate: spinAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="book-open-variant"
              size={64}
              color="#614385"
            />
          </Animated.View>
          <Text style={styles.loadingText}>Getting your adventure ready...</Text>
        </View>
      </ImageBackground>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <ImageBackground
        source={require("@/assets/images/profile2.jpeg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#FF5252" />
          <Text style={styles.errorText}>Oops! No questions found!</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  if (showResult) {
    const maxPossibleScore = 5 * 2;
    const scorePercentage = (score / maxPossibleScore) * 100;
    const isHighScore = scorePercentage >= 80;
    return (
      <ImageBackground
        source={require("@/assets/images/profile2.jpeg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          {isHighScore && renderConfetti()}
          <Animated.View
            style={[
              styles.resultContainer,
              {
                opacity: resultOpacityAnim,
                transform: [{ scale: resultScaleAnim }],
              },
            ]}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: spinAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              }}
            >
              <Text style={styles.resultEmoji}>
                {isHighScore ? "🏆" : "📚"}
              </Text>
            </Animated.View>
            <Text style={styles.resultText}>
              {isHighScore ? "Outstanding Achievement!" : "Keep Learning!"}
            </Text>
            <Text style={styles.finalScore}>
              Score: {score} out of {maxPossibleScore} points
              {"\n"}({scorePercentage.toFixed(1)}%)
            </Text>
            <Text style={styles.encouragementText}>
              {isHighScore
                ? "You've mastered this quiz! Amazing work! 🎉"
                : "You're making progress! Keep practicing to reach that trophy! 💪"}
            </Text>
            {submitting && (
              <ActivityIndicator style={styles.submitSpinner} color="#614385" />
            )}
            <TouchableOpacity
              style={[
                styles.playAgainButton,
                { backgroundColor: isHighScore ? "#32CD32" : "#614385" },
              ]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.playAgainText}>Play Again!</Text>
            </TouchableOpacity>
          </Animated.View>
          <CustomAlert
            visible={showFeedback}
            title={feedback?.title || ""}
            message={feedback?.message || ""}
            type={feedback?.type || "info"}
            confirmText={feedback?.confirmText || "OK"}
            showCancel={feedback?.showCancel || false}
            cancelText={feedback?.cancelText || "Cancel"}
            onConfirm={feedback?.onConfirm}
            onCancel={feedback?.onCancel}
            onClose={() => setShowFeedback(false)}
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <ImageBackground
      source={require("@/assets/images/profile2.jpeg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View
            style={[
              styles.questionContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateX: slideAnim }],
                backgroundColor:
                  questionColors[currentQuestionIndex % questionColors.length],
              },
            ]}
          >
            <View style={styles.progressContainer}>
              <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
              <Text style={styles.progressText}>
                Question {currentQuestionIndex + 1}/5
              </Text>
              <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
            </View>

            <Text style={styles.questionText}>
              {currentQuestion.question[language]}
            </Text>

            <Animated.View
              style={{
                backgroundColor: "#614385",
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 20,
                transform: [
                  {
                    scale: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    }),
                  },
                ],
              }}
            >
              <Text style={[styles.scoreText, { color: "#fff" }]}>
                Score: {score}
              </Text>
            </Animated.View>
          </Animated.View>

          {currentQuestion.options.map((option, index) =>
            renderOption(option, index)
          )}

          <TouchableOpacity
            style={styles.quitButton}
            onPress={handleQuit}
            activeOpacity={0.7}
          >
            <Text style={styles.quitButtonText}>Quit Quiz</Text>
          </TouchableOpacity>

          <CustomAlert
            visible={showFeedback}
            title={feedback?.title || ""}
            message={feedback?.message || ""}
            type={feedback?.type || "info"}
            confirmText={feedback?.confirmText || "OK"}
            showCancel={feedback?.showCancel || false}
            cancelText={feedback?.cancelText || "Cancel"}
            onConfirm={feedback?.onConfirm}
            onCancel={feedback?.onCancel}
            onClose={() => setShowFeedback(false)}
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIcon: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 20,
    color: "#333",
    fontFamily: "Poppins-Bold",
    marginTop: 20,
    textAlign: "center",
  },
  questionContainer: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    padding: 10,
    borderRadius: 15,
    width: "100%",
  },
  progressText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginHorizontal: 10,
    color: "#614385",
  },
  questionText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  scoreText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  },
  optionButton: {
    padding: 10,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    paddingHorizontal: 10,
    minHeight: 44,
  },
  optionText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginRight: 10,
  },
  feedbackIcon: {
    marginLeft: 10,
    width: 28,
    height: 28,
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  resultText: {
    fontSize: 25,
    fontFamily: "Poppins-Bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  finalScore: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    marginTop: 10,
    marginBottom: 16,
    color: "#614385",
    textAlign: "center",
  },
  encouragementText: {
    fontSize: 18,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 20,
    color: "#666",
    paddingHorizontal: 20,
  },
  playAgainButton: {
    marginTop: 24,
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 32,
    backgroundColor: "#32CD32",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    width: "70%",
    maxWidth: 300,
  },
  playAgainText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
    textAlign: "center",
  },
  quitButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#FF5252",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quitButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
    textAlign: "center",
  },
  languageSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  languageSelectionTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#333",
    marginBottom: 20,
  },
  languageButton: {
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 32,
    backgroundColor: "#614385",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    width: "70%",
    maxWidth: 300,
  },
  languageButtonText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#614385",
    alignSelf: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
    textAlign: "center",
  },
  submitSpinner: {
    marginVertical: 20,
  },
});