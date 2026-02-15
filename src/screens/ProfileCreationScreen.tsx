import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Switch,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Heart,
  MapPin,
  ChevronDown,
  Bell,
  Check,
  Mail,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/authStore";
import { SCREEN_NAMES } from "../navigation/Routes";
import { useAnalytics } from "../hooks/useAnalytics";
import { TermsOfServiceModal } from "../components/Legal/TermsOfServiceModal";
import { PrivacyPolicyModal } from "../components/Legal/PrivacyPolicyModal";
import { ActivityIndicator } from "react-native";

const TOTAL_STEPS = 6;

const INTERESTS = [
  "Music",
  "Sports",
  "Food & Drink",
  "Art & Culture",
  "Nightlife",
  "Business",
  "Tech",
  "Health & Fitness",
  "Education",
  "Travel",
  "Fashion",
  "Gaming",
  "Photography",
  "Dance",
  "Comedy",
  "Literature",
  "Film",
  "Outdoor",
  "Charity",
  "Social",
];

// 🔹 Loader Overlay Component
const FullScreenLoader = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
    <View style={styles.loaderOverlay}>
      <ActivityIndicator size="large" color="#DB2777" />
      <Text style={styles.loaderText}>Creating your account…</Text>
    </View>
  );
};

const CITIES = [
  "Bangalore",
  "Chandigarh",
  "Delhi",
  "Goa",
  "Mumbai",
  "Pune",
  "Others",
];

