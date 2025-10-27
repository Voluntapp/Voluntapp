import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet, Dimensions, Platform, Modal, ScrollView } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { api } from '../../src/lib/api';

const { width, height } = Dimensions.get('window');

type Opportunity = {
  id: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  organizationName?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  tags?: string[];
  applied?: boolean;
};

function hasCoords(o: Opportunity): o is Opportunity & { latitude: number; longitude: number } {
  return typeof o.latitude === 'number' && typeof o.longitude === 'number';
}

export default function Discovery() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapExpanded, setMapExpanded] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  });

  useEffect(() => {
    requestLocationPermission();
    fetchOpportunities();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        });
      }
    } catch (error) {
      console.log('Location permission error:', error);
    }
  };

  const fetchOpportunities = () => {
    setLoading(true);
    setError('');
    
    api('/api/opportunities')
      .then((r: Response) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: any) => {
        // Ensure data is an array
        const opportunities = Array.isArray(data) ? data : [];
        setItems(opportunities);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch opportunities:', err);
        setError(err.message || 'Failed to load opportunities');
        setItems([]);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Loading opportunities...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Text style={styles.errorSubtext}>Check your connection and try again</Text>
      </View>
    );
  }

  const itemsWithCoords = Array.isArray(items) ? items.filter(hasCoords) : [];

  const openOpportunityDetail = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDetailModal(true);
  };

  const handleApply = async () => {
    if (!selectedOpportunity) return;
    try {
      await api('/api/applications', {
        method: 'POST',
        body: { opportunityId: selectedOpportunity.id },
      });
      // Update local state
      setItems(items.map(item => 
        item.id === selectedOpportunity.id ? { ...item, applied: true } : item
      ));
      setSelectedOpportunity({ ...selectedOpportunity, applied: true });
    } catch (error) {
      console.error('Failed to apply:', error);
    }
  };

  const handleCancelApplication = async () => {
    if (!selectedOpportunity) return;
    try {
      // You'll need to implement this endpoint
      await api(`/api/applications/${selectedOpportunity.id}`, { method: 'DELETE' });
      setItems(items.map(item => 
        item.id === selectedOpportunity.id ? { ...item, applied: false } : item
      ));
      setSelectedOpportunity({ ...selectedOpportunity, applied: false });
    } catch (error) {
      console.error('Failed to cancel:', error);
    }
  };

  if (mapExpanded) {
    return (
      <View style={styles.container}>
        <MapView 
          style={styles.fullMap}
          region={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {itemsWithCoords.map((o) => (
            <Marker 
              key={o.id} 
              coordinate={{ latitude: o.latitude, longitude: o.longitude }}
              onPress={() => openOpportunityDetail(o)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerDot} />
              </View>
            </Marker>
          ))}
        </MapView>
        <Pressable 
          style={styles.closeMapButton}
          onPress={() => setMapExpanded(false)}
        >
          <Text style={styles.closeMapText}>✕ Close Map</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Minimized Map */}
      <Pressable 
        style={styles.mapContainer}
        onPress={() => setMapExpanded(true)}
      >
        <MapView 
          style={styles.miniMap}
          region={mapRegion}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          showsUserLocation={false}
        >
          {itemsWithCoords.map((o) => (
            <Marker 
              key={o.id} 
              coordinate={{ latitude: o.latitude, longitude: o.longitude }}
            />
          ))}
        </MapView>
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayText}>Tap to expand map</Text>
        </View>
      </Pressable>

      {/* Opportunities List */}
      <Text style={styles.sectionTitle}>Recommended for You</Text>
      <FlatList
        data={items}
        keyExtractor={(item: Opportunity) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: Opportunity }) => (
          <Pressable 
            style={[styles.card, Platform.OS === 'ios' && styles.cardIOS]}
            onPress={() => openOpportunityDetail(item)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.organizationName && (
              <Text style={styles.cardOrg}>{item.organizationName}</Text>
            )}
            <Text numberOfLines={2} style={styles.cardDescription}>
              {item.description}
            </Text>
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagContainer}>
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            {item.applied && (
              <View style={styles.appliedBadge}>
                <Text style={styles.appliedText}>✓ Applied</Text>
              </View>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No opportunities found</Text>
            <Text style={styles.emptySubtext}>Check back later for new volunteer opportunities</Text>
          </View>
        }
      />

      {/* Opportunity Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedOpportunity?.title}</Text>
              <Pressable 
                onPress={() => setShowDetailModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {selectedOpportunity && (
              <View style={styles.detailContent}>
                {selectedOpportunity.organizationName && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Provided by</Text>
                    <Text style={styles.detailValue}>{selectedOpportunity.organizationName}</Text>
                  </View>
                )}

                {selectedOpportunity.description && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>{selectedOpportunity.description}</Text>
                  </View>
                )}

                {selectedOpportunity.location && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{selectedOpportunity.location}</Text>
                  </View>
                )}

                {(selectedOpportunity.startTime || selectedOpportunity.endTime) && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>
                      {selectedOpportunity.startTime && new Date(selectedOpportunity.startTime).toLocaleDateString()}
                      {selectedOpportunity.endTime && ` - ${new Date(selectedOpportunity.endTime).toLocaleDateString()}`}
                    </Text>
                  </View>
                )}

                {selectedOpportunity.tags && selectedOpportunity.tags.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Tags</Text>
                    <View style={styles.tagContainer}>
                      {selectedOpportunity.tags.map((tag, idx) => (
                        <View key={idx} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.buttonGroup}>
                  {selectedOpportunity.applied ? (
                    <Pressable 
                      style={styles.cancelButton}
                      onPress={handleCancelApplication}
                    >
                      <Text style={styles.cancelButtonText}>Cancel Application</Text>
                    </Pressable>
                  ) : (
                    <Pressable 
                      style={styles.applyButton}
                      onPress={handleApply}
                    >
                      <Text style={styles.applyButtonText}>Apply to Volunteer</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // Map styles
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E5E5',
  },
  miniMap: {
    flex: 1,
  },
  fullMap: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  mapOverlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B00',
  },
  closeMapButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  closeMapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B00',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  // List styles
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cardIOS: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.75)' : '#FFFFFF',
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardOrg: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#FF6B00',
    fontWeight: '600',
  },
  appliedBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  appliedText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
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
  // Modal styles
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
    marginRight: 16,
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
  detailContent: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  buttonGroup: {
    marginTop: 32,
    gap: 12,
  },
  applyButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 0.3,
  },
});
