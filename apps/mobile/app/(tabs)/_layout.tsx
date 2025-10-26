import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#FF6B00',
      tabBarStyle: {
        backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.75)' : '#fff',
      },
    }}>
      <Tabs.Screen name="discovery" options={{ title: 'Discover' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="manage" options={{ title: 'Manage' }} />
    </Tabs>
  );
}
