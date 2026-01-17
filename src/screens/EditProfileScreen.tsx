import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { storageService } from '../services/storageService';
import { syncService } from '../services/syncService';
import { X } from 'lucide-react-native';
import { Select } from '../components/ui/Select';
import { Picker } from '@react-native-picker/picker';
import { Theme } from '../styles/Theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuthStore();
  const [bio, setBio] = useState(user?.bio || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [education, setEducation] = useState(user?.education || '');
  const [lookingForTags, setLookingForTags] = useState<string[]>(
    typeof user?.lookingFor === 'string' 
      ? user.lookingFor.split(',').map(s => s.trim()).filter(Boolean)
      : Array.isArray(user?.lookingFor)
      ? user.lookingFor
      : []
  );
  const [newLookingFor, setNewLookingFor] = useState('');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [height, setHeight] = useState(
    user?.height 
      ? (typeof user.height === 'number' && user.height >= 30 && user.height <= 300
          ? `${Math.floor(user.height / 30.48)}'${Math.round((user.height % 30.48) / 2.54)}"`
          : user.height.toString())
      : ''
  );
  const [gender, setGender] = useState(user?.gender || '');
  const [location, setLocation] = useState(user?.location || '');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [smoking, setSmoking] = useState(user?.smoking || 'No');
  const [drinking, setDrinking] = useState(user?.drinking || 'Socially');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setOccupation(user.occupation || '');
      setEducation(user.education || '');
      setLookingForTags(
        typeof user.lookingFor === 'string' 
          ? user.lookingFor.split(',').map(s => s.trim()).filter(Boolean)
          : Array.isArray(user.lookingFor)
          ? user.lookingFor
          : []
      );
      setAge(user.age?.toString() || '');
      setHeight(
        user.height 
          ? (typeof user.height === 'number' && user.height >= 30 && user.height <= 300
              ? `${Math.floor(user.height / 30.48)}'${Math.round((user.height % 30.48) / 2.54)}"`
              : user.height.toString())
          : ''
      );
      setGender(user.gender || '');
      setLocation(user.location || '');
      setInterests(user.interests || []);
      setSmoking(user.smoking || 'No');
      setDrinking(user.drinking || 'Socially');
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let heightInCm: number | undefined = undefined;
      if (height) {
        const feetInchesMatch = height.match(/(\d+)'(\d+)"/);
        if (feetInchesMatch) {
          const feet = parseInt(feetInchesMatch[1]);
          const inches = parseInt(feetInchesMatch[2]);
          heightInCm = Math.round((feet * 30.48) + (inches * 2.54));
        } else {
          heightInCm = parseFloat(height);
        }
      }

      const updatedUser = {
        ...user!,
        bio,
        occupation,
        education,
        lookingFor: lookingForTags.join(', '),
        age: age ? parseInt(age) : undefined,
        height: heightInCm,
        gender,
        location,
        interests,
        smoking,
        drinking,
      };

      await syncService.queueAction('UPDATE_PROFILE', updatedUser);
      try {
        await syncService.syncActions();
      } catch (error) {
        console.log('Sync failed, will retry later:', error);
      }

      updateUser(updatedUser);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const addLookingFor = () => {
    if (newLookingFor.trim() && !lookingForTags.includes(newLookingFor.trim())) {
      setLookingForTags([...lookingForTags, newLookingFor.trim()]);
      setNewLookingFor('');
    }
  };

  const removeLookingFor = (tag: string) => {
    setLookingForTags(lookingForTags.filter(t => t !== tag));
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

  // Reusable props for Picker Items
  const pickerItemProps = {
    color: Theme.colors.foreground, // Ensures text is visible (e.g., white in dark mode)
    style: { backgroundColor: Theme.colors.background } // Attempts to set background
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
        {/* Header - Moved INSIDE ScrollView to ensure full screen scrolls */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <X size={24} color={Theme.colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* About Me */}
        <View style={styles.section}>
          <Text style={styles.label}>About Me</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor={Theme.colors.mutedForeground}
            multiline
            numberOfLines={8}
            scrollEnabled={false} // Let parent ScrollView handle scrolling
          />
        </View>

        {/* Occupation */}
        <View style={styles.section}>
          <Text style={styles.label}>Occupation</Text>
          <TextInput
            style={styles.input}
            value={occupation}
            onChangeText={setOccupation}
            placeholder="Your occupation"
            placeholderTextColor={Theme.colors.mutedForeground}
          />
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.label}>Education</Text>
          <TextInput
            style={styles.input}
            value={education}
            onChangeText={setEducation}
            placeholder="Your education"
            placeholderTextColor={Theme.colors.mutedForeground}
          />
        </View>

        {/* Looking For */}
        <View style={styles.section}>
          <Text style={styles.label}>Looking For</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={newLookingFor}
              onChangeText={setNewLookingFor}
              placeholder="Add motive..."
              placeholderTextColor={Theme.colors.mutedForeground}
              onSubmitEditing={addLookingFor}
            />
            <TouchableOpacity onPress={addLookingFor} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          {lookingForTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {lookingForTags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeLookingFor(tag)} style={styles.tagRemove}>
                    <X size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Age and Height */}
        <View style={styles.twoColumnSection}>
          <View style={styles.columnItem}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              placeholderTextColor={Theme.colors.mutedForeground}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.columnItem}>
            <Text style={styles.label}>Height</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="5'10&quot;"
              placeholderTextColor={Theme.colors.mutedForeground}
            />
          </View>
        </View>

        {/* Gender and Location */}
        <View style={styles.twoColumnSection}>
          <View style={styles.columnItem}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                dropdownIconColor={Theme.colors.foreground}
                style={styles.pickerStyle}
                mode="dialog" // Changed to dialog for better native handling
              >
                <Picker.Item label="Select" value="" {...pickerItemProps} />
                <Picker.Item label="Male" value="Male" {...pickerItemProps} />
                <Picker.Item label="Female" value="Female" {...pickerItemProps} />
                <Picker.Item label="Other" value="Other" {...pickerItemProps} />
              </Picker>
            </View>
          </View>
          <View style={styles.columnItem}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Your location"
              placeholderTextColor={Theme.colors.mutedForeground}
            />
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.label}>Interests</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={newInterest}
              onChangeText={setNewInterest}
              placeholder="Add interest..."
              placeholderTextColor={Theme.colors.mutedForeground}
              onSubmitEditing={addInterest}
            />
            <TouchableOpacity onPress={addInterest} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {interests.map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
                <TouchableOpacity onPress={() => removeInterest(interest)} style={styles.tagRemove}>
                  <X size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Smoking and Drinking */}
        <View style={styles.twoColumnSection}>
          <View style={styles.columnItem}>
            <Text style={styles.label}>Smoking</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={smoking}
                onValueChange={(itemValue) => setSmoking(itemValue)}
                dropdownIconColor={Theme.colors.foreground}
                style={styles.pickerStyle}
                mode="dialog"
              >
                <Picker.Item label="Select" value="" {...pickerItemProps} />
                <Picker.Item label="Yes" value="Yes" {...pickerItemProps} />
                <Picker.Item label="No" value="No" {...pickerItemProps} />
                <Picker.Item label="Occasionally" value="Occasionally" {...pickerItemProps} />
              </Picker>
            </View>
          </View>
          <View style={styles.columnItem}>
            <Text style={styles.label}>Drinking</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={drinking}
                onValueChange={(itemValue) => setDrinking(itemValue)}
                dropdownIconColor={Theme.colors.foreground}
                style={styles.pickerStyle}
                mode="dialog"
              >
                <Picker.Item label="Select" value="" {...pickerItemProps} />
                <Picker.Item label="Yes" value="Yes" {...pickerItemProps} />
                <Picker.Item label="No" value="No" {...pickerItemProps} />
                <Picker.Item label="Socially" value="Socially" {...pickerItemProps} />
              </Picker>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          {isLoading ? (
            <View style={styles.saveButton}>
              <LinearGradient
                colors={["#C026D3", "#DB2777"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <ActivityIndicator size="small" color="#FFFFFF" />
              </LinearGradient>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
            >
              <LinearGradient
                colors={["#C026D3", "#DB2777"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
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
    marginBottom: 16, // Added margin since it's now part of scroll content
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.foreground,
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
    // Removed internal padding that might conflict with header
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 24, // Moved padding here since scrollContent padding was removed/adjusted
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.foreground,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Theme.colors.muted,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Theme.colors.foreground,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    minHeight: 44,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  twoColumnSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    width: '100%',
    paddingHorizontal: 24,
  },
  columnItem: {
    flex: 1,
    minWidth: 0, 
  },
  pickerContainer: {
    backgroundColor: Theme.colors.muted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    overflow: 'hidden',
    minHeight: 44,
    justifyContent: 'center',
  },
  pickerStyle: {
    backgroundColor: Theme.colors.muted,
    color: Theme.colors.foreground,
    height: 44,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Theme.colors.muted,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Theme.colors.foreground,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    minHeight: 44,
  },
  addButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  tagRemove: {
    padding: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});