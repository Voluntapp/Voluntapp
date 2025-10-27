import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/lib/api';
import { setAuthToken } from '@/lib/api';

const { width } = Dimensions.get('window');

export default function Auth() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'volunteer' | 'organization'>('volunteer');
  const [rememberMe, setRememberMe] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    checkBiometrics();
    loadSavedCredentials();
  }, []);

  const checkBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (compatible && enrolled) {
        setBiometricsAvailable(true);
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType(Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType(Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint');
        } else {
          setBiometricType('Biometrics');
        }
      }
    } catch (error) {
      console.error('Biometrics check failed:', error);
    }
  };

  const loadSavedCredentials = async () => {
    try {
      const savedIdentifier = await SecureStore.getItemAsync('saved_identifier');
      const savedRememberMe = await SecureStore.getItemAsync('remember_me');
      const savedUseBiometrics = await SecureStore.getItemAsync('use_biometrics');
      
      if (savedRememberMe === 'true' && savedIdentifier) {
        setIdentifier(savedIdentifier);
        setRememberMe(true);
      }
      
      if (savedUseBiometrics === 'true') {
        setUseBiometrics(true);
        // Optionally auto-trigger biometric auth here
      }
    } catch (error) {
      console.error('Failed to load saved credentials:', error);
    }
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate with ${biometricType}`,
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  const login = async () => {
    try {
      // If biometrics enabled, authenticate first
      if (useBiometrics && biometricsAvailable) {
        const authenticated = await authenticateWithBiometrics();
        if (!authenticated) {
          Alert.alert('Authentication Failed', 'Biometric authentication was not successful');
          return;
        }
      }

      const res = await api('/api/auth/login', { method: 'POST', body: { identifier, password } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      await setAuthToken(data.token || null);
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        await SecureStore.setItemAsync('saved_identifier', identifier);
        await SecureStore.setItemAsync('saved_password', password);
        await SecureStore.setItemAsync('remember_me', 'true');
      } else {
        await SecureStore.deleteItemAsync('saved_identifier');
        await SecureStore.deleteItemAsync('saved_password');
        await SecureStore.deleteItemAsync('remember_me');
      }
      
      // Save biometric preference
      await SecureStore.setItemAsync('use_biometrics', useBiometrics ? 'true' : 'false');
      
      router.replace('/(tabs)/discovery');
    } catch (e: any) {
      Alert.alert('Login failed', e.message);
    }
  };

  const signup = async () => {
    try {
      const res = await api('/api/auth/signup', { method: 'POST', body: { email: identifier.includes('@') ? identifier : undefined, phone: !identifier.includes('@') ? identifier : undefined, password, name, role } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      await setAuthToken(data.token || null);
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        await SecureStore.setItemAsync('saved_identifier', identifier);
        await SecureStore.setItemAsync('saved_password', password);
        await SecureStore.setItemAsync('remember_me', 'true');
      }
      
      // Save biometric preference
      await SecureStore.setItemAsync('use_biometrics', useBiometrics ? 'true' : 'false');
      
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
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>V</Text>
          </View>
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
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput 
                  placeholder="Enter your full name" 
                  value={name} 
                  onChangeText={setName} 
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>I am...</Text>
                <View style={styles.roleSelector}>
                  <Pressable 
                    style={[styles.roleButton, role === 'volunteer' && styles.roleButtonActive]}
                    onPress={() => setRole('volunteer')}
                  >
                    <Text style={[styles.roleButtonText, role === 'volunteer' && styles.roleButtonTextActive]}>
                      👋 Volunteer
                    </Text>
                    <Text style={[styles.roleButtonSubtext, role === 'volunteer' && styles.roleButtonSubtextActive]}>
                      Looking for opportunities
                    </Text>
                  </Pressable>
                  
                  <Pressable 
                    style={[styles.roleButton, role === 'organization' && styles.roleButtonActive]}
                    onPress={() => setRole('organization')}
                  >
                    <Text style={[styles.roleButtonText, role === 'organization' && styles.roleButtonTextActive]}>
                      🏢 Organization
                    </Text>
                    <Text style={[styles.roleButtonSubtext, role === 'organization' && styles.roleButtonSubtextActive]}>
                      Offering opportunities
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {/* Remember Me Checkbox */}
          <Pressable 
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Remember me on this device</Text>
          </Pressable>

          {/* Biometrics Checkbox */}
          {biometricsAvailable && (
            <Pressable 
              style={styles.checkboxContainer}
              onPress={() => setUseBiometrics(!useBiometrics)}
            >
              <View style={[styles.checkbox, useBiometrics && styles.checkboxChecked]}>
                {useBiometrics && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Use {biometricType}</Text>
            </Pressable>
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
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FF6B00',
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
  // Checkbox styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  // Role selector styles
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#FFF4ED',
    borderColor: '#FF6B00',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    marginBottom: 4,
  },
  roleButtonTextActive: {
    color: '#FF6B00',
  },
  roleButtonSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  roleButtonSubtextActive: {
    color: '#FF6B00',
  },
});
