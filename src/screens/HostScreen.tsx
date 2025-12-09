// src/screens/HostScreen.tsx

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useCameraPermissions } from "expo-camera";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Calendar,
  Clock,
  Users,
  Upload,
  Info,
  X,
  Lock,
  FileText,
  QrCode,
  Settings,
  BarChart3,
  UserCheck,
  Camera,
  LayoutDashboard
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message"; // For toast messages
import { SafeAreaView } from "react-native-safe-area-context";

// Migrated UI Components
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Select, SelectItem, SelectValue } from "../components/ui/Select";
import { Switch } from "react-native"; // Use native RN Switch
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Separator } from "../components/ui/Separator";
import { Theme } from "../styles/Theme";
import { useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";




import { createStackNavigator } from "@react-navigation/stack";
// import { HostScreen } from "../screens/HostScreen"; // Removed to fix naming conflict
// import { PublishedEventsScreen } from "../screens/PublishedEventsScreen";
// FIX: Update the path below if the file exists elsewhere, or create the file if missing.
import { PublishedEventsScreen } from "./PublishedEventsScreen";
// Update the import path if Routes.ts is located elsewhere, for example:
import { SCREEN_NAMES } from "../navigation/Routes";
// Or, if the file does not exist, create 'Routes.ts' in the correct directory and export SCREEN_NAMES.
// Note: TooltipProvider/Tooltip/TooltipTrigger/TooltipContent are web-specific.
// We will replace them with a simple View/Modal or a basic Alert for the info icon.

interface TicketType {
  id: string;
  name: string;
  price: number;
}

interface EventForm {
  name: string;
  genre: string;
  category: string;
  date: string;
  time: string;
  location: string;
  maxOccupancy: number;
  ageRestriction: string;
  genderAllowance: string;
  alcoholAllowed: boolean;
  smokingAllowed: boolean;
  description: string;
  photos: string[];
  tickets: TicketType[];
}

interface HostProps {
  onShowDrafts?: () => void;
  onShowPublished?: () => void;
  onBack?: () => void;
  editingDraft?:
  | (EventForm & { id: string; createdAt: string; lastModified: string })
  | null;
}

const eventGenres = [
  "Arts, Culture & Entertainment",
  "Music & Nightlife",
  "Social & Lifestyle",
  "Business & Networking",
  "Wellness & Personal Growth",
  "Sports & Outdoors",
  "Education & Learning",
  "Community & Causes",
  "Family & Kids",
  "Seasonal & Special",
];

const eventCategories = [
  "Theatre Plays",
  "Stand-up Comedy",
  "Dance Performances",
  "Live Bands",
  "DJ & EDM Nights",
  "Cocktail Nights",
  "Rooftop Parties",
  "Corporate Conferences",
  "Startup Pitch Nights",
  "Yoga Retreats",
  "Sound Healing",
  "Football Matches",
  "Cricket Screenings",
  "Coding Bootcamps",
  "Tech Hackathons",
  "Charity Galas",
  "Fundraisers",
  "Kids Theatre",
  "Educational Fun Events",
  "New Year's Eve Parties",
];

const ageRestrictions = ["16+", "18+", "21+", "25+"];
const genderOptions = [
  "Only Male",
  "Only Female",
  "Male & Female",
  "All Genders",
];

const initialFormData: EventForm = {
  name: "",
  genre: "",
  category: "",
  date: "",
  time: "",
  location: "",
  maxOccupancy: 0,
  ageRestriction: "",
  genderAllowance: "",
  alcoholAllowed: false,
  smokingAllowed: false,
  description: "",
  photos: [],
  tickets: [{ id: "ticket-1", name: "Standard", price: 500 }],
};

const HostStack = createStackNavigator();

export function HostStackScreen() {
  return (
    <HostStack.Navigator screenOptions={{ headerShown: false }}>
      <HostStack.Screen name={SCREEN_NAMES.HOST} component={HostScreen} />
      <HostStack.Screen
        name={SCREEN_NAMES.PUBLISHED_EVENTS}
        component={PublishedEventsScreen}
      />
    </HostStack.Navigator>
  );
}

export function HostScreen({
  onShowDrafts,
  onShowPublished,
  onBack,
  editingDraft,
}: HostProps) {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<
    "private" | "public" | "published"
  >("private");
  const [showPublicVerification, setShowPublicVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "Harsh@tappd.co.in",
    password: "Tappd@2025",
  });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  const [localFormData, setLocalFormData] = useState<EventForm>(
    editingDraft || initialFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEventControlPopup, setShowEventControlPopup] = useState(false);
  const [popupActiveTab, setPopupActiveTab] = useState("analytics");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const localDateObj = localFormData.date
    ? new Date(localFormData.date)
    : new Date();

  const timeObj = new Date();
  if (localFormData.time) {
    const [hh, mm] = localFormData.time.split(":");
    timeObj.setHours(Number(hh));
    timeObj.setMinutes(Number(mm));
  }
  // Effect to load editing draft if provided
  useEffect(() => {
    if (editingDraft) {
      setLocalFormData(editingDraft);
    }
  }, [editingDraft]);

  // Handler for all standard text/number inputs
  const handleLocalFieldChange = useCallback(
    (field: keyof EventForm, value: any) => {
      setLocalFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );


  // Handler for ticket changes
  const handleLocalTicketChange = useCallback(
    (ticketId: string, field: "name" | "price", value: string | number) => {
      setLocalFormData((prev) => ({
        ...prev,
        tickets: prev.tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
        ),
      }));
    },
    []
  );

  const addTicketType = useCallback(() => {
    const newTicket: TicketType = {
      id: `ticket-${Date.now()}`,
      name: "",
      price: 500,
    };
    setLocalFormData((prev) => ({
      ...prev,
      tickets: [...prev.tickets, newTicket],
    }));
  }, []);

  const removeTicket = useCallback(
    (id: string) => {
      if (localFormData.tickets.length > 1) {
        setLocalFormData((prev) => ({
          ...prev,
          tickets: prev.tickets.filter((ticket) => ticket.id !== id),
        }));
      }
    },
    [localFormData.tickets.length]
  );

  const calculateServiceCharge = (price: number) => {
    const serviceCharge = Math.round(price * 0.2);
    const hostReceives = price - serviceCharge;
    return { serviceCharge, hostReceives };
  };

  const validateForm = (data: EventForm) => {
    const newErrors: Record<string, string> = {};

    if (!data.name.trim()) newErrors.name = "Event name is required";
    if (!data.genre) newErrors.genre = "Genre is required";
    if (!data.category) newErrors.category = "Category is required";
    if (!data.date) newErrors.date = "Date is required";
    if (!data.time) newErrors.time = "Time is required";
    if (!data.location.trim()) newErrors.location = "Location is required";
    if (data.maxOccupancy <= 0)
      newErrors.maxOccupancy = "Max occupancy must be greater than 0";
    if (!data.ageRestriction)
      newErrors.ageRestriction = "Age restriction is required";
    if (!data.genderAllowance)
      newErrors.genderAllowance = "Gender allowance is required";

    data.tickets.forEach((ticket, index) => {
      if (!ticket.name.trim())
        newErrors[`ticket_name_${index}`] = "Ticket name is required";
      if (ticket.price < 500)
        newErrors[`ticket_price_${index}`] = "Minimum ticket price is ₹500";
    });

    return newErrors;
  };

  const handleSaveDraft = async () => {
    // 1. Save to AsyncStorage (replaces localStorage)
    const draftId = editingDraft?.id || `draft-${Date.now()}`;
    const draftData = {
      ...localFormData,
      id: draftId,
      createdAt: editingDraft?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    try {
      const existingDraftsJson = await AsyncStorage.getItem("eventDrafts");
      const existingDrafts = existingDraftsJson
        ? JSON.parse(existingDraftsJson)
        : [];

      const updatedDrafts = existingDrafts.filter(
        (draft: any) => draft.id !== draftId
      );
      updatedDrafts.push(draftData);

      await AsyncStorage.setItem("eventDrafts", JSON.stringify(updatedDrafts));

      Toast.show({
        type: "success",
        text1: "Draft saved successfully!",
        position: "bottom",
      });
      console.log("Saving draft...", draftData);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Failed to save draft.",
        position: "bottom",
      });
    }
  };

  const handlePublishEvent = () => {
    const validationErrors = validateForm(localFormData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // 1. Publish logic here (in a real app, this sends to a backend API)
      const publishedData = {
        ...localFormData,
        id: `pub-${Date.now()}`,
        publishedAt: new Date().toISOString(),
        status: "upcoming",
      };

      Toast.show({
        type: "success",
        text1: "Event published successfully!",
        position: "bottom",
      });
      console.log("Publishing event...", publishedData);

      // 2. Reset form
      setLocalFormData(initialFormData);
    } else {
      Toast.show({
        type: "error",
        text1: "Please fix the errors before publishing.",
        position: "bottom",
      });
    }
  };

  const handlePublicTabClick = () => {
    if (!isVerified) {
      setShowPublicVerification(true);
    } else {
      setActiveTab("public");
    }
  };

  const handlePublishedTabClick = () => {
    navigation.navigate(SCREEN_NAMES.PUBLISHED_EVENTS as never);
    // if (onShowPublished) {
    //   onShowPublished();
    //   navigation.navigate(SCREEN_NAMES.PUBLISHED_EVENTS as never);
    // }
    // Note: We need a navigation hook here to switch to the PublishedEventsScreen
  };

  const handleLogin = () => {
    const newErrors: Record<string, string> = {};

    if (!loginData.username.trim()) newErrors.username = "Username is required";
    if (!loginData.password.trim()) newErrors.password = "Password is required";

    // Simple validation
    if (
      loginData.username === "Harsh@tappd.co.in" &&
      loginData.password === "Tappd@2025"
    ) {
      setIsVerified(true);
      setShowPublicVerification(false);
      setActiveTab("public");
      setLoginErrors({});
    } else {
      newErrors.credentials = "Invalid username or password";
    }

    setLoginErrors(newErrors);
  };

  // --- SUB COMPONENTS ---

  const PublicVerificationForm = () => (
    <View style={styles.verificationContainer}>
      <View style={styles.verificationTextCenter}>
        <View style={styles.verificationIconWrapper}>
          <Lock color={Theme.colors.primaryForeground} />
        </View>
        <Text style={styles.verificationTitle}>Host Verification</Text>
        <Text style={styles.verificationDescription}>
          Sign in with your verified host credentials to access public event
          creation.
        </Text>
      </View>

      <View style={styles.verificationForm}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <Input
            value={loginData.username}
            onChangeText={(value) => {
              setLoginData((prev) => ({ ...prev, username: value }));
              if (loginErrors.username) {
                setLoginErrors((prev) => ({ ...prev, username: "" }));
              }
            }}
            placeholder="Enter your email"
          />
          {loginErrors.username && (
            <Text style={styles.errorText}>{loginErrors.username}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <Input
            secureTextEntry
            value={loginData.password}
            onChangeText={(value) => {
              setLoginData((prev) => ({ ...prev, password: value }));
              if (loginErrors.password) {
                setLoginErrors((prev) => ({ ...prev, password: "" }));
              }
            }}
            placeholder="Enter your password"
          />
          {loginErrors.password && (
            <Text style={styles.errorText}>{loginErrors.password}</Text>
          )}
        </View>

        {loginErrors.credentials && (
          <View style={styles.credentialsErrorBox}>
            <Text style={styles.credentialsErrorText}>
              {loginErrors.credentials}
            </Text>
          </View>
        )}

        <View style={styles.buttonGroup}>
          <Button onClick={handleLogin} style={styles.fullWidthButton}>
            Sign In
          </Button>
          <Button
            onClick={() => {
              setShowPublicVerification(false);
              setActiveTab("private");
            }}
            variant="outline"
            style={styles.fullWidthButtonOutline}
          >
            Cancel
          </Button>
        </View>
      </View>
    </View>
  );


  const EventFormContent = () => (
    <View style={styles.formContentContainer}>
      <View style={styles.formSection}>
        {/* Event Basics */}
        <Card>
          <CardHeader>
            <CardTitle>Event Basics</CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContentPadding}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Name</Text>
              <Input
                value={localFormData.name}
                onChangeText={(value) => handleLocalFieldChange("name", value)}
                placeholder="Enter event name"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>
            <View style={styles.grid2Col}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Genre</Text>
                <Select
                  value={localFormData.genre}
                  onValueChange={(value) =>
                    handleLocalFieldChange("genre", value)
                  }
                >
                  <SelectValue placeholder="Select genre" />
                  {eventGenres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </Select>
                {errors.genre && (
                  <Text style={styles.errorText}>{errors.genre}</Text>
                )}
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Category</Text>
                <Select
                  value={localFormData.category}
                  onValueChange={(value) =>
                    handleLocalFieldChange("category", value)
                  }
                >
                  <SelectValue placeholder="Select category" />
                  {eventCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
                {errors.category && (
                  <Text style={styles.errorText}>{errors.category}</Text>
                )}
              </View>
            </View>

            <View style={styles.grid2Col}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Calendar
                      style={styles.iconInline}
                      size={16}
                      color={Theme.colors.foreground}
                    />
                    <Text style={{ color: Theme.colors.foreground }}>
                      {" "}
                      Date
                    </Text>
                  </View>
                </Text>
                {/* Note: RN TextInput type="date" is not directly supported, requires external DatePicker */}
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateBoxWrapper}
                >
                  <Text style={styles.dateText}>
                    {localFormData.date ? localFormData.date : "dd-mm-yyyy"}
                  </Text>

                  <Calendar
                    size={20}
                    color={Theme.colors.foreground}
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="date"
                  display="inline"
                  themeVariant="dark"
                  onConfirm={(selectedDate) => {
                    setShowDatePicker(false);

                    const dd = String(selectedDate.getDate()).padStart(2, "0");
                    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
                    const yyyy = selectedDate.getFullYear();

                    handleLocalFieldChange("date", `${dd}-${mm}-${yyyy}`);
                  }}
                  onCancel={() => setShowDatePicker(false)}
                />
                {errors.date && (
                  <Text style={styles.errorText}>{errors.date}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  <Clock
                    style={styles.iconInline}
                    size={16}
                    color={Theme.colors.foreground}
                  />{" "}
                  Time
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  style={styles.timeBoxWrapper}
                >
                  <Text style={styles.timeText}>
                    {localFormData.time ? localFormData.time : "--:--"}
                  </Text>

                  <Clock
                    size={20}
                    color={Theme.colors.foreground}
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={showTimePicker}
                  mode="time"
                  display="spinner"     // 👈 THIS MAKES IT A WHEEL PICKER
                  themeVariant="dark"
                  onConfirm={(selectedTime) => {
                    setShowTimePicker(false);
                    const hh = String(selectedTime.getHours()).padStart(2, "0");
                    const mm = String(selectedTime.getMinutes()).padStart(2, "0");
                    handleLocalFieldChange("time", `${hh}:${mm}`);
                  }}
                  onCancel={() => setShowTimePicker(false)}
                />



                {errors.time && (
                  <Text style={styles.errorText}>{errors.time}</Text>
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                <MapPin
                  style={styles.iconInline}
                  size={16}
                  color={Theme.colors.foreground}
                />{" "}
                Location
              </Text>
              <Input
                value={localFormData.location}
                onChangeText={(value) =>
                  handleLocalFieldChange("location", value)
                }
                placeholder="Enter event location"
              />
              {errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                <Users
                  style={styles.iconInline}
                  size={16}
                  color={Theme.colors.foreground}
                />{" "}
                Max Occupancy
              </Text>
              <Input
                keyboardType="numeric"
                value={
                  localFormData.maxOccupancy > 0
                    ? String(localFormData.maxOccupancy)
                    : ""
                }
                onChangeText={(value) =>
                  handleLocalFieldChange("maxOccupancy", parseInt(value) || 0)
                }
                placeholder="Enter maximum capacity"
              />
              {errors.maxOccupancy && (
                <Text style={styles.errorText}>{errors.maxOccupancy}</Text>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Restrictions & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Restrictions & Permissions</CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContentPadding}>
            <View style={styles.grid2Col}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Age Restrictions</Text>
                <Select
                  value={localFormData.ageRestriction}
                  onValueChange={(value) =>
                    handleLocalFieldChange("ageRestriction", value)
                  }
                >
                  <SelectValue placeholder="Select age limit" />
                  {ageRestrictions.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age}
                    </SelectItem>
                  ))}
                </Select>
                {errors.ageRestriction && (
                  <Text style={styles.errorText}>{errors.ageRestriction}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Gender Allowance</Text>
                <Select
                  value={localFormData.genderAllowance}
                  onValueChange={(value) =>
                    handleLocalFieldChange("genderAllowance", value)
                  }
                >
                  <SelectValue placeholder="Select allowance" />
                  {genderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </Select>
                {errors.genderAllowance && (
                  <Text style={styles.errorText}>{errors.genderAllowance}</Text>
                )}
              </View>
            </View>

            <View style={styles.grid2Col}>
              <View style={styles.switchWrapper}>
                <View style={styles.switchTextGroup}>
                  <Text style={styles.label}>Alcohol Allowed</Text>
                  <Text style={styles.switchSubText}>
                    Allow alcoholic beverages
                  </Text>
                </View>
                <Switch
                  value={localFormData.alcoholAllowed}
                  onValueChange={(checked) =>
                    handleLocalFieldChange("alcoholAllowed", checked)
                  }
                  trackColor={{
                    false: Theme.colors.muted,
                    true: Theme.colors.primary,
                  }}
                  thumbColor={Theme.colors.foreground}
                />
              </View>

              <View style={styles.switchWrapper}>
                <View style={styles.switchTextGroup}>
                  <Text style={styles.label}>Smoking Allowed</Text>
                  <Text style={styles.switchSubText}>Allow smoking areas</Text>
                </View>
                <Switch
                  value={localFormData.smokingAllowed}
                  onValueChange={(checked) =>
                    handleLocalFieldChange("smokingAllowed", checked)
                  }
                  trackColor={{
                    false: Theme.colors.muted,
                    true: Theme.colors.primary,
                  }}
                  thumbColor={Theme.colors.foreground}
                />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Availability & Tickets */}
        <Card>
          <CardHeader style={styles.ticketHeader}>
            <CardTitle>Availability & Tickets</CardTitle>
            <Button onClick={addTicketType} size="sm">
              <Plus size={16} color={Theme.colors.primaryForeground} />
              <Text style={{ color: Theme.colors.primaryForeground }}>
                Add Ticket
              </Text>
            </Button>
          </CardHeader>
          <CardContent style={styles.cardContentPadding}>
            {localFormData.tickets.map((ticket, index) => (
              <View key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketCardHeader}>
                  <Text style={styles.ticketTitle}>
                    Ticket Type {index + 1}
                  </Text>
                  {localFormData.tickets.length > 1 && (
                    <Button
                      onClick={() => removeTicket(ticket.id)}
                      size="icon"
                      variant="destructive" // Use destructive variant for delete
                    >
                      <X size={16} color={Theme.colors.foreground} />
                    </Button>
                  )}
                </View>

                <View style={styles.grid2Col}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Ticket Name</Text>
                    <Input
                      value={ticket.name}
                      onChangeText={(value) =>
                        handleLocalTicketChange(ticket.id, "name", value)
                      }
                      placeholder="e.g., Standard, Premium, VIP"
                    />
                    {errors[`ticket_name_${index}`] && (
                      <Text style={styles.errorText}>
                        {errors[`ticket_name_${index}`]}
                      </Text>
                    )}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Price (₹)</Text>
                    <Input
                      keyboardType="numeric"
                      value={ticket.price > 0 ? String(ticket.price) : ""}
                      onChangeText={(value) =>
                        handleLocalTicketChange(
                          ticket.id,
                          "price",
                          parseInt(value) || 500
                        )
                      }
                      placeholder="500"
                    />
                    {errors[`ticket_price_${index}`] && (
                      <Text style={styles.errorText}>
                        {errors[`ticket_price_${index}`]}
                      </Text>
                    )}
                  </View>
                </View>

                {ticket.price >= 500 && (
                  <View style={styles.serviceChargeBox}>
                    <View style={styles.serviceChargeHeader}>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            "Service Charge",
                            "TAPPD charges 20% service fee to maintain platform quality, secure payments, and provide customer support."
                          )
                        }
                      >
                        <Info size={16} color={Theme.colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.serviceChargeTitle}>
                        Service Charge Breakdown
                      </Text>
                    </View>
                    <View style={styles.serviceChargeDetails}>
                      <View style={styles.serviceChargeRow}>
                        <Text style={styles.serviceChargeDetailText}>
                          Ticket Price:
                        </Text>
                        <Text style={styles.serviceChargeDetailText}>
                          ₹{ticket.price}
                        </Text>
                      </View>
                      <View style={styles.serviceChargeRow}>
                        <Text style={styles.serviceChargeDetailText}>
                          TAPPD Service Charge (20%):
                        </Text>
                        <Text
                          style={[
                            styles.serviceChargeDetailText,
                            { color: Theme.colors.destructive },
                          ]}
                        >
                          -₹{calculateServiceCharge(ticket.price).serviceCharge}
                        </Text>
                      </View>
                      <Separator style={styles.serviceChargeSeparator} />
                      <View style={styles.serviceChargeRow}>
                        <Text style={styles.serviceChargeNetText}>
                          You will receive:
                        </Text>
                        <Text style={styles.serviceChargeNetText}>
                          ₹{calculateServiceCharge(ticket.price).hostReceives}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </CardContent>
        </Card>

        {/* More Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>More Event Details</CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContentPadding}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Description</Text>
              <Textarea
                value={localFormData.description}
                onChangeText={(value) =>
                  handleLocalFieldChange("description", value)
                }
                placeholder="Describe your event in detail..."
                rows={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                <Upload
                  style={styles.iconInline}
                  size={16}
                  color={Theme.colors.foreground}
                />{" "}
                Event Photos (Up to 5)
              </Text>
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={() => console.log("Open image picker")}
              >
                <Upload
                  size={32}
                  color={Theme.colors.mutedForeground}
                  style={styles.uploadIcon}
                />
                <Text style={styles.uploadText}>
                  Click to upload or drag & drop
                </Text>
                <Text style={styles.uploadSubText}>
                  PNG, JPG up to 5MB each
                </Text>
              </TouchableOpacity>
              {/* Photo preview logic omitted for brevity */}
            </View>
          </CardContent>
        </Card>
      </View>
      <View style={styles.bottomSpacer} />
    </View>
  );

  // CLICK HANDLERS FOR POPUP BUTTONS
  const handleAnalytics = () => {
    setPopupActiveTab("analytics");
  };

  const handleScan = () => {
    setPopupActiveTab("scan");
  };

  const handleGuests = () => {
    setPopupActiveTab("guests");
  };


  const EventControlPopup = () => (
    <View style={styles.popupOverallContainer}>
      <View style={styles.popupOverlay}>
        <View style={styles.popupContainer}>

          {/* Header */}
          <View style={styles.popupHeaderRow}>
            <Text style={styles.popupTitle}>Summer Jazz Festival</Text>

            <TouchableOpacity onPress={() => setShowEventControlPopup(false)}>
              <X size={22} color={Theme.colors.foreground} />
            </TouchableOpacity>
          </View>

          <Text style={styles.popupSubtitle}>
            Manage your event, scan tickets, and view real-time analytics
          </Text>

          {/* Tabs */}
          <View style={styles.popupTabs}>
            {/* (keep your existing tab buttons here) */}
            {/* Analytics */}
            <TouchableOpacity onPress={handleAnalytics} style={[styles.popupTab, popupActiveTab === "analytics" && styles.popupTabActive]}>
              <View style={styles.popupTabInner}>
                <BarChart3 size={18} color={popupActiveTab === "analytics" ? Theme.colors.primaryForeground : Theme.colors.mutedForeground} />
                <Text style={popupActiveTab === "analytics" ? styles.popupTabActiveText : styles.popupTabText}>Analytics</Text>
              </View>
            </TouchableOpacity>

            {/* Scan */}
            <TouchableOpacity onPress={handleScan} style={[styles.popupTab, popupActiveTab === "scan" && styles.popupTabActive]}>
              <View style={styles.popupTabInner}>
                <QrCode size={18} color={popupActiveTab === "scan" ? Theme.colors.primaryForeground : Theme.colors.mutedForeground} />
                <Text style={popupActiveTab === "scan" ? styles.popupTabActiveText : styles.popupTabText}>Scan</Text>
              </View>
            </TouchableOpacity>

            {/* Guests */}
            <TouchableOpacity onPress={handleGuests} style={[styles.popupTab, popupActiveTab === "guests" && styles.popupTabActive]}>
              <View style={styles.popupTabInner}>
                <Users size={18} color={popupActiveTab === "guests" ? Theme.colors.primaryForeground : Theme.colors.mutedForeground} />
                <Text style={popupActiveTab === "guests" ? styles.popupTabActiveText : styles.popupTabText}>Guests</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Body: KEEP header/tabs outside, body fills remaining popup area */}
          <View style={{ flex: 1, marginTop: 8 }}>
            {popupActiveTab === "guests" && <GuestsContent />}
            {popupActiveTab === "scan" && <ScanContent />}
            {popupActiveTab === "analytics" && (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }} showsVerticalScrollIndicator={false}>
                <Text style={{ color: Theme.colors.mutedForeground }}>Analytics UI placeholder</Text>
              </ScrollView>
            )}
          </View>

        </View>
      </View>
    </View>
  );






  const GuestsContent = () => {
    const guestList = [
      {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        ticketType: "VIP",
        ticketId: "VIP-001",
        time: "7:30 PM",
        status: "checked",
      },
      {
        id: 2,
        name: "Michael Chen",
        email: "m.chen@email.com",
        ticketType: "Standard",
        ticketId: "STD-045",
        time: "7:45 PM",
        status: "checked",
      },
      {
        id: 3,
        name: "Emma Wilson",
        email: "emma.w@email.com",
        ticketType: "Standard",
        ticketId: "STD-022",
        time: "8:00 PM",
        status: "pending",
      },
      {
        id: 4,
        name: "David Patel",
        email: "d.patel@email.com",
        ticketType: "VIP",
        ticketId: "VIP-014",
        time: "6:50 PM",
        status: "checked",
      },
      {
        id: 5,
        name: "Olivia Martinez",
        email: "olivia.m@email.com",
        ticketType: "Premium",
        ticketId: "PRE-010",
        time: "7:10 PM",
        status: "pending",
      },
      {
        id: 6,
        name: "James Anderson",
        email: "j.anderson@email.com",
        ticketType: "Standard",
        ticketId: "STD-089",
        time: "8:15 PM",
        status: "checked",
      },
      {
        id: 7,
        name: "Priya Sharma",
        email: "priya.s@email.com",
        ticketType: "Premium",
        ticketId: "PRE-023",
        time: "7:55 PM",
        status: "pending",
      },
      {
        id: 8,
        name: "William Brown",
        email: "will.b@email.com",
        ticketType: "VIP",
        ticketId: "VIP-009",
        time: "6:40 PM",
        status: "checked",
      },
      {
        id: 9,
        name: "Ava Thompson",
        email: "ava.t@email.com",
        ticketType: "Standard",
        ticketId: "STD-031",
        time: "8:20 PM",
        status: "pending",
      },
      {
        id: 10,
        name: "Daniel Kim",
        email: "daniel.k@email.com",
        ticketType: "VIP",
        ticketId: "VIP-017",
        time: "7:20 PM",
        status: "checked",
      },
      {
        id: 11,
        name: "Sophia Lee",
        email: "sophia.l@email.com",
        ticketType: "Premium",
        ticketId: "PRE-032",
        time: "7:05 PM",
        status: "checked",
      },
      {
        id: 12,
        name: "Henry Walker",
        email: "henry.w@email.com",
        ticketType: "Standard",
        ticketId: "STD-099",
        time: "8:30 PM",
        status: "pending",
      },
      {
        id: 13,
        name: "Meera Gupta",
        email: "meera.g@email.com",
        ticketType: "VIP",
        ticketId: "VIP-025",
        time: "6:55 PM",
        status: "checked",
      },
      {
        id: 14,
        name: "Robert Davis",
        email: "rob.d@email.com",
        ticketType: "Standard",
        ticketId: "STD-052",
        time: "7:40 PM",
        status: "checked",
      },
      {
        id: 15,
        name: "Isabella Harris",
        email: "isabella.h@email.com",
        ticketType: "Premium",
        ticketId: "PRE-044",
        time: "8:05 PM",
        status: "pending",
      },
      {
        id: 16,
        name: "Noah Smith",
        email: "noah.s@email.com",
        ticketType: "Standard",
        ticketId: "STD-061",
        time: "6:45 PM",
        status: "checked",
      },
      {
        id: 17,
        name: "Zara Khan",
        email: "zara.k@email.com",
        ticketType: "VIP",
        ticketId: "VIP-033",
        time: "7:15 PM",
        status: "pending",
      },
      {
        id: 18,
        name: "Ethan Wright",
        email: "ethan.w@email.com",
        ticketType: "Standard",
        ticketId: "STD-074",
        time: "7:50 PM",
        status: "checked",
      },
      {
        id: 19,
        name: "Maya Rodriguez",
        email: "maya.r@email.com",
        ticketType: "Premium",
        ticketId: "PRE-056",
        time: "7:00 PM",
        status: "checked",
      },
      {
        id: 20,
        name: "Lucas Green",
        email: "lucas.g@email.com",
        ticketType: "VIP",
        ticketId: "VIP-045",
        time: "8:25 PM",
        status: "pending",
      },
    ];


    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            Total Guests: <Text style={styles.summaryBold}>{guestList.length}</Text>
          </Text>

          <Text style={styles.summaryText}>
            Checked In:{" "}
            <Text style={[styles.summaryBold, { color: "#22c55e" }]}>
              {guestList.filter(g => g.status === "checked").length}
            </Text>
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchPlaceholder}>Search guests...</Text>
        </View>

        {/* Guests list */}
        <View style={{ paddingTop: 6 }}>
          {guestList.map((g) => (
            <View key={g.id} style={styles.guestCard}>
              <View style={styles.guestIndexCircle}>
                <Text style={styles.guestIndexText}>#{g.id}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Text style={styles.guestName}>{g.name}</Text>

                  {g.status === "checked" ? (
                    <View style={[styles.checkedBadge, { marginLeft: 8 }]}>
                      <Text style={styles.checkedBadgeText}>Checked In</Text>
                    </View>
                  ) : (
                    <View style={[styles.pendingBadge, { marginLeft: 8 }]}>
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.guestEmail}>{g.email}</Text>

                <View style={styles.guestMetaRow}>
                  <Text style={styles.guestMeta}>{g.ticketType}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.guestMeta}>{g.ticketId}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={[styles.guestMeta, { color: g.status === "checked" ? "#4ade80" : Theme.colors.mutedForeground }]}>
                    {g.time}
                  </Text>
                </View>
              </View>

              {g.status === "checked" ? (
                <UserCheck size={26} color="#4ade80" />
              ) : (
                <TouchableOpacity>
                  <LinearGradient colors={["#D11A87", "#7F1AB2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.checkInButton}>
                    <Text style={styles.checkInButtonText}>Check In</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* bottom spacer so last item isn't hidden */}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const ScanContent = () => {
    return (
      <ScrollView
        style={{ flex: 1, marginTop: 20 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ---------- CAMERA CARD ---------- */}
        <View
          style={{
            backgroundColor: "#18122F",
            borderRadius: Theme.radius.xl,
            padding: Theme.spacing.l,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            minHeight: 380,
            marginBottom: 20,
          }}
        >
          {/* QR Icon */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View
              style={{
                padding: 30,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: "#C84BFF",
              }}
            >
              <QrCode size={80} color="#C84BFF" />
            </View>

            <Text
              style={{
                color: Theme.colors.mutedForeground,
                marginTop: 14,
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Scan QR code or enter ticket number manually
            </Text>
          </View>

          {/* Camera Scan Button */}
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={["#D11A87", "#7F1AB2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
                marginBottom: 16,
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Camera size={18} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Open Camera to Scan QR Code
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Manual Check-in Input */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <Input
              placeholder="Enter Ticket Number"
              style={{ flex: 1 }}
            />

            <LinearGradient
              colors={["#D11A87", "#7F1AB2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Check In
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* ---------- STATS SECTION (NO CARD WRAPPER) ---------- */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <View style={styles.scanStatBox}>
            <Text style={[styles.scanStatNumber, { color: "#C84BFF" }]}>15</Text>
            <Text style={styles.scanStatLabel}>Total</Text>
          </View>

          <View style={styles.scanStatBox}>
            <Text style={[styles.scanStatNumber, { color: "#22c55e" }]}>7</Text>
            <Text style={styles.scanStatLabel}>In</Text>
          </View>

          <View style={styles.scanStatBox}>
            <Text style={[styles.scanStatNumber, { color: "#facc15" }]}>8</Text>
            <Text style={styles.scanStatLabel}>Pending</Text>
          </View>
        </View>

      </ScrollView>
    );
  };











  if (onShowPublished && activeTab === "published") {
    // Parent component (AppNavigator or HostScreen wrapper) will handle the navigation to PublishedEventsScreen
    return null;
  }

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.flex1} edges={["top"]}>
      <View style={styles.mainContainer}>

        {/* HEADER */}
        <View style={styles.mainHeader}>
          <TouchableOpacity onPress={handlePublishedTabClick} style={styles.headerIconLeft}>
            <ArrowLeft size={22} color={Theme.colors.foreground} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onShowDrafts} style={styles.draftIconWrapper}>
            <FileText size={20} color={Theme.colors.primaryForeground} />
          </TouchableOpacity>

          <Text style={styles.mainHeaderTitle}>Welcome Host</Text>

          <TouchableOpacity
            onPress={() => setShowEventControlPopup(true)}
            style={styles.headerIconRight}
          >
            <LayoutDashboard size={22} color={Theme.colors.foreground} />
          </TouchableOpacity>

        </View>
        {showEventControlPopup && <EventControlPopup />}
        {/* MENU TABS */}
        <View style={styles.tabMenu}>
          <TouchableOpacity
            onPress={() => setActiveTab("private")}
            style={[styles.tabButton, activeTab === "private" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === "private" && styles.tabTextActive]}>Private Event</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePublishedTabClick}
            style={styles.tabButton}
          >
            <Text style={styles.tabText}>Published Events</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePublicTabClick}
            style={[styles.tabButton, activeTab === "public" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === "public" && styles.tabTextActive]}>Public Event</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        {showPublicVerification ? (
          <PublicVerificationForm />
        ) : (
          <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollPadding}>
            <EventFormContent />
          </ScrollView>
        )}

        {/* BOTTOM ACTION BAR */}
        {!showPublicVerification && activeTab !== "published" && (
          <View style={styles.bottomActionBar}>


            <View style={styles.bottomActionBarInner}>
              <Button onClick={handleSaveDraft} variant="outline" style={styles.bottomButtonOutline}>
                Save as Draft
              </Button>

              <Button onClick={handlePublishEvent} style={styles.bottomButtonPrimary}>
                Publish Event
              </Button>
            </View>
          </View>
        )}

      </View>

      <Toast />
    </SafeAreaView>
  );

}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  // --- Main Header ---
  mainHeader: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  mainHeaderTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "bold",
  },
  headerIconLeft: {
    position: "absolute",
    left: 16,
    padding: 6,
  },

  headerIconRight: {
    position: "absolute",
    right: 16,
    padding: 6,
  },

  draftIconWrapper: {
    position: "absolute",
    left: 60,
    backgroundColor: "#2A2344",   // same faint circle as screenshot
    padding: 10,
    borderRadius: 30,
  },

  // --- Tab Menu ---
  tabMenu: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderColor: Theme.colors.primary,
  },
  tabButtonRelative: {
    position: "relative",
  },
  tabText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  tabTextActive: {
    color: Theme.colors.foreground,
    fontWeight: "bold",
    // The gradient background for active tab is complex; we rely on the underline/text color for now.
  },
  // for date-time dropdown


  dateBoxWrapper: {
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.muted,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dateText: {
    color: Theme.colors.foreground,
    fontSize: 14,
  },
  timeBoxWrapper: {
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.muted,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timeText: {
    color: Theme.colors.foreground,
    fontSize: 14,
  },

  // popup styles
  popupOverlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    width: "100%",
    height: "100%",
    paddingTop: 0,
  },
  popupOverallContainer: {
    position: "absolute",
    top: 70,              // keep it below the header
    left: 0,
    right: 0,
    bottom: 0,            // <-- allow full overlay height so children can size with percentages
    zIndex: 9999,
    elevation: 20,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  popupContainer: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.l,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,

    // Give the popup a concrete size so inner scrollables can measure.
    height: "94%",    // concrete height (adjust if you want taller/shorter)
    width: "92%",     // fixed width percent
    overflow: "hidden",
  },

  popupTabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },


  popupHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  popupTitle: {
    color: Theme.colors.foreground,
    fontSize: 20,
    fontWeight: "bold",
  },

  popupSubtitle: {
    color: Theme.colors.mutedForeground,
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
  },

  popupTabs: {
    flexDirection: "row",
    backgroundColor: Theme.colors.secondary,
    borderRadius: 50,
    padding: 6,
    justifyContent: "space-between",
  },

  popupTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 40,
  },

  popupTabActive: {
    backgroundColor: Theme.colors.primary,
  },

  popupTabText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    fontWeight: "500",
  },

  popupTabActiveText: {
    color: Theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: "bold",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },

  summaryText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },

  summaryBold: {
    color: Theme.colors.foreground,
    fontWeight: "bold",
  },

  searchBox: {
    backgroundColor: Theme.colors.inputBackground,
    padding: 14,
    borderRadius: Theme.radius.lg,
    marginBottom: 16,
  },

  searchPlaceholder: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },

  guestCard: {
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  guestIndexCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#30144eff",   // darker, deeper purple
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },


  guestIndexText: {
    color: "#C84BFF",             // neon pink-purple from screenshot
    fontWeight: "700",
    fontSize: 14,
  },


  guestName: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },

  guestEmail: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    marginBottom: 8,
  },

  guestMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  guestMeta: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },

  dot: {
    color: Theme.colors.mutedForeground,
    marginHorizontal: 4,
  },




  checkedBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",   // light green bg
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.4)",        // light green border
  },

  checkedBadgeText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "600",
  },


  pendingBadge: {
    backgroundColor: "rgba(234, 179, 8, 0.12)",   // light amber bg
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.4)",        // light amber border
  },

  pendingBadgeText: {
    color: "#facc15",
    fontSize: 12,
    fontWeight: "600",
  },

  checkInButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",

    // Make height fixed so it stays compact
    height: 28,
  },

  checkInButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  // scan styling
  scanStatBox: {
    width: "30%",
    backgroundColor: Theme.colors.muted,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  scanStatNumber: {
    fontSize: 22,
    fontWeight: "700",
  },

  scanStatLabel: {
    fontSize: 12,
    marginTop: 4,
    color: Theme.colors.mutedForeground,
  },



  // --- Verification Form ---
  verificationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  verificationTextCenter: {
    alignItems: "center",
    marginBottom: 24,
  },
  verificationIconWrapper: {
    width: 64,
    height: 64,
    backgroundColor: Theme.colors.primary,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  verificationLockIcon: {
    color: Theme.colors.primaryForeground,
  },
  verificationTitle: {
    color: Theme.colors.foreground,
    fontSize: 20,
    fontWeight: "bold",
  },
  verificationDescription: {
    color: Theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: 8,
  },
  verificationForm: {
    width: "100%",
    maxWidth: 400,
    gap: 16,
  },
  credentialsErrorBox: {
    padding: 12,
    backgroundColor: Theme.colors.destructive, // Placeholder color, use a softer red later
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.destructive,
  },
  credentialsErrorText: {
    color: Theme.colors.foreground,
    textAlign: "center",
    fontSize: 14,
  },
  buttonGroup: {
    gap: 12,
  },
  fullWidthButton: {
    width: "100%",
  },
  fullWidthButtonOutline: {
    width: "100%",
    borderColor: Theme.colors.border,
  },
  // --- Event Form ---
  scrollPadding: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 100, // Extra padding to ensure content scrolls above fixed bar
  },
  formContentContainer: {
    gap: 32,
  },
  formSection: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
    marginBottom: 8,
  },
  cardContentPadding: {
    paddingVertical: 16, // Adjust padding inside card content
  },
  label: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  errorText: {
    color: Theme.colors.destructive,
    fontSize: 12,
    marginTop: 4,
  },
  grid2Col: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconInline: {
    marginRight: 4,
  },
  // Switch
  switchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
  },
  switchTextGroup: {
    flexShrink: 1,
    marginRight: 10,
  },
  switchSubText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },
  // Tickets
  ticketHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ticketCard: {
    padding: 16,
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
    gap: 16,
  },
  ticketCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketTitle: {
    color: Theme.colors.foreground,
    fontWeight: "bold",
  },
  // Service Charge
  serviceChargeBox: {
    padding: 12,
    backgroundColor: Theme.colors.primary, // bg-primary/10 (using solid color for simplicity)
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary, // border-primary/20
  },
  serviceChargeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  serviceChargeTitle: {
    color: Theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: "bold",
  },
  serviceChargeDetails: {
    gap: 4,
    fontSize: 14,
  },
  serviceChargeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceChargeDetailText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  serviceChargeNetText: {
    color: Theme.colors.primary, // text-primary
    fontWeight: "bold",
    fontSize: 14,
  },
  serviceChargeSeparator: {
    backgroundColor: Theme.colors.border,
    marginVertical: 4,
  },
  // Upload
  uploadBox: {
    padding: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  uploadSubText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: 4,
  },
  // --- Fixed Bottom Bar ---
  bottomActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.background,
    borderTopWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // Use SafeAreaView padding in the root to handle iPhone X/notch padding
  },
  bottomActionBarInner: {
    flexDirection: "row",
    gap: 12,
    maxWidth: 600, // Optional max width for tablet view
    alignSelf: "center",
    width: "100%",
  },
  bottomButtonOutline: {
    flex: 1,
    borderColor: Theme.colors.border,
  },
  bottomButtonPrimary: {
    flex: 1,
  },
  bottomSpacer: {
    height: 100, // Spacer at the bottom of the ScrollView
  },

});
