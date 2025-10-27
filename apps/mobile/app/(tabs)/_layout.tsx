import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';

// Simple icon component using Unicode symbols
const Icon = ({ symbol, focused }: { symbol: string; focused: boolean }) => (
  <Text style={{ fontSize: 24, color: focused ? '#FF6B00' : '#999' }}>{symbol}</Text>
);

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#FF6B00',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.75)' : '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        paddingTop: 8,
        height: Platform.OS === 'ios' ? 88 : 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
    }}>
      <Tabs.Screen 
        name="discovery" 
        options={{ 
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <Icon symbol="🏠" focused={focused} />,
        }} 
      />
      <Tabs.Screen 
        name="stats" 
        options={{ 
          title: 'Stats',
          tabBarLabel: 'Stats',
          tabBarIcon: ({ focused }) => <Icon symbol="📊" focused={focused} />,
        }} 
      />
      <Tabs.Screen 
        name="manage" 
        options={{ 
          title: 'Manage',
          tabBarLabel: 'Manage',
          tabBarIcon: ({ focused }) => <Icon symbol="📝" focused={focused} />,
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <Icon symbol="⚙️" focused={focused} />,
        }} 
      />
    </Tabs>
  );
}
