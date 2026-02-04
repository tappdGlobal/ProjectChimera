import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { Theme, GRADIENT_COLORS } from "../styles/Theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../store/userStore";
import { X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalytics } from "../hooks/useAnalytics";

export const EditProfileScreen = ({ navigation }: any) => {
  const { profile, updateUser } = useUserStore();
  useAnalytics("EditProfileScreen", { user_id: profile?.id });

  const [bio, setBio] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [smoking, setSmoking] = useState("No");
  const [drinking, setDrinking] = useState("Socially");
  const [lookingForList, setLookingForList] = useState<string[]>([]);
  const [newLookingFor, setNewLookingFor] = useState("");

  const [openGender, setOpenGender] = useState(false);
  const [openSmoking, setOpenSmoking] = useState(false);
  const [openDrinking, setOpenDrinking] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;

    setBio(profile.bio || "");
    setOccupation(profile.occupation || "");
    setEducation(profile.education || "");
    setAge(profile.age?.toString() || "");
    setHeight(profile.height ? `${profile.height}` : "");
    setGender(profile.gender || "");
    setLocation(profile.location || "");
    setInterests(profile.interests || []);
    setSmoking(profile.smoking || "No");
    setDrinking(profile.drinking || "Socially");
    setLookingForList(
      typeof profile.lookingFor === "string"
        ? profile.lookingFor.split(",").map(s => s.trim()).filter(Boolean)
        : Array.isArray(profile.lookingFor)
          ? profile.lookingFor
          : []
    );

  }, [profile]);

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const updatedUser = {
        bio,
        occupation,
        education,
        lookingFor: lookingForList.join(", "),
        age: age ? parseInt(age) : undefined,
        height: height ? parseInt(height) : undefined,
        gender,
        location,
        interests,
        smoking,
        drinking,
      };


      await updateUser(profile!.id, updatedUser);
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };
  const addLookingFor = () => {
    if (newLookingFor.trim() && !lookingForList.includes(newLookingFor.trim())) {
      setLookingForList([...lookingForList, newLookingFor.trim()]);
      setNewLookingFor("");
    }
  };

  const removeLookingFor = (item: string) => {
    setLookingForList(lookingForList.filter(i => i !== item));
  };

  const renderDropdown = (
    value: string,
    placeholder: string,
    open: boolean,
    setOpen: any,
    options: string[],
    onSelect: (v: string) => void,
  ) => (
    <>
      <TouchableOpacity
        style={styles.dropdownInput}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.dropdownText}>{value || placeholder}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.modalBox}>
            {options.map((opt) => (
              <Pressable
                key={opt}
                style={styles.option}
                onPress={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={22} color={Theme.colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.label}>About Me</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            multiline
          />
        </View>

        {/* Occupation */}
        <View style={styles.section}>
          <Text style={styles.label}>Occupation</Text>
          <TextInput style={styles.input} value={occupation} onChangeText={setOccupation} />
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.label}>Education</Text>
          <TextInput style={styles.input} value={education} onChangeText={setEducation} />
        </View>
        {/* Looking For */}
        <View style={styles.section}>
          <Text style={styles.label}>Looking For</Text>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newLookingFor}
              onChangeText={setNewLookingFor}
              placeholder="Add motive..."
              placeholderTextColor={Theme.colors.mutedForeground}
            />

            <TouchableOpacity onPress={addLookingFor} style={styles.gradientBtn}>
              <LinearGradient
                colors={GRADIENT_COLORS.primary
                }
                style={styles.gradientInner}
              >
                <Text style={styles.gradientText}>Add</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {lookingForList.length > 0 && (
            <View style={styles.tagsWrap}>
              {lookingForList.map(item => (
                <View key={item} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeLookingFor(item)}>
                    <X size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Age & Height */}
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.label}>Age</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Height</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} />
          </View>
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.label}>Gender</Text>
          {renderDropdown(gender, "Select", openGender, setOpenGender, ["Male", "Female", "Other"], setGender)}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} />
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.label}>Interests</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newInterest}
              onChangeText={setNewInterest}
            />
            <TouchableOpacity onPress={addInterest} style={styles.addBtn}>
              <LinearGradient
                colors={GRADIENT_COLORS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addGradient}
              >
                <Text style={styles.addText}>Add</Text>
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </View>

        {/* Smoking */}
        <View style={styles.section}>
          <Text style={styles.label}>Smoking</Text>
          {renderDropdown(smoking, "Select", openSmoking, setOpenSmoking, ["Yes", "No", "Occasionally"], setSmoking)}
        </View>

        {/* Drinking */}
        <View style={styles.section}>
          <Text style={styles.label}>Drinking</Text>
          {renderDropdown(drinking, "Select", openDrinking, setOpenDrinking, ["Yes", "No", "Socially"], setDrinking)}
        </View>

        {/* Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={{ color: Theme.colors.foreground }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <LinearGradient colors={["#C026D3", "#DB2777"]} style={styles.saveGradient}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Save</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },

  headerTitle: { color: Theme.colors.foreground, fontSize: 18, fontWeight: "700" },

  section: { paddingHorizontal: 24, marginBottom: 20 },

  label: { color: Theme.colors.foreground, marginBottom: 6 },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: Theme.colors.foreground,
    backgroundColor: Theme.colors.muted,
  },

  textArea: { height: 100, textAlignVertical: "top", paddingTop: 10 },

  twoColumn: { flexDirection: "row", gap: 16, paddingHorizontal: 24, marginBottom: 20 },
  column: { flex: 1 },

  row: { flexDirection: "row", gap: 10 },


  gradientBtn: {
    borderRadius: 12,
    overflow: "hidden",   // 👈 VERY IMPORTANT
  },

  gradientInner: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,     // 👈 same radius
    alignItems: "center",
    justifyContent: "center",
  },

  gradientText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },


  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },

  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },

  tagText: {
    color: "#fff",
    fontSize: 13,
  },

  dropdownInput: {
    height: 48,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: Theme.colors.muted,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdownText: { color: Theme.colors.foreground },
  arrow: { color: Theme.colors.foreground },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },

  modalBox: { backgroundColor: Theme.colors.background, borderRadius: 12 },

  option: { padding: 14 },
  optionText: { color: Theme.colors.foreground },

  actions: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 24,
    marginTop: 24,
  },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtn: {
    borderRadius: 10,
    overflow: "hidden",
    height: 44,
    minWidth: 70,
  },

  addGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 16,
  },

  addText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },


  saveBtn: { flex: 1, borderRadius: 8, overflow: "hidden" },

  saveGradient: { paddingVertical: 14, alignItems: "center" },
});
