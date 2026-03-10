import React, { useState, useEffect, useRef } from "react";
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
import { useUserStore } from "../store/userStore";
import { SCREEN_NAMES } from "../navigation/Routes";
import { useAnalytics } from "../hooks/useAnalytics";
import { TermsOfServiceModal } from "../components/Legal/TermsOfServiceModal";
import { PrivacyPolicyModal } from "../components/Legal/PrivacyPolicyModal";
import { ActivityIndicator } from "react-native";
import { updateUserApi, uploadProfilePictureApi } from "../api/userApi";
import { signupApi, checkUsernameApi, checkEmailApi, checkPhoneApi } from "../api/authApi";

const TOTAL_STEPS = 6;
const RESEND_COOLDOWN = 60; // 60 seconds cooldown

// 🔹 Password Requirement Checker Component
interface RequirementCheckProps {
  label: string;
  met: boolean;
}

const RequirementCheck: React.FC<RequirementCheckProps> = ({ label, met }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
    <Text
      style={{
        color: met ? "#10B981" : "rgba(255,255,255,0.3)",
        fontSize: 14,
        fontWeight: "bold",
        marginRight: 8,
        width: 16,
        textAlign: "center",
      }}
    >
      {met ? "✓" : "○"}
    </Text>
    <Text
      style={{
        color: met ? "#10B981" : "rgba(255,255,255,0.5)",
        fontSize: 12,
      }}
    >
      {label}
    </Text>
  </View>
);

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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
  const [step5AgreeError, setStep5AgreeError] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  // Step 6 State
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Error state for fields
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [cityError, setCityError] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");

  // Real-time password validation state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Availability check states
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);

  const { signup, verifyEmail, loading, error, clearError } = useAuthStore();

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Real-time password validation feedback
  useEffect(() => {
    if (!password) {
      setPasswordRequirements({
        minLength: false,
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
      return;
    }

    const requirements = {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    setPasswordRequirements(requirements);

    // Check if all requirements are met
    const allMet = Object.values(requirements).every(Boolean);
    if (allMet) {
      setPasswordError("");
    } else {
      setPasswordError("Password does not meet all requirements");
    }
  }, [password]);

  // Debounced username availability check
  useEffect(() => {
    if (!username.trim() || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [username]);

  // Debounced email availability check - only after format validation
  useEffect(() => {
    if (!email.trim()) {
      setEmailAvailable(null);
      setEmailError("");
      return;
    }

    // First validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // Invalid format - show format error
      setEmailAvailable(null);
      setEmailError("Please enter a valid email address");
      return;
    }

    // Email format is valid - clear errors
    setEmailAvailable(true);
    setEmailError("");
  }, [email]);

  // Debounced phone availability check
  useEffect(() => {
    if (!phone.trim() || phone.length < 10) {
      setPhoneAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      checkPhoneAvailability(phone);
    }, 500);

    return () => clearTimeout(timer);
  }, [phone]);

  useEffect(() => {
    if (error) {
      console.error("ProfileCreationScreen error:", error);
      const errorString = typeof error === 'string' ? error : JSON.stringify(error);
      Alert.alert("Signup Error", errorString);
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

  // Validation helper functions
  const validateEmail = (emailValue: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      return "Email is required";
    }
    if (!emailRegex.test(emailValue)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (passwordValue: string): string => {
    if (!passwordValue) {
      return "Password is required";
    }
    if (passwordValue.length < 8) {
      return "Password must be at least 8 characters";
    }
    const hasLowercase = /[a-z]/.test(passwordValue);
    const hasUppercase = /[A-Z]/.test(passwordValue);
    const hasNumber = /[0-9]/.test(passwordValue);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue);

    if (!hasLowercase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasUppercase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const validatePhone = (phoneValue: string): string => {
    if (!phoneValue) {
      return "Phone number is required";
    }
    // Only require that the phone contains digits (length not enforced here)
    if (!/^\d+$/.test(phoneValue)) {
      return "Phone number must contain only digits";
    }
    // Require exactly 10 digits
    if (phoneValue.length !== 10) {
      return "Phone number must be 10 digits";
    }
    return "";
  };

  const validateAge = (ageValue: string): string => {
    if (!ageValue) {
      return "Age is required";
    }
    const ageNum = parseInt(ageValue, 10);
    if (isNaN(ageNum)) {
      return "Age must be a valid number";
    }
    if (ageNum <= 0) {
      return "Age must be greater than 0";
    }
    return "";
  };

  const checkUsernameAvailability = async (usernameToCHeck: string) => {
    if (!usernameToCHeck.trim() || usernameToCHeck.length < 3) {
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await checkUsernameApi(usernameToCHeck);

      // API may return either a wrapped ApiResponse `{ data: { available } }`
      // or a direct object `{ available }` depending on backend/version.
      const available = response?.data?.available ?? response?.available ?? null;

      // If we could determine availability, set it; otherwise mark as unknown (null).
      // Do NOT block the user based on availability here; backend will validate on signup.
      setUsernameAvailable(typeof available === "boolean" ? available : null);
      // Clear any availability-related username errors (we only require the field be non-empty)
      setUsernameError("");
    } catch (error: any) {
      console.error("Username check error:", error);
      // If API fails, don't assume taken — mark availability as unknown
      setUsernameAvailable(null);
      setUsernameError("");
      // Log quietly; avoid showing a toast for transient network errors
      console.warn("Could not verify username availability:", error?.message || error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const checkEmailAvailability = async (emailToCheck: string) => {
    if (!emailToCheck.trim()) {
      return;
    }

    setCheckingEmail(true);
    try {
      const response = await checkEmailApi(emailToCheck);
      setEmailAvailable(response.data?.available ?? false);
      if (!response.data?.available) {
        // Email is already registered
        setEmailError("This email is already registered. Please use another.");
      } else {
        // Email is available - clear any availability-related errors
        setEmailError("");
        setEmailAvailable(true);
      }
    } catch (error: any) {
      console.error("Email check error:", error);
      // Network error or API issue - don't block user, just note it
      setCheckingEmail(false);
      setEmailAvailable(null);
      console.warn("Could not verify email availability - user can still proceed");
      return;
    } finally {
      setCheckingEmail(false);
    }
  };

  const checkPhoneAvailability = async (phoneToCheck: string) => {
    if (!phoneToCheck.trim()) {
      return;
    }

    setCheckingPhone(true);
    try {
      const response = await checkPhoneApi(phoneToCheck);
      // Record availability for UI hinting, but do not block submission based on it.
      setPhoneAvailable(response.data?.available ?? response?.available ?? null);
      // Clear any availability-related phone errors (we only require the field be non-empty)
      if (phoneError?.includes("already")) {
        setPhoneError("");
      }
    } catch (error: any) {
      console.error("Phone check error:", error);
      // If API fails, mark availability unknown and don't block the user
      setPhoneAvailable(null);
      setPhoneError("");
      // Log quietly; avoid showing a toast for transient/network errors
      console.warn("Could not verify phone availability:", error?.message || error);
    } finally {
      setCheckingPhone(false);
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
    // Clear previous errors
    setPasswordError("");
    setConfirmPasswordError("");

    // Validate email format
    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailError(emailErr);
      return false;
    }

    // Validate password
    const passwordErr = validatePassword(password);
    if (passwordErr) {
      setPasswordError(passwordErr);
      return false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      return false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    // Clear previous errors
    setFirstNameError("");
    setAgeError("");

    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError("First name is required");
      return false;
    }

    // Validate username
    if (!username.trim()) {
      setUsernameError("Username is required");
      return false;
    }

    // Do not block on username availability here; only require the field be non-empty.

    // Validate phone
    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return false;
    }

    // Do not block on phone availability here; only require the field be non-empty.

    // Validate age
    const ageErr = validateAge(age);
    if (ageErr) {
      setAgeError(ageErr);
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (selectedInterests.length < 3) {
      Toast.show({
        type: "error",
        text1: "Select Interests",
        text2: "Please select at least 3 interests to continue",
      });
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    // Clear previous error
    setCityError("");

    if (!location.city) {
      setCityError("Please select a city");
      return false;
    }
    return true;
  };

  const validateStep5 = () => {
    if (!agreedToTerms) {
      setStep5AgreeError(true);
      scrollViewRef.current?.scrollToEnd({ animated: true });
      return false;
    }
    setStep5AgreeError(false);
    return true;
  };

  const validateStep6 = () => {
    // Clear previous error
    setVerificationCodeError("");

    if (!verificationCode) {
      setVerificationCodeError("Verification code is required");
      return false;
    }

    if (verificationCode.length !== 6) {
      setVerificationCodeError("Please enter a valid 6-digit code");
      return false;
    }

    return true;
  };

  const performSignup = async () => {
    // Step 1: Signup with basic auth info only
    const signupPayload = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      username,
      password,
    };

    await signup(signupPayload);
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      // Try to call signup again - if user already exists, backend should resend the code
      const signupPayload = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        username,
        password,
      };
      await signupApi(signupPayload);

      Toast.show({
        type: "success",
        text1: "Code Resent",
        text2: "A new verification code has been sent to your email.",
      });

      // Start cooldown
      setResendCooldown(RESEND_COOLDOWN);
    } catch (error: any) {
      console.error("Resend code error:", error);
      // Check if error is because user already exists - in that case, code was resent
      const errorMessage = error?.response?.data?.message || "";
      if (errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("user already")) {
        // User exists, which means the backend should have resent the code
        Toast.show({
          type: "success",
          text1: "Code Resent",
          text2: "A new verification code has been sent to your email.",
        });
        setResendCooldown(RESEND_COOLDOWN);
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to Resend",
          text2: errorMessage || "Could not resend code. Please try again.",
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  const updateUserProfile = async (userId: string) => {
    try {
      // Step 2: Update user profile with additional data
      const updatePayload = {
        bio,
        age: parseInt(age, 10) || undefined,
        interests: selectedInterests,
        location: location.city || location.country || undefined,
      };

      const updateRes = await updateUserApi(userId, updatePayload);

      // Step 3: Upload profile picture if selected
      let profilePicUrl = updateRes.data?.profilePicUrl;
      if (profileImage) {
        setIsUploadingImage(true);   // START LOADER

        try {
          let fileUri = profileImage;
          if (Platform.OS === "android" && !fileUri.startsWith("file://")) {
            fileUri = `file://${fileUri}`;
          }

          const filename = profileImage.split("/").pop() || "profile.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          const fileObj = {
            uri: fileUri,
            name: filename,
            type,
          };

          const uploadRes = await uploadProfilePictureApi(userId, fileObj);
          profilePicUrl = uploadRes.data?.profilePicUrl;

        } catch (uploadErr: any) {
          console.error("Photo upload failed:", uploadErr);
        } finally {
          setIsUploadingImage(false);  // STOP LOADER
        }
      }

      // Step 4: Save user data to store
      if (updateRes.data) {
        // If photo upload failed but user selected a photo, use the local URI temporarily
        const finalProfilePicUrl = profilePicUrl || updateRes.data.profilePicUrl || profileImage || undefined;
        console.log("DEBUG: Saving profile to store:", {
          profilePicUrl,
          updateResProfilePicUrl: updateRes.data.profilePicUrl,
          profileImage,
          finalProfilePicUrl,
        });
        useUserStore.getState().setProfile({
          ...updateRes.data,
          profilePicUrl: finalProfilePicUrl,
        });
        console.log("DEBUG: Profile saved, current store:", useUserStore.getState().profile);
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      Toast.show({
        type: "error",
        text1: "Profile Update Failed",
        text2: error?.response?.data?.message || error.message || "Failed to update profile",
      });
      throw error;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      // Extra guard: ensure phone is exactly 10 digits before proceeding
      const phoneDigits = phone.replace(/[^0-9]/g, "");
      if (!/^\d{10}$/.test(phoneDigits)) {
        setPhoneError("Phone number must be 10 digits");
        return;
      }

      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    } else if (currentStep === 4) {
      if (validateStep4()) setCurrentStep(5);
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
          const verifyRes = await verifyEmail({ email, otp: verificationCode });

          // Save initial user data to store
          if (verifyRes?.data?.user) {
            useUserStore.getState().setProfile(verifyRes.data.user);
          }

          // Update user profile and upload photo after successful verification
          const userId = verifyRes?.data?.user?.id;
          if (userId) {
            try {
              await updateUserProfile(userId);
            } catch (profileErr) {
              console.error("Profile update error:", profileErr);
              // Don't block navigation if profile update fails
            }
          }

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
        <Text style={styles.inputLabel}>
          Email <Text style={styles.asterisk}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, emailError && styles.inputError]}
          placeholder="Enter your email"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={email}
          onChangeText={(text) => {
            // Sanitize input: allow letters, numbers and common email characters only
            const sanitized = text.replace(/[^a-zA-Z0-9@._+\-]/g, "");
            setEmail(sanitized);
            // Reset availability while editing
            setEmailAvailable(null);
            // Provide immediate inline validation feedback
            const err = validateEmail(sanitized);
            setEmailError(err);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Password <Text style={styles.asterisk}>*</Text>
        </Text>
        <View style={[styles.passwordContainer, passwordError && styles.passwordContainerError]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Create a password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
            }}
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

        {/* Real-time password requirements */}
        {password && (
          <View style={styles.passwordRequirementsContainer}>
            <RequirementCheck
              label="At least 8 characters"
              met={passwordRequirements.minLength}
            />
            <RequirementCheck
              label="Uppercase letter (A-Z)"
              met={passwordRequirements.hasUppercase}
            />
            <RequirementCheck
              label="Lowercase letter (a-z)"
              met={passwordRequirements.hasLowercase}
            />
            <RequirementCheck
              label="Number (0-9)"
              met={passwordRequirements.hasNumber}
            />
            <RequirementCheck
              label="Special character (!@#$%^&*)"
              met={passwordRequirements.hasSpecialChar}
            />
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Confirm Password <Text style={styles.asterisk}>*</Text>
        </Text>
        <View style={[styles.passwordContainer, confirmPasswordError && styles.passwordContainerError]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm your password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError("");
            }}
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
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
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
            <View style={{ position: "relative" }}>
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />

              {isUploadingImage && (
                <View style={styles.imageUploadOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
            </View>
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
          <Text style={styles.inputLabel}>
            First Name <Text style={styles.asterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, firstNameError && styles.inputError]}
            placeholder="First name"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setFirstNameError("");
            }}
          />
          {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Last name (optional)"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Username <Text style={styles.asterisk}>*</Text>
        </Text>
        <View style={{ position: "relative" }}>
          <TextInput
            style={[styles.input, usernameError && styles.inputError]}
            placeholder="Choose a unique username"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (text.trim().length < 3) {
                setUsernameError("");
              }
            }}
            autoCapitalize="none"
            editable={!checkingUsername}
          />
          {checkingUsername && (
            <ActivityIndicator
              style={styles.inputSpinner}
              size="small"
              color="#DB2777"
            />
          )}
          {usernameAvailable === true && !checkingUsername && (
            <Text style={styles.successIndicator}>✓</Text>
          )}
        </View>
        {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
        {usernameAvailable === true && !checkingUsername && (
          <Text style={styles.successText}>Username is available</Text>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>
            Phone <Text style={styles.asterisk}>*</Text>
          </Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={[styles.input, phoneError && styles.inputError]}
              placeholder="10-digit phone number"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={phone}
              onChangeText={(text) => {
                // Only allow digits
                const numericOnly = text.replace(/[^0-9]/g, "");
                setPhone(numericOnly);
                // Show immediate inline error if user entered fewer than 10 digits
                if (numericOnly.length > 0 && numericOnly.length < 10) {
                  setPhoneError("Phone number must be 10 digits");
                } else {
                  setPhoneError("");
                }
              }}
              keyboardType="number-pad"
              maxLength={10}
              editable={!checkingPhone}
            />
            {checkingPhone && (
              <ActivityIndicator
                style={styles.inputSpinner}
                size="small"
                color="#DB2777"
              />
            )}
            {phoneAvailable === true && !checkingPhone && (
              <Text style={styles.successIndicator}>✓</Text>
            )}
          </View>
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          {phoneAvailable === true && !checkingPhone && (
            <Text style={styles.successText}>Phone number is available</Text>
          )}
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>
            Age <Text style={styles.asterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, ageError && styles.inputError]}
            placeholder="Your age"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={age}
            onChangeText={(text) => {
              // Only allow digits
              const numericOnly = text.replace(/[^0-9]/g, "");
              setAge(numericOnly);
              setAgeError("");
            }}
            keyboardType="number-pad"
            maxLength={3}
          />
          {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
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
        <Text style={styles.inputLabel}>
          City <Text style={styles.asterisk}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.dropdownButton, cityError && styles.dropdownButtonError]}
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
        {cityError ? <Text style={styles.errorText}>{cityError}</Text> : null}

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

        <View style={[styles.checkboxRow, step5AgreeError && styles.checkboxRowFocusOutline]}>
          <TouchableOpacity
            style={[styles.checkbox, agreedToTerms && styles.checkboxChecked, step5AgreeError && styles.checkboxFocusOutline]}
            onPress={() => {
              setAgreedToTerms(!agreedToTerms);
              setStep5AgreeError(false);
            }}
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
        {step5AgreeError && (
          <View style={styles.agreeErrorBanner}>
            <Text style={styles.agreeErrorText}>
              Please agree to the Terms of Service and Privacy Policy to continue
            </Text>
          </View>
        )}
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
        <Text style={styles.inputLabel}>
          Verification Code <Text style={styles.asterisk}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            { textAlign: "center", letterSpacing: 8, fontSize: 24 },
            verificationCodeError && styles.inputError,
          ]}
          placeholder="000000"
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={verificationCode}
          onChangeText={(text) => {
            setVerificationCode(text);
            setVerificationCodeError("");
          }}
          keyboardType="number-pad"
          maxLength={6}
        />
        {verificationCodeError ? <Text style={styles.errorText}>{verificationCodeError}</Text> : null}
      </View>

      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Text style={styles.resendText}>Didn't receive the code?</Text>
        <TouchableOpacity
          onPress={handleResendCode}
          disabled={resendCooldown > 0 || isResending}
        >
          <Text style={[
            styles.resendLink,
            (resendCooldown > 0 || isResending) && { opacity: 0.5 }
          ]}>
            {isResending
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Code"
            }
          </Text>
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
            ref={scrollViewRef}
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
      <TermsOfServiceModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#DB2777" />
          <Text style={styles.loaderText}>Please wait...</Text>
        </View>
      )}
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
  checkboxRowFocusOutline: {
    padding: 12,
    marginHorizontal: -12,
    marginTop: -4,
    marginBottom: -4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#DB2777",
    backgroundColor: "rgba(219, 39, 119, 0.06)",
  },
  checkboxFocusOutline: {
    borderWidth: 2,
    borderColor: "#DB2777",
    backgroundColor: "rgba(219, 39, 119, 0.15)",
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
  agreeErrorBanner: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(219, 39, 119, 0.12)",
    borderLeftWidth: 4,
    borderLeftColor: "#DB2777",
  },
  agreeErrorText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    lineHeight: 20,
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
  asterisk: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  passwordContainerError: {
    borderColor: "#FF6B6B",
  },
  dropdownButtonError: {
    borderColor: "#FF6B6B",
  },
  passwordHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  inputSpinner: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -12,
  },
  successIndicator: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -12,
    color: "#10B981",
    fontSize: 20,
    fontWeight: "bold",
  },
  successText: {
    color: "#10B981",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
  passwordRequirementsContainer: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#DB2777",
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  requirementIcon: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
    width: 16,
    textAlign: "center",
  },
  requirementMetIcon: {
    color: "#10B981",
  },
  requirementText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  requirementMetText: {
    color: "#10B981",
  },
  imageUploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
