import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { api } from '../../src/lib/api';

type Opportunity = {
  id: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
};

function hasCoords(o: Opportunity): o is Opportunity & { latitude: number; longitude: number } {
  return typeof o.latitude === 'number' && typeof o.longitude === 'number';
}

export default function Discovery() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
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
  }, []);

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

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ height: 220 }}>
        <MapView style={{ flex: 1 }} initialRegion={{
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}>
          {itemsWithCoords.map((o) => (
            <Marker key={o.id} coordinate={{ latitude: o.latitude, longitude: o.longitude }} title={o.title} />
          ))}
        </MapView>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item: Opportunity) => item.id}
        renderItem={({ item }: { item: Opportunity }) => (
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text numberOfLines={2} style={styles.cardDescription}>{item.description}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No opportunities found</Text>
            <Text style={styles.emptySubtext}>Check back later for new volunteer opportunities</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
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
});
