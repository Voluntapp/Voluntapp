import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Dimensions, Platform, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { api } from '../../src/lib/api';

const { width } = Dimensions.get('window');

type Opportunity = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  tags?: string[];
  applicants?: number;
};

export default function Manage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pastOpportunities, setPastOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      const res = await api('/api/opportunities/mine');
      if (!res.ok) throw new Error('Failed to load opportunities');
      const data = await res.json();
      
      const now = new Date();
      const upcoming = data.filter((opp: any) => !opp.endTime || new Date(opp.endTime) >= now);
      const past = data.filter((opp: any) => opp.endTime && new Date(opp.endTime) < now);
      
      setOpportunities(upcoming);
      setPastOpportunities(past);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpportunity = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      const res = await api('/api/opportunities', {
        method: 'POST',
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        },
      });

      if (!res.ok) throw new Error('Failed to create opportunity');
      
      // Clear form
      setTitle('');
      setDescription('');
      setLocation('');
      setStartTime('');
      setEndTime('');
      setTags('');
      setShowAddModal(false);
      
      // Reload opportunities
      loadOpportunities();
      Alert.alert('Success', 'Opportunity created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create opportunity');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading your opportunities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Opportunities</Text>
          <Text style={styles.headerSubtitle}>Create and track your volunteer opportunities</Text>
        </View>

        {/* Add Button */}
        <Pressable 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Create Opportunity</Text>
        </Pressable>

        {/* Upcoming Opportunities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Opportunities</Text>
          {opportunities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No upcoming opportunities</Text>
              <Text style={styles.emptySubtext}>Create your first opportunity above</Text>
            </View>
          ) : (
            <FlatList
              data={opportunities}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.card, Platform.OS === 'ios' && styles.cardIOS]}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.location && (
                    <Text style={styles.cardLocation}>📍 {item.location}</Text>
                  )}
                  {item.description && (
                    <Text numberOfLines={2} style={styles.cardDescription}>
                      {item.description}
                    </Text>
                  )}
                  {item.startTime && (
                    <Text style={styles.cardDate}>
                      {new Date(item.startTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  )}
                  {item.applicants !== undefined && (
                    <View style={styles.applicantBadge}>
                      <Text style={styles.applicantText}>
                        {item.applicants} {item.applicants === 1 ? 'applicant' : 'applicants'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            />
          )}
        </View>

        {/* Past Opportunities */}
        {pastOpportunities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Opportunities</Text>
            <FlatList
              data={pastOpportunities}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.card, styles.pastCard, Platform.OS === 'ios' && styles.cardIOS]}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.location && (
                    <Text style={styles.cardLocation}>📍 {item.location}</Text>
                  )}
                  {item.endTime && (
                    <Text style={styles.pastDate}>
                      Completed {new Date(item.endTime).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* Add Opportunity Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Opportunity</Text>
              <Pressable 
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Food Bank Volunteer"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe the volunteer opportunity..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g., 123 Main St, City, State"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Start Date/Time</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="YYYY-MM-DD HH:MM"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>End Date/Time</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="YYYY-MM-DD HH:MM"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tags (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  value={tags}
                  onChangeText={setTags}
                  placeholder="e.g., food, community, weekend"
                  placeholderTextColor="#999"
                />
              </View>

              <Pressable
                style={styles.submitButton}
                onPress={handleCreateOpportunity}
              >
                <Text style={styles.submitButtonText}>Create Opportunity</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  // Add Button
  addButton: {
    backgroundColor: '#FF6B00',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  // Sections
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 12,
  },
  cardIOS: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.75)' : '#FFFFFF',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pastCard: {
    opacity: 0.6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  cardLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  pastDate: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  applicantBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  applicantText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
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
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  // Form
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
