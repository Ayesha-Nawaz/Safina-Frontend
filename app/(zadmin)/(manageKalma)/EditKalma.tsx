import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@/Ipconfig/ipconfig';

export default function EditKalma({ route, navigation }) {
  const { kalma } = route.params;
  
  const [formData, setFormData] = useState({
    title: '',
    // Add other fields as needed
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pre-fill the form with kalma data
    if (kalma) {
      setFormData({
        title: kalma.title || '',
        // Add other fields from your kalma object
      });
    }
  }, [kalma]);

  const handleUpdate = async () => {
    // Validate form
    if (!formData.title?.trim()) {
      Alert.alert('Error', 'Kalma title is required');
      return;
    }

    try {
      setLoading(true);
      // Update the API endpoint to match your backend route
      await axios.put(`${BASE_URL}/kalma/kalmas/${kalma._id}`, formData);
      
      Alert.alert(
        'Success',
        'Kalma updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Error updating kalma:', err);
      Alert.alert('Error', 'Failed to update kalma');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Kalma</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Kalma Title</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(title) => setFormData({ ...formData, title })}
          placeholder="Enter kalma title"
          multiline
        />

        {/* Add more fields as needed */}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.saveButton, loading && styles.disabledButton]} 
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    minHeight: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
    marginRight: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});