export const ProfileCreationScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { trackEvent, trackFormSubmit, identifyUser } = useAnalytics(
    "ProfileCreationScreen",
    {
      step: currentStep,
    },
  );

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [location, setLocation] = useState({ country: "India", city: "" });
  const [locationPermission, setLocationPermission] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Step 5 State
  const [notifications, setNotifications] = useState({
    events: true,
    messages: true,
    marketing: false,
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // Step 6 State
  const [verificationCode, setVerificationCode] = useState("");

  const { signup, verifyEmail, loading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      clearError();
    }
  }, [error, clearError]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!firstName || !lastName || !username || !phone || !age) {
      Alert.alert("Error", "Please fill in all required fields");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (selectedInterests.length < 3) {
      // Alert matches design text "2 selected (1 more needed)" approximately
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    // For now, location is optional or we can enforce it. Design implies it's a setup step.
    // Let's make it optional for now as it's complex to mock valid countries/cities without a library or big list.
    // But if user enters nothing, we might want to warn or just proceed.
    // The screenshot has "Select your country" placeholder.
    // I'll assume it's optional for this task unless I implement a full picker.
    // Actually, I'll toggle the validation off for now or check if permission is granted.
    return true;
  };

  const validateStep5 = () => {
    if (!agreedToTerms) {
      Alert.alert(
        "Error",
        "You must agree to the Terms of Service and Privacy Policy",
      );
      return false;
    }
    return true;
  };

  const validateStep6 = () => {
    if (verificationCode.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return false;
    }
    return true;
  };

  const performSignup = async () => {
    const formData = new FormData();
    formData.append("name", `${firstName} ${lastName}`.trim());
    formData.append("email", email);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("phoneNumber", phone);
    formData.append("age", age);
    formData.append("bio", bio);
    formData.append("interests", JSON.stringify(selectedInterests));

    if (location.country) formData.append("country", location.country);
    if (location.city) formData.append("city", location.city);

    formData.append("eventNotifications", String(notifications.events));
    formData.append("messageNotifications", String(notifications.messages));
    formData.append("marketingNotifications", String(notifications.marketing));

    if (profileImage) {
      const filename = profileImage.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const fileObj = {
        uri: profileImage,
        name: filename,
        type,
      };
      console.log("Appending file to FormData:", JSON.stringify(fileObj));

      formData.append("profileImage", fileObj as any);
    }

    await signup(formData);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (validateStep5()) {
        try {
          await performSignup();
          setCurrentStep(6);
        } catch (err) {
          console.error("Signup error:", err);
          // Error alert is handled by useEffect
        }
      }
    } else if (currentStep === 6) {
      if (validateStep6()) {
        try {
          await verifyEmail({ email, otp: verificationCode });

          Toast.show({
            type: "success",
            text1: "Welcome to TAPPD!",
            text2: "Email verified successfully.",
          });

          // Navigate to Engage screen after a short delay
          setTimeout(() => {
            (navigation as any).reset({
              index: 0,
              routes: [
                {
                  name: SCREEN_NAMES.MAIN_TABS as any,
                  params: { screen: SCREEN_NAMES.ENGAGE },
                },
              ],
            });
          }, 1000);
        } catch (err) {
          console.error("Verification error:", err);
        }
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${(currentStep / TOTAL_STEPS) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.stepText}>
        Step {currentStep} of {TOTAL_STEPS}
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create Account</Text>
      <Text style={styles.stepSubtitle}>
        Let's get you started with the basics
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Create a password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff color="rgba(255,255,255,0.4)" size={20} />
            ) : (
              <Eye color="rgba(255,255,255,0.4)" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm your password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff color="rgba(255,255,255,0.4)" size={20} />
            ) : (
              <Eye color="rgba(255,255,255,0.4)" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Build Your Profile</Text>
      <Text style={styles.stepSubtitle}>Tell us a bit about yourself</Text>

      <View style={styles.avatarContainer}>
        <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Camera color="rgba(255,255,255,0.4)" size={32} />
            </View>
          )}
          <View style={styles.uploadBadge}>
            <Upload color="#FFFFFF" size={14} />
          </View>
        </TouchableOpacity>
        <Text style={styles.uploadText}>Tap to upload photo</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Last name"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Choose a unique username"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Your age"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Bio (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about yourself..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your Interests</Text>
      <Text style={styles.stepSubtitle}>
        Select at least 3 categories you're interested in
      </Text>

      <View style={styles.interestsGrid}>
        {INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest);
          return (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestButton,
                isSelected && styles.interestButtonSelected,
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Heart
                color={isSelected ? "#DB2777" : "rgba(255,255,255,0.6)"}
                size={16}
                fill={isSelected ? "#DB2777" : "transparent"}
              />
              <Text
                style={[
                  styles.interestText,
                  isSelected && styles.interestTextSelected,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.selectionCount}>
        {selectedInterests.length} selected
        {selectedInterests.length < 3
          ? ` (${3 - selectedInterests.length} more needed)`
          : ""}
      </Text>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MapPin color="#DB2777" size={48} />
      </View>
      <Text style={styles.stepTitle}>Location Setup</Text>
      <Text style={styles.stepSubtitle}>Help us show you local events</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Country</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your country"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={location.country}
          onChangeText={(text) =>
            setLocation((prev) => ({ ...prev, country: text }))
          }
          editable={false}
          selectTextOnFocus={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>City</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowCityDropdown(true)}
        >
          <Text
            style={[
              styles.dropdownButtonText,
              !location.city && styles.dropdownPlaceholder,
            ]}
          >
            {location.city || "Select your city"}
          </Text>
          <ChevronDown color="rgba(255,255,255,0.4)" size={20} />
        </TouchableOpacity>

        <Modal
          visible={showCityDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCityDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCityDropdown(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select City</Text>
                <TouchableOpacity onPress={() => setShowCityDropdown(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {CITIES.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setLocation((prev) => ({ ...prev, city }));
                      setShowCityDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        location.city === city && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {city}
                    </Text>
                    {location.city === city && (
                      <Check color="#DB2777" size={18} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      <View style={styles.permissionContainer}>
        <View style={styles.permissionTextContainer}>
          <Text style={styles.permissionTitle}>Location Permission</Text>
          <Text style={styles.permissionDesc}>
            Allow TAPPD to access your location for better event recommendations
          </Text>
        </View>
        <Switch
          trackColor={{ false: "#3e3e3e", true: "#DB2777" }}
          thumbColor={locationPermission ? "#FFFFFF" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={setLocationPermission}
          value={locationPermission}
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Bell color="#DB2777" size={48} />
      </View>
      <Text style={styles.stepTitle}>Notification Preferences</Text>
      <Text style={styles.stepSubtitle}>
        Customize how you want to stay updated
      </Text>

      <View style={styles.notificationCard}>
        <View style={styles.notificationRow}>
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationTitle}>Event Notifications</Text>
            <Text style={styles.notificationDesc}>
              Get notified about new events and updates
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#3e3e3e", true: "#DB2777" }}
            thumbColor={notifications.events ? "#FFFFFF" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(val) =>
              setNotifications((prev) => ({ ...prev, events: val }))
            }
            value={notifications.events}
          />
        </View>
      </View>

      <View style={styles.notificationCard}>
        <View style={styles.notificationRow}>
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationTitle}>Message Notifications</Text>
            <Text style={styles.notificationDesc}>
              Get notified about messages and connections
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#3e3e3e", true: "#DB2777" }}
            thumbColor={notifications.messages ? "#FFFFFF" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(val) =>
              setNotifications((prev) => ({ ...prev, messages: val }))
            }
            value={notifications.messages}
          />
        </View>
      </View>

      <View style={styles.notificationCard}>
        <View style={styles.notificationRow}>
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationTitle}>
              Marketing Notifications
            </Text>
            <Text style={styles.notificationDesc}>
              Receive promotional offers and updates
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#3e3e3e", true: "#DB2777" }}
            thumbColor={notifications.marketing ? "#FFFFFF" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(val) =>
              setNotifications((prev) => ({ ...prev, marketing: val }))
            }
            value={notifications.marketing}
          />
        </View>
      </View>

      <View style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Privacy & Safety</Text>
        <Text style={styles.privacyDesc}>
          Your data is secure with us. We use industry-standard encryption and
          never share your personal information without consent.
        </Text>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            {agreedToTerms && (
              <Check color="#0A0A1F" size={14} strokeWidth={4} />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            I agree to the{" "}
            <Text
              style={styles.linkText}
              onPress={() => setShowTermsModal(true)}
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              style={styles.linkText}
              onPress={() => setShowPrivacyModal(true)}
            >
              Privacy Policy
            </Text>

          </Text>

        </View>
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Mail color="#DB2777" size={48} />
      </View>
      <Text style={styles.stepTitle}>Verify Your Email</Text>
      <Text style={styles.stepSubtitle}>
        We've sent a 6-digit code to{"\n"}
        <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>{email}</Text>
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Verification Code</Text>
        <TextInput
          style={[
            styles.input,
            { textAlign: "center", letterSpacing: 8, fontSize: 24 },
          ]}
          placeholder="000000"
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Text style={styles.resendText}>Didn't receive the code?</Text>
        <TouchableOpacity>
          <Text style={styles.resendLink}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return (
          <View>
            <Text style={{ color: "#fff" }}>
              Step {currentStep} Placeholder
            </Text>
          </View>
        );
    }
  };

  return (
    <LinearGradient colors={["#0A0A1F", "#1A1A3F"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          {renderProgressBar()}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.nextButton, loading && { opacity: 0.7 }]}
              disabled={loading}
            >
              <LinearGradient
                colors={["#C026D3", "#DB2777"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {currentStep === 6 ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Check color="#FFFFFF" size={20} />
                    <Text style={styles.nextButtonText}>Complete Setup</Text>
                  </View>
                ) : (
                  <Text style={styles.nextButtonText}>Continue</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <FullScreenLoader visible={loading && currentStep === 5} />
      <TermsOfServiceModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 10,
  },
  progressContainer: {
    flex: 1,
    alignItems: "center",
  },
  stepText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 8,
  },
  progressBarBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#DB2777", // Pinkish color from screenshot
    borderRadius: 3,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarButton: {
    position: "relative",
    marginBottom: 10,
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,10,31,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  loaderText: {
    marginTop: 16,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#DB2777",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0A0A1F",
  },
  uploadText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  interestButton: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  interestButtonSelected: {
    borderColor: "#DB2777",
    backgroundColor: "rgba(219, 39, 119, 0.1)",
  },
  interestText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "500",
  },
  interestTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  selectionCount: {
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
    marginTop: 24,
    fontSize: 14,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  dropdownButton: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
  },
  permissionContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  permissionTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  permissionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  permissionDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
  },
  nextButton: {
    borderRadius: 28,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  notificationCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  notificationTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    lineHeight: 20,
  },
  privacyCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  privacyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  privacyDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#DB2777",
    borderColor: "#DB2777",
  },
  checkboxText: {
    color: "#FFFFFF",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  linkText: {
    color: "#DB2777",
    fontWeight: "600",
  },
  resendText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginBottom: 8,
  },
  resendLink: {
    color: "#DB2777",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: "rgba(255,255,255,0.4)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1A1A3F",
    borderRadius: 16,
    width: "100%",
    maxHeight: "70%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modalClose: {
    fontSize: 24,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "300",
  },
  modalScrollView: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  dropdownItemText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: "#DB2777",
    fontWeight: "600",
  },
});
