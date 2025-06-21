import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '@/Ipconfig/ipconfig';


export default function EditAsmaulnabi() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;
  
  const [formData, setFormData] = useState({
    number: '',
    arabic: '',
    transliteration: '',
    urdu: '',
    meaning: '',
    urduMeaning: '',
    details: '',
    urduExplanation: '',
    audio: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        number: item.number?.toString() || '',
        arabic: item.arabic || '',
        transliteration: item.transliteration || '',
        urdu: item.urdu || '',
        meaning: item.meaning || '',
        urduMeaning: item.urduMeaning || '',
        details: item.details || '',
        urduExplanation: item.urduExplanation || '',
        audio: item.audio || '',
      });
    }
  }, [item]);

  const handleChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value
    });
  };

  const validateForm = () => {
    const requiredFields = [
      'number', 'arabic', 'transliteration', 'urdu', 
      'meaning', 'urduMeaning', 'details', 'urduExplanation', 'audio'
    ];
    s
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      Alert.alert(
        "Validation Error", 
        `The following fields are required: ${missingFields.join(', ')}`
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await axios.put(`${BASE_URL}/asmaulnabi/${item.number}`, formData);
      
      Alert.alert(
        "Success",
        "Asmaul Nabi updated successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating Asmaul Husna:', error);
      Alert.alert("Error", "Failed to update Asmaul Nabi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Asmaul Nabi</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Number</Text>
        <TextInput
          style={styles.input}
          value={formData.number}
          onChangeText={(value) => handleChange('number', value)}
          keyboardType="numeric"
          placeholder="Enter number"
          editable={false} // Number shouldn't be editable as it's the identifier
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Arabic Name</Text>
        <TextInput
          style={[styles.input, styles.arabicInput]}
          value={formData.arabic}
          onChangeText={(value) => handleChange('arabic', value)}
          placeholder="Enter Arabic name"
          textAlign="right"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Transliteration</Text>
        <TextInput
          style={styles.input}
          value={formData.transliteration}
          onChangeText={(value) => handleChange('transliteration', value)}
          placeholder="Enter Latin transliteration"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Urdu Name</Text>
        <TextInput
          style={[styles.input, styles.urduInput]}
          value={formData.urdu}
          onChangeText={(value) => handleChange('urdu', value)}
          placeholder="Enter Urdu name"
          textAlign="right"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>English Meaning</Text>
        <TextInput
          style={styles.input}
          value={formData.meaning}
          onChangeText={(value) => handleChange('meaning', value)}
          placeholder="Enter English meaning"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Urdu Meaning</Text>
        <TextInput
          style={[styles.input, styles.urduInput]}
          value={formData.urduMeaning}
          onChangeText={(value) => handleChange('urduMeaning', value)}
          placeholder="Enter Urdu meaning"
          textAlign="right"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Details (English)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.details}
          onChangeText={(value) => handleChange('details', value)}
          placeholder="Enter detailed explanation in English"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Explanation (Urdu)</Text>
        <TextInput
          style={[styles.input, styles.textArea, styles.urduInput]}
          value={formData.urduExplanation}
          onChangeText={(value) => handleChange('urduExplanation', value)}
          placeholder="Enter detailed explanation in Urdu"
          multiline
          numberOfLines={4}
          textAlign="right"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Audio URL</Text>
        <TextInput
          style={styles.input}
          value={formData.audio}
          onChangeText={(value) => handleChange('audio', value)}
          placeholder="Enter audio URL"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Update</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  arabicInput: {
    fontFamily: 'System', // You might want to use a specific Arabic font
    fontSize: 18,
  },
  urduInput: {
    fontFamily: 'System', // You might want to use a specific Urdu font
    fontSize: 18,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});