import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '@/Ipconfig/ipconfig';

export default function ManageContent() {
  const [kalmas, setKalmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchKalmas();
  }, []);

  // Function to fetch kalmas from MongoDB
  const fetchKalmas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/kalma/kalmas`);
      setKalmas(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching kalmas:', err);
      setError('Failed to load kalmas. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle deletion
  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this kalma?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // Fixed: Added missing slash
              await axios.delete(`${BASE_URL}/api/kalmas/${id}`);
              // After successful deletion, refresh the list
              fetchKalmas();
              Alert.alert("Success", "Kalma deleted successfully");
            } catch (err) {
              console.error('Error deleting kalma:', err);
              Alert.alert("Error", "Failed to delete kalma");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Function to navigate to edit screen
  const navigateToEdit = (kalma) => {
    navigation.navigate('EditKalma', { kalma });
  };

  // Render each kalma item
  const renderKalmaItem = ({ item }) => (
    <View style={styles.kalmaItem}>
      <Text style={styles.kalmaText}>{item.title}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.editButton]} 
          onPress={() => navigateToEdit(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]} 
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Kalma Content</Text>

      {/* Display loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading kalmas...</Text>
        </View>
      )}

      {/* Display error message if any */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchKalmas}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Display kalmas list */}
      {!loading && !error && (
        <FlatList
          data={kalmas}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderKalmaItem}
          style={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No kalmas found. Add some!</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
  },
  list: {
    width: '100%',
  },
  kalmaItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kalmaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  kalmaTranslation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 20,
    width: '80%',
  },
  editButton: {
    backgroundColor: '#2196F3',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    width: 100,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  }
});