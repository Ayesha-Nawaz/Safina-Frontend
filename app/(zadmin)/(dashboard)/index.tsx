import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit';
import { BASE_URL } from '@/Ipconfig/ipconfig';

const { width } = Dimensions.get('window');

export default function AdminHomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [monthlyUsers, setMonthlyUsers] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('12'); // 12 months by default

  useEffect(() => {
    fetchMonthlyStats();
  }, []);

  const fetchMonthlyStats = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching from:', `${BASE_URL}/user/users-monthly`);
      
      const response = await fetch(`${BASE_URL}/user/users-monthly`);

      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        const responseText = await response.text();
        console.error('Response body:', responseText.substring(0, 200));
        throw new Error(`API failed: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Response preview:', responseText.substring(0, 100));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.error('Raw response:', responseText);
        throw new Error('API returned invalid JSON');
      }

      if (data.success) {
        setMonthlyUsers(data.data || []);
      } else {
        console.error('API returned success: false', data);
        throw new Error(data.message || 'API returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      
      let errorMessage = 'Failed to load user statistics. ';
      if (error.message.includes('JSON')) {
        errorMessage += 'Server returned invalid data format.';
      } else if (error.message.includes('Network')) {
        errorMessage += 'Network connection error.';
      } else if (error.message.includes('404')) {
        errorMessage += 'API endpoint not found.';
      } else {
        errorMessage += 'Please check your server connection.';
      }
      
      Alert.alert('Error', errorMessage);
      
      // Set default data for demo purposes
      setMonthlyUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    navigation.navigate('(authentication)');
  };

  // Get data for selected period
  const getDataForPeriod = () => {
    const period = parseInt(selectedPeriod);
    return monthlyUsers.slice(-period);
  };

  // Professional chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: '#ffffff',
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.7,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fontWeight: '600',
      color: '#666',
    },
    propsForVerticalLabels: {
      fontSize: 11,
      color: '#888',
    },
    propsForHorizontalLabels: {
      fontSize: 11,
      color: '#888',
    },
    fillShadowGradient: '#1E88E5',
    fillShadowGradientFrom: '#1E88E5',
    fillShadowGradientFromOpacity: 0.2,
    fillShadowGradientTo: '#1E88E5',
    fillShadowGradientToOpacity: 0.05,
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: '#f0f0f0',
      strokeWidth: 1,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#1E88E5',
      fill: '#ffffff',
    },
  };

  const chartData = getDataForPeriod();
  
  // Prepare chart data with safety checks
  const formattedChartData = {
    labels: chartData.length > 0 
      ? chartData.map(item => {
          // Format month names (e.g., "Jan 2024" -> "Jan")
          const month = item.month || 'N/A';
          return month.split(' ')[0] || month.substring(0, 3);
        })
      : Array.from({length: parseInt(selectedPeriod)}, (_, i) => 
          new Date(2024, i).toLocaleDateString('en', {month: 'short'})
        ),
    datasets: [
      {
        data: chartData.length > 0 
          ? chartData.map(item => item.users || 0)
          : Array(parseInt(selectedPeriod)).fill(0),
        color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // Calculate statistics for the selected period
  const totalNewUsers = chartData.reduce((sum, item) => sum + (item.users || 0), 0);
  const averagePerMonth = chartData.length > 0 ? Math.round(totalNewUsers / chartData.length) : 0;
  const maxMonth = chartData.reduce((max, item) => (item.users || 0) > (max.users || 0) ? item : max, {users: 0});
  const growthRate = chartData.length >= 2 
    ? ((chartData[chartData.length - 1]?.users || 0) - (chartData[0]?.users || 0)) / Math.max(chartData[0]?.users || 1, 1) * 100 
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Admin Dashboard</Text>
              <Text style={styles.welcomeText}>User Analytics & Management</Text>
            </View>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Icon name="logout" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E88E5" />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            
            
            {/* Chart Section */}
            <View style={styles.chartSection}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>User Registration Trends</Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={fetchMonthlyStats}
                  activeOpacity={0.7}
                >
                  <Icon name="refresh" size={18} color="#1E88E5" />
                </TouchableOpacity>
              </View>

              {/* Period Selector */}
              <View style={styles.periodSelector}>
                {['6', '12'].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      selectedPeriod === period && styles.periodButtonActive
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive
                    ]}>
                      {period === '6' ? '6M' : '1Y'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Chart */}
              <View style={styles.chartContainer}>
                {chartData.length > 0 ? (
                  <View style={styles.chartWrapper}>
                    <LineChart
                      data={formattedChartData}
                      width={width - 64}
                      height={240}
                      chartConfig={chartConfig}
                      bezier
                      style={styles.chart}
                      withHorizontalLabels={true}
                      withVerticalLabels={true}
                      withInnerLines={true}
                      withOuterLines={false}
                      withShadow={false}
                      withDots={true}
                      withScrollableDot={false}
                      transparent={true}
                      paddingLeft="20"
                      paddingRight="20"
                    />
                  </View>
                ) : (
                  <View style={styles.noDataContainer}>
                    <Icon name="insert-chart" size={48} color="#e0e0e0" />
                    <Text style={styles.noDataText}>No Data Available</Text>
                    <Text style={styles.noDataSubtext}>
                      Analytics will appear here once data is available
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Management Section */}
            <View style={styles.managementSection}>
              <Text style={styles.sectionTitle}>Management</Text>
              
              <View style={styles.cardGrid}>
                <TouchableOpacity 
                  style={styles.managementCard} 
                  onPress={() => navigateTo('(manageuser)')}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardIconContainer}>
                    <Icon name="people" size={28} color="#1E88E5" />
                  </View>
                  <Text style={styles.cardTitle}>Manage Users</Text>
                  <Text style={styles.cardDescription}>View and manage all user accounts</Text>
                  <View style={styles.cardArrow}>
                    <Icon name="arrow-forward" size={18} color="#1E88E5" />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.managementCard} 
                  onPress={() => navigateTo('(manageContent)')}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardIconContainer}>
                    <Icon name="article" size={28} color="#1E88E5" />
                  </View>
                  <Text style={styles.cardTitle}>Manage Content</Text>
                  <Text style={styles.cardDescription}>Review and moderate content</Text>
                  <View style={styles.cardArrow}>
                    <Icon name="arrow-forward" size={18} color="#1E88E5" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  chartSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#1E88E5',
    elevation: 2,
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 12,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 16,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  managementSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    paddingLeft: 4,
  },
  cardGrid: {
    gap: 16,
  },
  managementCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    position: 'relative',
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 136, 229, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});