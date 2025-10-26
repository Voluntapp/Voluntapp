import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
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

  useEffect(() => {
    api('/api/opportunities')
      .then((r: Response) => r.json())
      .then((data: Opportunity[]) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 220 }}>
        <MapView style={{ flex: 1 }} initialRegion={{
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}>
          {items.filter(hasCoords).map((o) => (
            <Marker key={o.id} coordinate={{ latitude: o.latitude, longitude: o.longitude }} title={o.title} />
          ))}
        </MapView>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item: Opportunity) => item.id}
        renderItem={({ item }: { item: Opportunity }) => (
          <Pressable style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: '700' }}>{item.title}</Text>
            <Text numberOfLines={2} style={{ color: '#555' }}>{item.description}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
