import { Link } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

function VoluntappLogo({ size = 80 }: { size?: number }) {
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

export default function Landing() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <VoluntappLogo size={100} />
          <Text style={styles.title}>Voluntapp</Text>
          <Text style={styles.subtitle}>
            Discover meaningful volunteer opportunities near you
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Link href="/auth" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </Pressable>
          </Link>
          <Text style={styles.footerText}>
            Log in or sign up to discover volunteer opportunities
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: Math.max(24, width * 0.08),
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
  title: {
    fontSize: Math.min(48, width * 0.12),
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: Math.min(18, width * 0.045),
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
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF6B00',
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  secondaryButtonText: {
    color: '#FF6B00',
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
