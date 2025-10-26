import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { api } from '@/lib/api';
export default function Auth() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const login = async () => {
        try {
            const res = await api('/api/auth/login', { method: 'POST', body: { identifier, password } });
            if (!res.ok)
                throw new Error(await res.text());
            Alert.alert('Logged in');
        }
        catch (e) {
            Alert.alert('Login failed', e.message);
        }
    };
    const signup = async () => {
        try {
            const res = await api('/api/auth/signup', { method: 'POST', body: { email: identifier.includes('@') ? identifier : undefined, phone: !identifier.includes('@') ? identifier : undefined, password, name, role: 'volunteer' } });
            if (!res.ok)
                throw new Error(await res.text());
            Alert.alert('Signed up');
        }
        catch (e) {
            Alert.alert('Signup failed', e.message);
        }
    };
    return (<View style={{ flex: 1, padding: 16, gap: 12, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Log in / Sign up</Text>
      <TextInput placeholder="Email or phone" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 }}/>
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 }}/>
      <TextInput placeholder="Full name (for signup)" value={name} onChangeText={setName} style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 }}/>
      <Pressable onPress={login} style={{ backgroundColor: '#FF6B00', padding: 14, borderRadius: 12 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Log in</Text>
      </Pressable>
      <Pressable onPress={signup} style={{ borderColor: '#FF6B00', borderWidth: 2, padding: 14, borderRadius: 12 }}>
        <Text style={{ color: '#FF6B00', textAlign: 'center', fontWeight: '600' }}>Sign up</Text>
      </Pressable>
    </View>);
}
