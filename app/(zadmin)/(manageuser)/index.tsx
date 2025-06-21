import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, Alert, SafeAreaView, RefreshControl,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Loader from '@/components/Loader';
import { BASE_URL } from '@/Ipconfig/ipconfig';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeUsers: 0,
    adminUsers: 0
  });
  
  const navigation = useNavigation();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users for the table
      const usersResponse = await axios.get(`${BASE_URL}/user/allusers`);
      const filteredUsers = usersResponse.data.users.filter((user) => user.role === 'user');
      setUsers(filteredUsers);
      
      // Fetch real stats from the overview endpoint
      const statsResponse = await axios.get(`${BASE_URL}/user/overview`);
      const { totalUsers, activeUsers, adminUsers, thisMonthUsers } = statsResponse.data.data;
      
      // Set the dashboard stats with real backend data
      setDashboardStats({
        totalUsers: totalUsers,
        newUsersThisMonth: thisMonthUsers,
        activeUsers: activeUsers,
        adminUsers: adminUsers
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function for pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleViewUser = (user) => {
    navigation.navigate('UserDetails', { user });
  };

  const renderUserRow = ({ item, index }) => (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
      <Text style={[styles.tableText, styles.emailText]} numberOfLines={1}>
        {item.email}
      </Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.viewButton} 
          onPress={() => handleViewUser(item)}
        >
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatCard = (title, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Dashboard</Text>
      </View>

      {loading ? (
        <Loader text="Loading dashboard..." />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Overview Cards */}
          <View style={styles.statsContainer}>
            {renderStatCard(
              'Total Users', 
              dashboardStats.totalUsers-3, 
              'account-group', 
              '#3B82F6'
            )}
            {renderStatCard(
              'New This Month', 
              dashboardStats.newUsersThisMonth, 
              'account-plus',
              '#10B981'
            )}
            {renderStatCard(
              'Active Users', 
              dashboardStats.activeUsers, 
              'account-check',
              '#F59E0B'
            )}
          </View>

          {/* Additional Stats Row */}
          <View style={styles.statsContainer}>
            
            {renderStatCard(
              'Growth Rate', 
              `${dashboardStats.newUsersThisMonth > 0 ? '+' : ''}${dashboardStats.newUsersThisMonth}`, 
              'trending-up',
              '#8B5CF6'
            )}
            {renderStatCard(
              'User Activity', 
              `${Math.round((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100) || 0}%`, 
              'chart-line',
              '#06B6D4'
            )}
          </View>

          {/* User List */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableSectionTitle}>Recent Users</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('AllUsers')}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderText, styles.emailHeader]}>
                User Email
              </Text>
              <Text style={[styles.tableHeaderText, styles.actionsHeader]}>
                Actions
              </Text>
            </View>

            <FlatList
              data={users.slice(0, 5)} // Show only the first 5 users
              renderItem={renderUserRow}
              keyExtractor={(item) => item._id}
              scrollEnabled={false} // Disable scrolling as we're in a ScrollView
            />
          </View>
        </ScrollView>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A2B4B',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statContent: {
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2B4B',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F0',
  },
  tableSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B4B',
  },
  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F0',
  },
  tableHeaderText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#475569',
  },
  emailHeader: { 
    flex: 3,
    textAlign: 'left',
  },
  actionsHeader: { 
    flex: 2,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F0',
  },
  evenRow: {
    backgroundColor: '#FFFFFF',
  },
  oddRow: {
    backgroundColor: '#F8FAFC',
  },
  tableText: {
    fontSize: 14,
    color: '#334155',
  },
  emailText: { 
    flex: 3,
    textAlign: 'left',
  },
  actionButtons: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});