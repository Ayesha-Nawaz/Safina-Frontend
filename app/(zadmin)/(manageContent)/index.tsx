import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  SafeAreaView, ScrollView, StatusBar, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL } from '@/Ipconfig/ipconfig';



export default function ManageContent() {
  const navigation = useNavigation();
  const [contentCounts, setContentCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const contentCategories = [
    {
      id: 'kalma',
      title: 'Kalma',
      description: 'Manage kalma content and categories',
      icon: 'text-box-outline',
      route: '(manageKalma)',
      color: '#3B82F6',
      apiEndpoint: `${BASE_URL}/kalma/kalmas`
    },
    {
      id: 'dua',
      title: 'Dua',
      description: 'Add, edit or remove duas',
      icon: 'hands-pray',
      route: '(managedua)',
      color: '#10B981',
      apiEndpoint: `${BASE_URL}/dua/getDua`
    },
    {
      id: 'stories',
      title: 'Stories',
      description: 'Manage Islamic stories collection',
      icon: 'book-open-variant',
      route: '(manageStories)',
      color: '#F59E0B',
      apiEndpoint: `${BASE_URL}/story/stories`
    },
    {
      id: 'namaz',
      title: 'Namaz',
      description: 'Update prayer times and instructions',
      icon: 'mosque',
      route: '(manageNamaz)',
      color: '#8B5CF6',
      apiEndpoint: `${BASE_URL}/namaz/namaz`
    },
    {
      id: 'wudu',
      title: 'Wudu',
      description: 'Manage ablution guides and steps',
      icon: 'water-outline',
      route: '(manageWudu)',
      color: '#EC4899',
      apiEndpoint: `${BASE_URL}/wudu/wudu`
    },
    {
      id: 'asmaulhusna',
      title: 'Asma-ul-Husna',
      description: 'Manage the 99 Names of Allah',
      icon: 'star-circle-outline',
      route: '(manageasmaulhusna)',
      color: '#06B6D4',
      apiEndpoint: `${BASE_URL}/asmaulhusna/names`
    },
    {
      id: 'asmaulnabi',
      title: 'Asma-ul-Nabi',
      description: 'Manage the names of Prophet Muhammad (PBUH)',
      icon: 'crown-outline',
      route: '(manageasmaulnabi)',
      color: '#FB7185',
      apiEndpoint: `${BASE_URL}/asmaulnabi/names`
    }
  ];

  // Function to fetch data from API and count items
  const fetchContentCount = async (category) => {
    try {
      const response = await fetch(category.apiEndpoint);
      const data = await response.json();
      
      // Count items based on the response structure
      let count = 0;
      if (Array.isArray(data)) {
        count = data.length;
      } else if (data && typeof data === 'object') {
        // If data is an object, check for common array properties
        if (data.data && Array.isArray(data.data)) {
          count = data.data.length;
        } else if (data.items && Array.isArray(data.items)) {
          count = data.items.length;
        } else if (data.results && Array.isArray(data.results)) {
          count = data.results.length;
        } else {
          // If it's an object with keys, count the keys
          count = Object.keys(data).length;
        }
      }
      
      return { [category.id]: count };
    } catch (error) {
      console.error(`Error fetching ${category.title} data:`, error);
      return { [category.id]: 0 };
    }
  };

  // Fetch all content counts
  const fetchAllContentCounts = async () => {
    setLoading(true);
    try {
      const promises = contentCategories.map(category => fetchContentCount(category));
      const results = await Promise.all(promises);
      
      // Merge all results into a single object
      const countsObject = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setContentCounts(countsObject);
    } catch (error) {
      console.error('Error fetching content counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContentCounts();
  }, []);

  // Calculate total content items
  const getTotalContentItems = () => {
    return Object.values(contentCounts).reduce((total, count) => total + count, 0);
  };

  const renderContentCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      onPress={() => navigation.navigate(item.route)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
        <Icon name={item.icon} size={32} color={item.color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        <Text style={styles.itemCount}>
          {loading ? 'Loading...' : `${contentCounts[item.id] || 0} items`}
        </Text>
      </View>
      <View style={styles.arrowContainer}>
        <Icon name="chevron-right" size={24} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Content Management</Text>
          <Text style={styles.headerSubtitle}>Manage all application content</Text>
        </View>
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={fetchAllContentCounts}
        >
          <Icon name="refresh" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{contentCategories.length}</Text>
            <Text style={styles.statLabel}>Content Categories</Text>
          </View>
          <View style={styles.statCard}>
            {loading ? (
              <ActivityIndicator size="large" color="#3B82F6" />
            ) : (
              <>
                <Text style={styles.statValue}>{getTotalContentItems()}</Text>
                <Text style={styles.statLabel}>Total Content Items</Text>
              </>
            )}
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Content Categories</Text>
        
        <View style={styles.cardsContainer}>
          {contentCategories.map(renderContentCard)}
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading content data...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F0',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2B4B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2B4B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2B4B',
    marginBottom: 16,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B4B',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
  },
});