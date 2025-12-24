import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { storageService } from '../services/storageService';
import { syncService } from '../services/syncService';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar';
import { Theme } from '../styles/Theme';
import * as ImagePicker from 'expo-image-picker';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, login } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setIsLoading(true);
    try {
      // If avatar is a local URI (starts with file://), "upload" it
      let finalAvatar = avatar;
      if (avatar && avatar.startsWith('file://')) {
        finalAvatar = await storageService.uploadImage(avatar);
      }

      const updatedUser = {
        ...user!,
        name,
        bio,
        avatar: finalAvatar,
      };

      // Queue the action for sync (simulating offline-first)
      await syncService.queueAction('UPDATE_PROFILE', updatedUser);

      // Optimistically update store
      login(updatedUser);

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Theme.colors.primary} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Avatar style={styles.avatar}>
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>
                <Text style={styles.avatarFallbackText}>
                  {name ? name.substring(0, 2).toUpperCase() : "HA"}
                </Text>
              </AvatarFallback>
            </Avatar>
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Camera size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
            placeholderTextColor={Theme.colors.mutedForeground}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor={Theme.colors.mutedForeground}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.foreground,
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  content: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarFallbackText: {
    color: Theme.colors.foreground,
    fontSize: 24,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Theme.colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Theme.colors.background,
  },
  inputContainer: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.mutedForeground,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Theme.colors.muted,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Theme.colors.foreground,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
