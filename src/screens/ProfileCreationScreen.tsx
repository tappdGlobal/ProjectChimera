import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useAuthStore } from '../store/authStore';

export const ProfileCreationScreen = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = () => {
    if (!name) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login({
        id: '1', // Mock ID
        name: name,
        phone: '1234567890', // Mock phone from previous screen (in real app would be passed via params)
        bio: bio,
        avatar: 'https://via.placeholder.com/150', // Default avatar
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Profile</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

        <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>+</Text>
            </View>
            <Text style={styles.avatarLabel}>Upload Photo</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Bio"
            placeholderTextColor="#666"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity 
            style={[styles.button, !name && styles.buttonDisabled]} 
            onPress={handleSaveProfile} 
            disabled={isLoading || !name}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Creating...' : 'Complete Setup'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 40,
    color: '#007AFF',
  },
  avatarLabel: {
    color: '#007AFF',
    fontSize: 16,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#333',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
