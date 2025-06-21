import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native"; // ✅ Import StyleSheet
import { useLocalSearchParams } from "expo-router";

const QuizListScreen = () => {
  const { selectedCategory } = useLocalSearchParams(); // Retrieve category

  const [quizData, setQuizData] = useState([]);

  useEffect(() => {
    fetch("http://192.168.100.12:5000/quiz/quizzes") // Replace with your API
      .then((res) => res.json())
      .then((data) => {
        setQuizData(data);
      })

      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  console.log(quizData);
  if (!selectedCategory) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18, color: "red" }}>
          Error: Category not found!
        </Text>
      </View>
    );
  }

  const categoryData = quizData.find(
    (category) => category.name.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        {selectedCategory} Quizzes
      </Text>

      {categoryData ? (
        <FlatList
          data={categoryData.quizzes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.quizCard}>
              <Text style={styles.quizTitle}>{item.title}</Text>
              <Text style={styles.syllabusItem}>
                Syllabus: {item.syllabus.join(", ")}
              </Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noDataText}>
          No quizzes available for this category.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, resizeMode: "cover" },
  overlay: { flex: 1, padding: 20, backgroundColor: "rgba(0, 0, 0, 0.6)" },
  heading: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  quizCard: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  quizTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#FFD700",
    marginBottom: 10,
    textAlign: "center",
  },
  syllabusItem: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 10,
  },
  noDataText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default QuizListScreen;
