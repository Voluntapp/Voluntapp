import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Platform, ScrollView } from 'react-native';
import { api } from '../../src/lib/api';

const { width } = Dimensions.get('window');

type VolunteerHistory = {
  id: string;
  opportunityTitle: string;
  organizationName: string;
  date: string;
  hours: number;
  status: 'completed' | 'signed' | 'pending';
  signature?: string;
};

type Stats = {
  totalHours: number;
  totalOpportunities: number;
  completedOpportunities: number;
  pendingOpportunities: number;
};

export default function Stats() {
  const [history, setHistory] = useState<VolunteerHistory[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalHours: 0,
    totalOpportunities: 0,
    completedOpportunities: 0,
    pendingOpportunities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api('/api/applications/user');
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      
      // Process data to calculate stats
      const historyData = Array.isArray(data) ? data : [];
      setHistory(historyData);
      
      const totalHours = historyData.reduce((sum: number, item: any) => sum + (item.hours || 0), 0);
      const completed = historyData.filter((item: any) => item.status === 'completed' || item.status === 'signed').length;
      const pending = historyData.filter((item: any) => item.status === 'pending').length;
      
      setStats({
        totalHours,
        totalOpportunities: historyData.length,
        completedOpportunities: completed,
        pendingOpportunities: pending,
      });
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading your volunteer history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Impact</Text>
          <Text style={styles.headerSubtitle}>Track your volunteer journey</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, Platform.OS === 'ios' && styles.statCardIOS]}>
            <Text style={styles.statNumber}>{stats.totalHours}</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          
          <View style={[styles.statCard, Platform.OS === 'ios' && styles.statCardIOS]}>
            <Text style={styles.statNumber}>{stats.completedOpportunities}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={[styles.statCard, Platform.OS === 'ios' && styles.statCardIOS]}>
            <Text style={styles.statNumber}>{stats.totalOpportunities}</Text>
            <Text style={styles.statLabel}>Total Opportunities</Text>
          </View>
          
          <View style={[styles.statCard, Platform.OS === 'ios' && styles.statCardIOS]}>
            <Text style={styles.statNumber}>{stats.pendingOpportunities}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* History List */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Volunteer History</Text>
          <Text style={styles.sectionSubtitle}>
            Perfect for college applications and hour tracking
          </Text>
          
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No volunteer history yet</Text>
              <Text style={styles.emptySubtext}>
                Start volunteering to build your impact record
              </Text>
            </View>
          ) : (
            <FlatList
              data={history}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.historyCard, Platform.OS === 'ios' && styles.historyCardIOS]}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyTitle}>{item.opportunityTitle}</Text>
                    <View style={[
                      styles.statusBadge,
                      item.status === 'completed' && styles.statusCompleted,
                      item.status === 'signed' && styles.statusSigned,
                      item.status === 'pending' && styles.statusPending,
                    ]}>
                      <Text style={styles.statusText}>
                        {item.status === 'signed' ? '✓ Signed' : 
                         item.status === 'completed' ? '✓ Done' : 
                         'Pending'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.historyOrg}>{item.organizationName}</Text>
                  
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyDate}>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.historyHours}>
                      {item.hours} {item.hours === 1 ? 'hour' : 'hours'}
                    </Text>
                  </View>
                  
                  {item.signature && (
                    <Text style={styles.signatureText}>
                      Electronically signed by {item.signature}
                    </Text>
                  )}
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  // Header
  header: {
    padding: 24,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  statCardIOS: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.75)' : '#FFFFFF',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FF6B00',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  // History Section
  historySection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 12,
  },
  historyCardIOS: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.75)' : '#FFFFFF',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusSigned: {
    backgroundColor: '#10B981',
  },
  statusCompleted: {
    backgroundColor: '#3B82F6',
  },
  statusPending: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historyOrg: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '600',
    marginBottom: 12,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  historyHours: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  signatureText: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    fontSize: 12,
    color: '#10B981',
    fontStyle: 'italic',
  },
  // Empty State
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
