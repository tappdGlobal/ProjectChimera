import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { storageService } from '../services/storageService';
import { syncService } from '../services/syncService';
import { ArrowLeft, Camera, Plus, X } from 'lucide-react-native';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar';
import { Select, SelectItem, SelectValue } from '../components/ui/Select';
import { Picker } from '@react-native-picker/picker';
import { Theme } from '../styles/Theme';
import * as ImagePicker from 'expo-image-picker';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [education, setEducation] = useState(user?.education || '');
  const [lookingFor, setLookingFor] = useState(user?.lookingFor || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [location, setLocation] = useState(user?.location || '');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [smoking, setSmoking] = useState(user?.smoking || '');
  const [drinking, setDrinking] = useState(user?.drinking || '');
  const [newInterest, setNewInterest] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setOccupation(user.occupation || '');
      setEducation(user.education || '');
      setLookingFor(user.lookingFor || '');
      setAge(user.age?.toString() || '');
      setHeight(user.height?.toString() || '');
      setGender(user.gender || '');
      setLocation(user.location || '');
      setInterests(user.interests || []);
      setSmoking(user.smoking || '');
      setDrinking(user.drinking || '');
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
        occupation,
        education,
        lookingFor,
        age: age ? parseInt(age) : undefined,
        height: height ? parseFloat(height) : undefined,
        gender,
        location,
        interests,
        smoking,
        drinking,
      };

      // Queue the action for sync (simulating offline-first)
      await syncService.queueAction('UPDATE_PROFILE', updatedUser);

      // Try to sync immediately
      try {
        await syncService.syncActions();
      } catch (error) {
        console.log('Sync failed, will retry later:', error);
      }

      // Optimistically update store
      updateUser(updatedUser);

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
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

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
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

          <Text style={styles.label}>Occupation</Text>
          <TextInput
            style={styles.input}
            value={occupation}
            onChangeText={setOccupation}
            placeholder="Your occupation"
            placeholderTextColor={Theme.colors.mutedForeground}
          />

          <Text style={styles.label}>Education</Text>
          <TextInput
            style={styles.input}
            value={education}
            onChangeText={setEducation}
            placeholder="Your education"
            placeholderTextColor={Theme.colors.mutedForeground}
          />

          <Text style={styles.label}>Looking For</Text>
          <Select value={lookingFor} onValueChange={setLookingFor} style={styles.selectTrigger}>
            <Picker.Item label="Select what you're looking for" value="" />
            <Picker.Item label="Friendship" value="FRIENDSHIP" />
            <Picker.Item label="Relationship" value="RELATIONSHIP" />
            <Picker.Item label="Networking" value="NETWORKING" />
          </Select>

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Your age"
            placeholderTextColor={Theme.colors.mutedForeground}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Your height in cm"
            placeholderTextColor={Theme.colors.mutedForeground}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Gender</Text>
          <Select value={gender} onValueChange={setGender} style={styles.selectTrigger}>
            <Picker.Item label="Select your gender" value="" />
            <Picker.Item label="Male" value="MALE" />
            <Picker.Item label="Female" value="FEMALE" />
            <Picker.Item label="Other" value="OTHER" />
          </Select>

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Your location"
            placeholderTextColor={Theme.colors.mutedForeground}
          />

          <Text style={styles.label}>Interests</Text>
          <View style={styles.interestsContainer}>
            {interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
                <TouchableOpacity onPress={() => removeInterest(interest)}>
                  <X size={16} color={Theme.colors.foreground} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addInterestContainer}>
              <TextInput
                style={styles.addInterestInput}
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="Add interest"
                placeholderTextColor={Theme.colors.mutedForeground}
                onSubmitEditing={addInterest}
              />
              <TouchableOpacity onPress={addInterest} style={styles.addInterestButton}>
                <Plus size={20} color={Theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>Smoking</Text>
          <Select value={smoking} onValueChange={setSmoking} style={styles.selectTrigger}>
            <Picker.Item label="Do you smoke?" value="" />
            <Picker.Item label="Yes" value="YES" />
            <Picker.Item label="No" value="NO" />
            <Picker.Item label="Occasionally" value="OCCASIONALLY" />
          </Select>

          <Text style={styles.label}>Drinking</Text>
          <Select value={drinking} onValueChange={setDrinking} style={styles.selectTrigger}>
            <Picker.Item label="Do you drink?" value="" />
            <Picker.Item label="Yes" value="YES" />
            <Picker.Item label="No" value="NO" />
            <Picker.Item label="Socially" value="SOCIALLY" />
          </Select>
        </View>
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
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
    paddingBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.mutedForeground,
    marginBottom: 4,
    marginTop: 16,
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
  selectTrigger: {
    backgroundColor: Theme.colors.muted,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  interestText: {
    color: Theme.colors.primaryForeground,
    fontSize: 14,
  },
  addInterestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.muted,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginTop: 8,
    flex: 1,
  },
  addInterestInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.foreground,
    padding: 4,
  },
  addInterestButton: {
    padding: 4,
  },
});
