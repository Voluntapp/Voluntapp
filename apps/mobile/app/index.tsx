import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { api, setAuthToken } from '@/lib/api';

export default function Landing() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAutoLogin();
  }, []);

  const checkAutoLogin = async () => {
    try {
      const rememberMe = await SecureStore.getItemAsync('remember_me');
      const savedIdentifier = await SecureStore.getItemAsync('saved_identifier');
      const savedPassword = await SecureStore.getItemAsync('saved_password');
      const useBiometrics = await SecureStore.getItemAsync('use_biometrics');
      const savedToken = await SecureStore.getItemAsync('auth_token');

      // If remember me is enabled and we have credentials
      if (rememberMe === 'true' && savedIdentifier && savedPassword) {
        // Check if biometrics is required
        if (useBiometrics === 'true') {
          const compatible = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          
          if (compatible && enrolled) {
            const result = await LocalAuthentication.authenticateAsync({
              promptMessage: 'Authenticate to continue',
              fallbackLabel: 'Use password',
              disableDeviceFallback: false,
            });
            
            if (!result.success) {
              setIsChecking(false);
              return;
            }
          }
        }

        // Try to login automatically
        const res = await api('/api/auth/login', {
          method: 'POST',
          body: { identifier: savedIdentifier, password: savedPassword },
        });

        if (res.ok) {
          const data = await res.json();
          await setAuthToken(data.token || null);
          router.replace('/(tabs)/discovery');
          return;
        }
      } else if (savedToken) {
        // Check if existing token is still valid
        await setAuthToken(savedToken);
        const testRes = await api('/api/auth/user');
        if (testRes.ok) {
          router.replace('/(tabs)/discovery');
          return;
        }
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>V</Text>
          </View>
          <Text style={styles.title}>Voluntapp</Text>
          <Text style={styles.subtitle}>
            Discover meaningful volunteer opportunities near you
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable 
            style={styles.primaryButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>
          <Text style={styles.footerText}>
            Log in or sign up to discover volunteer opportunities
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    maxWidth: 500,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FF6B00',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    paddingBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
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
  footerText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 16,
    paddingHorizontal: 24,
  },
});
