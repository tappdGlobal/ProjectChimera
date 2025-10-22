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
import { Badge } from "../components/ui/Badge";
import { Separator } from "../components/ui/Separator";
import { Theme } from "../styles/Theme";
import { useNavigation } from "@react-navigation/native";

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
    if (onShowPublished) {
      onShowPublished();
      navigation.navigate(SCREEN_NAMES.PUBLISHED_EVENTS as never);
    }
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
                <Input
                  value={localFormData.date}
                  onChangeText={(value) =>
                    handleLocalFieldChange("date", value)
                  }
                  placeholder="YYYY-MM-DD"
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
                <Input
                  value={localFormData.time}
                  onChangeText={(value) =>
                    handleLocalFieldChange("time", value)
                  }
                  placeholder="HH:MM"
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

  if (onShowPublished && activeTab === "published") {
    // Parent component (AppNavigator or HostScreen wrapper) will handle the navigation to PublishedEventsScreen
    return null;
  }

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.flex1} edges={["top"]}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.mainHeader}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              onPress={handlePublishedTabClick}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={Theme.colors.foreground} />
            </TouchableOpacity>
            {onShowDrafts && (
              <TouchableOpacity
                onPress={onShowDrafts}
                style={styles.backButton}
              >
                <FileText size={20} color={Theme.colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.mainHeaderTitle}>Welcome Host</Text>
        </View>

        {/* Menu Tabs */}
        <View style={styles.tabMenu}>
          <TouchableOpacity
            onPress={() => setActiveTab("private")}
            style={[
              styles.tabButton,
              activeTab === "private" && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "private" && styles.tabTextActive,
              ]}
            >
              Private Event
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePublishedTabClick}
            style={styles.tabButton}
          >
            <Text style={styles.tabText}>Published Events</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePublicTabClick}
            style={[
              styles.tabButton,
              activeTab === "public" && styles.tabButtonActive,
              styles.tabButtonRelative,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "public" && styles.tabTextActive,
              ]}
            >
              Public Event
            </Text>
            {isVerified && (
              <Badge
                style={styles.verifiedBadge}
                textStyle={styles.verifiedBadgeText}
              >
                Verified
              </Badge>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {showPublicVerification ? (
          <PublicVerificationForm />
        ) : (
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.scrollPadding}
          >
            <EventFormContent />
          </ScrollView>
        )}

        {/* Bottom Action Buttons (Fixed Footer) */}
        {!showPublicVerification && activeTab !== "published" && (
          <View style={styles.bottomActionBar}>
            <View style={styles.bottomActionBarInner}>
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                style={styles.bottomButtonOutline}
              >
                Save as Draft
              </Button>
              <Button
                onClick={handlePublishEvent}
                style={styles.bottomButtonPrimary}
              >
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
  backButtonContainer: {
    position: "absolute",
    left: 16,
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 9999,
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
  verifiedBadge: {
    position: "absolute",
    top: -4,
    right: 4,
    backgroundColor: "green",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 0,
  },
  verifiedBadgeText: {
    fontSize: 10,
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
