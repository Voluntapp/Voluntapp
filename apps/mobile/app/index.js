import { Link } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
export default function Landing() {
    return (<View style={{ flex: 1, padding: 24, gap: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 32, fontWeight: '700', color: '#FF6B00' }}>Voluntapp</Text>
      <Text style={{ fontSize: 18, color: '#333' }}>
        Discover meaningful volunteer opportunities near you.
      </Text>
      <Link href="/(tabs)/discovery" asChild>
        <Pressable style={{ backgroundColor: '#FF6B00', padding: 14, borderRadius: 12 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Discover</Text>
        </Pressable>
      </Link>
      <Link href="/auth" asChild>
        <Pressable style={{ borderColor: '#FF6B00', borderWidth: 2, padding: 14, borderRadius: 12 }}>
          <Text style={{ color: '#FF6B00', textAlign: 'center', fontWeight: '600' }}>Log in / Sign up</Text>
        </Pressable>
      </Link>
    </View>);
}
