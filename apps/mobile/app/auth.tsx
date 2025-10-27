import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { setAuthToken } from '@/lib/api';

const { width } = Dimensions.get('window');

function VoluntappLogo({ size = 60 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill="#FF6B00" opacity="0.1" />
      <Path
        d="M 30 25 L 50 75 L 70 25"
        stroke="#FF6B00"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export default function Auth() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const login = async () => {
    try {
      const res = await api('/api/auth/login', { method: 'POST', body: { identifier, password } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      await setAuthToken(data.token || null);
      router.replace('/(tabs)/discovery');
    } catch (e: any) {
      Alert.alert('Login failed', e.message);
    }
  };

  const signup = async () => {
    try {
      const res = await api('/api/auth/signup', { method: 'POST', body: { email: identifier.includes('@') ? identifier : undefined, phone: !identifier.includes('@') ? identifier : undefined, password, name, role: 'volunteer' } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      await setAuthToken(data.token || null);
      router.replace('/(tabs)/discovery');
    } catch (e: any) {
      Alert.alert('Signup failed', e.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <VoluntappLogo size={80} />
          <Text style={styles.title}>Voluntapp</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Phone</Text>
            <TextInput 
              placeholder="Enter your email or phone" 
              value={identifier} 
              onChangeText={setIdentifier} 
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              placeholder="Enter your password" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                placeholder="Enter your full name" 
                value={name} 
                onChangeText={setName} 
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
          )}

          <Pressable 
            onPress={isLogin ? login : signup} 
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {isLogin ? 'Log in' : 'Sign up'}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable 
            onPress={() => setIsLogin(!isLogin)} 
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {isLogin ? 'Create new account' : 'Already have an account? Log in'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Math.max(24, width * 0.08),
    paddingVertical: 48,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: Math.min(36, width * 0.09),
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: Math.min(16, width * 0.04),
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  primaryButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#FF6B00',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
});
