// src/screens/HostScreen.tsx

import React, { useState, useCallback, useEffect } from "react";
import ManageEventsScreen from "./ManageEventsScreen";
import { StackNavigationProp } from "@react-navigation/stack";
// import { StackNavigationProp } from "@react-navigation/stack";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useCameraPermissions } from "expo-camera";
import { EventControlPopup } from "../components/host/EventControlPopup";
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
  LayoutDashboard,
  TrendingUp,
  Eye,
  Car,
  CheckCircle2,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message"; // For toast messages
import { useEventStore } from "../store/eventStore";
import * as ImagePicker from "expo-image-picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChevronDown, Layers } from "lucide-react-native";

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
import { Badge } from "../components/ui/Badge";
import { Theme } from "../styles/Theme";
import { HostStackParamList } from "../navigation/Routes";
import { useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { GRADIENT_COLORS } from "../styles/Theme";
import { createStackNavigator } from "@react-navigation/stack";
// import { HostScreen } from "../screens/HostScreen"; // Removed to fix naming conflict
// import { PublishedEventsScreen } from "../screens/PublishedEventsScreen";
// FIX: Update the path below if the file exists elsewhere, or create the file if missing.
import { PublishedEventsScreen } from "./PublishedEventsScreen";
import { SCREEN_NAMES } from "../navigation/Routes";
import { DraftsScreen } from "./DraftsScreen";
import ComingSoon from "../components/common/ComingSoon";
import LocationPickerModal from "../components/host/LocationPickerModal";
import { StatusBar } from "expo-status-bar";
import { useAnalytics } from "../hooks/useAnalytics";
const SERVICE_CHARGE_PERCENT = 20;

interface TicketType {
  id: string;
  name: string; // UI name
  price: number;
  quantityTotal: number; // REQUIRED by backend
  description?: string; // Optional ticket description
}

interface EventForm {
  name: string;
  genre: string;
  category: string;
  date: string; // UI: dd-mm-yyyy
  time: string; // HH:mm
  location: string;

  address: string; // ✅ NEW
  city: string; // ✅ NEW
  country: string; // ✅ NEW
  venue: string; // ✅ NEW
  latitude?: number; // ✅ NEW
  longitude?: number; // ✅ NEW

  maxOccupancy: number;
  ageRestriction: string;
  genderAllowance: string;
  alcoholAllowed: boolean;
  smokingAllowed: boolean;
  description: string;
  photos: string[];
  tickets: TicketType[];
}
interface DraftEvent {
  id: string;

  eventName?: string;
  genre?: string;
  category?: string;
  eventType?: "public" | "private";

  eventDate?: string;
  eventTime?: string;
  location?: string;

  address?: string | null;
  city?: string | null;
  country?: string | null;
  venue?: string | null;

  maxCapacity?: number;
  ageLimit?: string;
  allowance?: string;

  allowAlcohol?: boolean;
  allowSmokingAreas?: boolean;

  description?: string;
  images?: string[];
  tickets?: TicketType[];

  createdAt: string;
  lastModified: string;
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

  address: "",
  city: "",
  country: "India",
  venue: "",

  maxOccupancy: 0,
  ageRestriction: "",
  genderAllowance: "",
  alcoholAllowed: false,
  smokingAllowed: false,
  description: "",
  photos: [],

  tickets: [], // ✅ EMPTY INITIALLY
};

const HostStack = createStackNavigator();

export function HostStackScreen() {
  return (
    <HostStack.Navigator screenOptions={{ headerShown: false }}>
      <HostStack.Screen name={SCREEN_NAMES.HOST_MAIN} component={HostScreen} />
      <HostStack.Screen
        name={SCREEN_NAMES.PUBLISHED_EVENTS}
        component={PublishedEventsScreen}
      />
      <HostStack.Screen
        name={SCREEN_NAMES.DRAFT_EVENTS}
        component={DraftsScreen}
      />
      <HostStack.Screen
        name={SCREEN_NAMES.MANAGE_EVENTS}
        component={ManageEventsScreen}
      />
    </HostStack.Navigator>
  );
}

export function HostScreen({ route }: any) {
  const editingDraft = route?.params?.editingDraft;

  console.log("🏠 HostScreen mounted");
  console.log("🏠 editingDraft from route:", editingDraft);
  const navigation = useNavigation<
    StackNavigationProp<HostStackParamList, typeof SCREEN_NAMES.HOST_MAIN>
  >();
  const insets = useSafeAreaInsets();
  useAnalytics("HostScreen");

  const [activeTab, setActiveTab] = useState<
    "private" | "public" | "published"
  >("private");
  const eventType = activeTab;

  const {
    createEvent,
    saveDraft,
    updateDraft,
    publishDraft,
    generatePublicPin,
    verifyPublicPin,
    loading: creatingEvent,
    error: eventError,
  } = useEventStore();


  const [draftId, setDraftId] = useState<string | null>(null);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showTickets, setShowTickets] = useState(false);

  const [showPinModal, setShowPinModal] = useState(false);
  const [showPublicVerification, setShowPublicVerification] = useState(false);
  const [pin, setPin] = useState("");
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [locationHandled, setLocationHandled] = useState(false);
  const [localFormData, setLocalFormData] =
    useState<EventForm>(initialFormData);

  // Save form data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveFormData = async () => {
      try {
        await AsyncStorage.setItem('hostFormData', JSON.stringify(localFormData));
      } catch (e) {
        console.log('Error saving form data:', e);
      }
    };
    saveFormData();
  }, [localFormData]);

  // Restore form data from AsyncStorage on mount
  useEffect(() => {
    console.log('🔄 Attempting to restore form data...');
    const restoreFormData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('hostFormData');
        console.log('📦 Saved data from storage:', savedData);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('📋 Parsed data:', parsedData);
          // Only restore if we have meaningful data and we're not editing a draft
          if (!editingDraft && parsedData.name) {
            console.log('✅ Restoring form data from storage');
            setLocalFormData(parsedData);
          } else {
            console.log('❌ Not restoring - editingDraft:', editingDraft, 'name:', parsedData.name);
          }
        } else {
          console.log('❌ No saved data found');
        }
      } catch (e) {
        console.log('Error restoring form data:', e);
      }
    };
    restoreFormData();
  }, [editingDraft]);

  // Clear saved form data when event is created or draft is saved
  const clearSavedFormData = async () => {
    try {
      await AsyncStorage.removeItem('hostFormData');
    } catch (e) {
      console.log('Error clearing form data:', e);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEventControlPopup, setShowEventControlPopup] = useState(false);
  const [popupActiveTab, setPopupActiveTab] = useState("analytics");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const toISODateTime = (date: string, time: string) => {
    // date: dd-mm-yyyy
    const [dd, mm, yyyy] = date.split("-");
    return new Date(`${yyyy}-${mm}-${dd}T${time}:00Z`).toISOString();
  };

  const mapAgeLimit = (age: string): number => {
    switch (age) {
      case "16+":
        return 16;
      case "18+":
        return 18;
      case "21+":
        return 21;
      case "25+":
        return 25;
      default:
        return 18;
    }
  };

  const mapAllowance = (gender: string): "PUBLIC" | "PRIVATE" => {
    // backend expects PUBLIC / PRIVATE
    return gender === "Only Male" || gender === "Only Female"
      ? "PRIVATE"
      : "PUBLIC";
  };

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
    if (!editingDraft) return;
    if (draftId) return;

    console.log("🧩 Mapping draft to form:", editingDraft);

    setDraftId(editingDraft.id);

    setActiveTab(editingDraft.eventType === "public" ? "public" : "private");

    setLocalFormData({
      name: editingDraft.eventName ?? "",
      genre: editingDraft.genre ?? "",
      category: editingDraft.category ?? "",

      date: editingDraft.eventDate
        ? new Date(editingDraft.eventDate)
          .toISOString()
          .slice(0, 10)
          .split("-")
          .reverse()
          .join("-")
        : "",

      time: editingDraft.eventTime ?? "",
      location: editingDraft.location ?? "",

      address: editingDraft.address ?? "",
      city: editingDraft.city ?? "",
      country: editingDraft.country ?? "India",
      venue: editingDraft.venue ?? "",

      maxOccupancy: editingDraft.maxCapacity ?? 0,

      ageRestriction:
        editingDraft.ageLimit === "TWENTY_ONE_PLUS"
          ? "21+"
          : editingDraft.ageLimit === "EIGHTEEN_PLUS"
            ? "18+"
            : "",

      genderAllowance:
        editingDraft.allowance === "PRIVATE"
          ? "Only Male"
          : "All Genders",

      alcoholAllowed: editingDraft.allowAlcohol ?? false,
      smokingAllowed: editingDraft.allowSmokingAreas ?? false,

      description: editingDraft.description ?? "",
      photos: editingDraft.images ?? [],
      tickets: editingDraft.tickets ?? [],
    });
  }, [editingDraft]);
  useEffect(() => {
    if (resendTimer === 0) return;

    const timer = setTimeout(() => {
      setResendTimer(resendTimer - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimer]);


  useEffect(() => {
    const selectedLocation = route?.params?.selectedLocation;

    if (!selectedLocation) return;

    console.log("📍 Received location:", selectedLocation);

    setLocalFormData((prev) => ({
      ...prev,
      location: selectedLocation.address || "",
      address: selectedLocation.address || "",
      city: selectedLocation.city || "",
      country: selectedLocation.country || "India",
      venue: selectedLocation.venue || "",
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    }));

    setErrors((prev) => ({
      ...prev,
      location: "",
      address: "",
      city: "",
      country: "",
      venue: "",
    }));

    // 🔥 CLEAR PARAM AFTER USING IT
    navigation.setParams({ selectedLocation: undefined });

  }, [route?.params?.selectedLocation]);


  const handleResendPin = async () => {
    if (resendTimer > 0) return;

    try {
      await generatePublicPin();

      Toast.show({
        type: "success",
        text1: "PIN Resent",
        text2: "New PIN sent to Tappd Event Management Team",
      });

      setResendTimer(30);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to resend PIN",
      });
    }
  };
  // Handler for all standard text/number inputs
  const handleLocalFieldChange = useCallback(
    (field: keyof EventForm, value: any) => {
      setLocalFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors],
  );

  // Handler for location selection from Google Places
  const handleLocationSelect = useCallback(
    (locationData: {
      location: string;
      address: string;
      city: string;
      country: string;
      venue: string;
      latitude?: number;
      longitude?: number;
    }) => {
      setLocalFormData((prev) => ({
        ...prev,
        location: locationData.location,
        address: locationData.address,
        city: locationData.city,
        country: locationData.country || "India",
        venue: locationData.venue,
      }));
      // Clear any location-related errors
      setErrors((prev) => ({
        ...prev,
        location: "",
        address: "",
        city: "",
        country: "",
        venue: "",
      }));
    },
    []
  );

  // ... inside HostScreen component ...

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true, // Allow multiple if supported (requires newer expo/RN)
      selectionLimit: 5,
    });

    if (!result.canceled) {
      // Append new photos to existing ones, up to 5 total
      const newPhotos = result.assets.map((asset) => asset.uri);
      setLocalFormData((prev) => {
        const updatedPhotos = [...prev.photos, ...newPhotos].slice(0, 5);
        return { ...prev, photos: updatedPhotos };
      });
    }
  };

  const removePhoto = (index: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Handler for ticket changes
  const handleLocalTicketChange = useCallback(
    (ticketId: string, field: "name" | "price" | "description" | "quantityTotal", value: string | number) => {
      setLocalFormData((prev) => ({
        ...prev,
        tickets: prev.tickets.map((ticket) =>
          ticket.id === ticketId
            ? {
              ...ticket,
              [field]:
                field === "price" || field === "quantityTotal"
                  ? value === ""
                    ? 0 // Handle empty string as 0 internally
                    : parseInt(String(value)) || 0
                  : value,
            }
            : ticket,
        ),
      }));
    },
    [],
  );

  const addTicketType = useCallback(() => {
    setShowTickets(true);

    const newTicket: TicketType = {
      id: `ticket-${Date.now()}`,
      name: "",
      price: 0,
      quantityTotal: 100,
      description: "",
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
    [localFormData.tickets.length],
  );

  const calculateServiceCharge = (price: number) => {
    if (price <= 0) {
      return { serviceCharge: 0, hostReceives: 0 };
    }

    const serviceCharge = Math.round(price * (SERVICE_CHARGE_PERCENT / 100));
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
      if (ticket.price < 0)
        newErrors[`ticket_price_${index}`] = "Ticket price cannot be negative";
    });

    return newErrors;
  };

  const handleSaveDraft = async () => {
    try {
      setIsDraftLoading(true);

      const payload = buildDraftPayload();

      if (draftId) {
        await updateDraft(draftId, payload);
        Toast.show({ type: "success", text1: "Draft updated" });
      } else {
        await saveDraft(payload);
        Toast.show({ type: "success", text1: "Draft saved" });
      }

      /* ✅ RESET FORM AFTER SAVE */
      setDraftId(null);
      setLocalFormData(initialFormData);
      setActiveTab("private");
      clearSavedFormData();


    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.message || "Failed to save draft",
      });
    } finally {
      setIsDraftLoading(false);
    }
  };




  const uriToFile = (uri: string, index: number) => {
    // Extract file extension from URI
    const match = /\.([\w]+)$/.exec(uri);
    const ext = match ? match[1].toLowerCase() : 'jpg';

    // Determine mime type based on extension
    let type = 'image/jpeg';
    if (ext === 'png') type = 'image/png';
    else if (ext === 'gif') type = 'image/gif';
    else if (ext === 'webp') type = 'image/webp';

    // For React Native FormData, we need to return the object directly
    // The apiClient will handle the file upload properly
    return {
      uri,
      name: `event-image-${index}.${ext}`,
      type,
    };
  };
  const buildDraftPayload = () => {
    const payload: any = {};

    if (localFormData.name) payload.eventName = localFormData.name;
    if (localFormData.genre) payload.genre = localFormData.genre;
    if (localFormData.category) payload.category = localFormData.category;

    payload.eventType = activeTab === "public" ? "public" : "private";

    if (localFormData.date && localFormData.time) {
      payload.eventDate = toISODateTime(
        localFormData.date,
        localFormData.time
      );
      payload.eventTime = localFormData.time;
    }

    if (localFormData.location) payload.location = localFormData.location;
    if (localFormData.address) payload.address = localFormData.address;
    if (localFormData.city) payload.city = localFormData.city;
    if (localFormData.country) payload.country = localFormData.country;
    if (localFormData.venue) payload.venue = localFormData.venue;

    if (localFormData.maxOccupancy > 0)
      payload.maxCapacity = localFormData.maxOccupancy;

    if (localFormData.ageRestriction)
      payload.ageLimit = mapAgeLimit(localFormData.ageRestriction);

    if (localFormData.genderAllowance)
      payload.allowance = mapAllowance(localFormData.genderAllowance);

    payload.allowAlcohol = localFormData.alcoholAllowed;
    payload.allowSmokingAreas = localFormData.smokingAllowed;

    if (localFormData.description)
      payload.description = localFormData.description;

    if (localFormData.tickets.length > 0) {
      payload.tickets = localFormData.tickets.map((t) => ({
        ticketLabel: t.name,
        ticketType: "PAID" as const,
        price: t.price,
        currency: "INR",
        serviceChargePercentage: SERVICE_CHARGE_PERCENT,
        quantityTotal: t.quantityTotal,
      }));
    }

    return payload;
  };


  // PUBLIC EVENT PIN FLOW

  const createEventAfterVerification = async () => {
    try {
      const imageFiles = await Promise.all(
        localFormData.photos.map((uri, index) => uriToFile(uri, index))
      );

      const payload = {
        eventName: localFormData.name,
        genre: localFormData.genre,
        category: localFormData.category,

        eventType: (activeTab === "public" ? "public" : "private") as
          | "public"
          | "private",

        eventDate: toISODateTime(localFormData.date, localFormData.time),
        eventTime: localFormData.time,

        location: localFormData.location,
        address: localFormData.address,
        city: localFormData.city,
        country: localFormData.country,
        venue: localFormData.venue,
        latitude: localFormData.latitude,
        longitude: localFormData.longitude,

        maxCapacity: localFormData.maxOccupancy,
        ageLimit: mapAgeLimit(localFormData.ageRestriction),
        allowance: mapAllowance(localFormData.genderAllowance),

        allowAlcohol: localFormData.alcoholAllowed,
        allowSmokingAreas: localFormData.smokingAllowed,

        description: localFormData.description,

        images: imageFiles,

        tickets: localFormData.tickets.map((t) => ({
          ticketLabel: t.name,
          ticketType: "PAID" as const,
          price: t.price,
          currency: "INR",
          serviceChargePercentage: SERVICE_CHARGE_PERCENT,
          quantityTotal: t.quantityTotal,
        })),
      };

      let response;

      if (draftId) {
        await updateDraft(draftId, payload);
        response = await publishDraft(draftId);
      } else {
        response = await createEvent(payload);
      }

      Toast.show({
        type: "success",
        text1: "Event created successfully 🎉",
      });

      setLocalFormData(initialFormData);
      clearSavedFormData();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to create event",
      });
    }
  };

  const handlePublishEvent = async () => {
    // 1️⃣ Validate form first
    const validationErrors = validateForm(localFormData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors).slice(0, 2);
      const errorText = errorMessages.join("\n");

      Toast.show({
        type: "error",
        text1: "Please fix the errors before publishing",
        text2: errorText,
        visibilityTime: 4000,
      });

      return;
    }

    // 2️⃣ Public event PIN flow (only after validation)
    if (activeTab === "public" && !isPinVerified) {
      try {
        await generatePublicPin();

        Toast.show({
          type: "success",
          text1: "PIN Generated",
          text2: "Verification PIN sent to Tappd Event Management Team",
        });

        setShowPinModal(true);
        setResendTimer(30); // start countdown
        return;
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Failed to generate PIN",
        });
        return;
      }
    }

    try {
      const imageFiles = await Promise.all(
        localFormData.photos.map((uri, index) => uriToFile(uri, index))
      );

      // Validate tickets
      if (localFormData.tickets.length === 0) {
        Toast.show({
          type: "error",
          text1: "At least one ticket is required",
        });
        return;
      }

      // Validate images
      if (localFormData.photos.length === 0) {
        Toast.show({
          type: "error",
          text1: "At least one event photo is required",
        });
        return;
      }

      const payload = {
        eventName: localFormData.name,
        genre: localFormData.genre,
        category: localFormData.category,

        eventType: (activeTab === "public" ? "public" : "private") as
          | "public"
          | "private",

        eventDate: toISODateTime(localFormData.date, localFormData.time),
        eventTime: localFormData.time,

        location: localFormData.location,
        address: localFormData.address,
        city: localFormData.city,
        country: localFormData.country,
        venue: localFormData.venue,
        latitude: localFormData.latitude,
        longitude: localFormData.longitude,

        maxCapacity: localFormData.maxOccupancy,
        ageLimit: mapAgeLimit(localFormData.ageRestriction),
        allowance: mapAllowance(localFormData.genderAllowance),

        allowAlcohol: localFormData.alcoholAllowed,
        allowSmokingAreas: localFormData.smokingAllowed,

        description: localFormData.description,

        images: imageFiles,

        tickets: localFormData.tickets.map((t) => ({
          ticketLabel: t.name,
          ticketType: "PAID" as const,
          price: t.price,
          currency: "INR",
          serviceChargePercentage: SERVICE_CHARGE_PERCENT,
          quantityTotal: t.quantityTotal,
        })),
      };

      console.log(
        "📤 Event payload:",
        JSON.stringify(
          {
            ...payload,
            images: `${imageFiles.length} image(s)`,
          },
          null,
          2
        )
      );

      const requiredFields = [
        "eventName",
        "genre",
        "category",
        "eventType",
        "eventDate",
        "eventTime",
        "location",
        "address",
        "city",
        "country",
        "venue",
        "maxCapacity",
        "ageLimit",
        "allowance",
        "description",
      ];

      const missingFields = requiredFields.filter((field) => {
        const value = (payload as any)[field];
        return value === undefined || value === null || value === "";
      });

      if (missingFields.length > 0) {
        console.error("❌ Missing required fields:", missingFields);

        Toast.show({
          type: "error",
          text1: "Missing required fields",
          text2: missingFields.join(", "),
        });

        return;
      }

      let response;

      if (draftId) {
        console.log("Updating draft before publish:", draftId);
        await updateDraft(draftId, payload);
        response = await publishDraft(draftId);
      } else {
        response = await createEvent(payload);
      }

      Toast.show({
        type: "success",
        text1: "Event created successfully 🎉",
        text2: `Event ID: ${response?._id || "Generated"}`,
      });

      console.log("Event created:", response);

      setLocalFormData(initialFormData);
      clearSavedFormData();
    } catch (err: any) {
      console.error("Create event error:", err);

      let errorMessage = "Something went wrong";

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      console.error("Error details:", {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
      });

      Toast.show({
        type: "error",
        text1: "Failed to create event",
        text2: errorMessage,
      });
    }
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Enter valid 6 digit PIN",
      });
      return;
    }

    try {
      await verifyPublicPin(pin);

      Toast.show({
        type: "success",
        text1: "PIN verified successfully",
      });

      setIsPinVerified(true);
      setShowPinModal(false);
      setPin("");

      // 🔥 CREATE EVENT AFTER PIN VERIFICATION
      await createEventAfterVerification();

    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Invalid or expired PIN",
      });
    }
  };

  const handlePublishedTabClick = () => {
    navigation.navigate(SCREEN_NAMES.PUBLISHED_EVENTS as never);
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
            <Text style={{ color: Theme.colors.foreground }}>Cancel</Text>
          </Button>
        </View>
      </View>
    </View>
  );

  const EventFormContent = () => (
    <>
      {/* ===================== FORM CONTENT ===================== */}
      <View style={styles.formContentContainer}>
        <View style={styles.formSection}>
          {/* ---------- Event Basics ---------- */}
          <Card style={styles.eventBasicsCard}>
            <CardHeader>
              <CardTitle>Event Basics</CardTitle>
            </CardHeader>

            <CardContent style={styles.eventBasicsContent}>
              {/* Event Name */}
              <View>
                <Text style={styles.label}>Event Name</Text>
                <Input
                  style={styles.field}
                  placeholder="Enter event name"
                  value={localFormData.name}
                  onChangeText={(v) => handleLocalFieldChange("name", v)}
                />
              </View>

              {/* Genre + Category */}
              <View style={styles.grid2Col}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Genre</Text>
                  <TouchableOpacity
                    style={styles.fieldRow}
                    onPress={() => setGenreOpen(true)}
                  >
                    <Text
                      style={
                        localFormData.genre
                          ? styles.fieldText
                          : styles.placeholderText
                      }
                    >
                      {localFormData.genre || "Select genre"}
                    </Text>
                    <ChevronDown
                      size={18}
                      color={Theme.colors.mutedForeground}
                    />
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Category</Text>
                  <TouchableOpacity
                    style={styles.fieldRow}
                    onPress={() => setCategoryOpen(true)}
                  >
                    <Text
                      style={
                        localFormData.category
                          ? styles.fieldText
                          : styles.placeholderText
                      }
                    >
                      {localFormData.category || "Select category"}
                    </Text>
                    <ChevronDown
                      size={18}
                      color={Theme.colors.mutedForeground}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Date + Time */}
              <View style={styles.grid2Col}>
                <View style={{ flex: 1, position: 'relative' }}>
                  <View style={styles.iconLabel}>
                    <Calendar size={16} color={Theme.colors.foreground} />
                    <Text style={styles.label}>Date</Text>
                  </View>
                  {Platform.OS !== "ios" && Platform.OS !== "android" ? (
                    <View style={styles.fieldRow} pointerEvents="auto">
                      <Text
                        style={
                          localFormData.date
                            ? styles.fieldText
                            : styles.placeholderText
                        }
                      >
                        {localFormData.date || "dd-mm-yyyy"}
                      </Text>
                      <Calendar size={18} color={Theme.colors.mutedForeground} />
                      {React.createElement("input", {
                        type: "date",
                        title: "Select Date",
                        value: localFormData.date
                          ? localFormData.date.split("-").reverse().join("-")
                          : "",
                        style: {
                          position: "absolute",
                          opacity: 0.01,
                          width: "100%",
                          height: "100%",
                          top: 0,
                          left: 0,
                          cursor: "pointer",
                          zIndex: 100,
                        },
                        onClick: (e: any) => {
                          try {
                            e.target.showPicker();
                          } catch (err) { }
                        },
                        onChange: (e: any) => {
                          const val = e.target.value;
                          if (val) {
                            const [yyyy, mm, dd] = val.split("-");
                            handleLocalFieldChange("date", `${dd}-${mm}-${yyyy}`);
                          }
                        },
                      })}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.fieldRow}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text
                        style={
                          localFormData.date
                            ? styles.fieldText
                            : styles.placeholderText
                        }
                      >
                        {localFormData.date || "dd-mm-yyyy"}
                      </Text>
                      <Calendar size={18} color={Theme.colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={{ flex: 1, position: 'relative' }}>
                  <View style={styles.iconLabel}>
                    <Clock size={16} color={Theme.colors.foreground} />
                    <Text style={styles.label}>Time</Text>
                  </View>
                  {Platform.OS !== "ios" && Platform.OS !== "android" ? (
                    <View style={styles.fieldRow} pointerEvents="auto">
                      <Text
                        style={
                          localFormData.time
                            ? styles.fieldText
                            : styles.placeholderText
                        }
                      >
                        {localFormData.time || "--:--"}
                      </Text>
                      <Clock size={18} color={Theme.colors.mutedForeground} />
                      {React.createElement("input", {
                        type: "time",
                        title: "Select Time",
                        value: localFormData.time || "",
                        style: {
                          position: "absolute",
                          opacity: 0.01,
                          width: "100%",
                          height: "100%",
                          top: 0,
                          left: 0,
                          cursor: "pointer",
                          zIndex: 100,
                        },
                        onClick: (e: any) => {
                          try {
                            e.target.showPicker();
                          } catch (err) { }
                        },
                        onChange: (e: any) => {
                          handleLocalFieldChange("time", e.target.value);
                        },
                      })}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.fieldRow}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Text
                        style={
                          localFormData.time
                            ? styles.fieldText
                            : styles.placeholderText
                        }
                      >
                        {localFormData.time || "--:--"}
                      </Text>
                      <Clock size={18} color={Theme.colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Location */}
              <View>
                <View style={styles.iconLabel}>
                  <MapPin size={16} color={Theme.colors.foreground} />
                  <Text style={styles.label}>Location</Text>
                </View>
                <TouchableOpacity
                  style={styles.locationSelectButton}
                  onPress={() => setShowLocationPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.locationSelectText,
                      !localFormData.location && styles.locationSelectPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {localFormData.location || "Tap to search and select location"}
                  </Text>
                  <MapPin size={18} color={Theme.colors.primary} />
                </TouchableOpacity>
                {localFormData.location ? (
                  <Text style={styles.locationHelpText}>
                    ✓ Location selected. Address, City, Country, and Venue auto-filled.
                  </Text>
                ) : null}
              </View>

              {/* Address - Editable after location selection */}
              <View>
                <Text style={styles.label}>Address</Text>
                <Input
                  style={styles.field}
                  placeholder="Enter address"
                  value={localFormData.address}
                  onChangeText={(v) => handleLocalFieldChange("address", v)}
                />
                <Text style={styles.fieldHelpText}>
                  Edit for exact details like building name, floor, etc.
                </Text>
              </View>

              {/* City - Auto-filled, read-only */}
              <View>
                <Text style={styles.label}>City</Text>
                <Input
                  style={[styles.field, styles.autoFilledField]}
                  placeholder=""
                  value={localFormData.city}
                  editable={false}
                />
              </View>

              {/* Country - Auto-filled, read-only */}
              <View>
                <Text style={styles.label}>Country</Text>
                <Input
                  style={[styles.field, styles.autoFilledField]}
                  placeholder=""
                  value={localFormData.country}
                  editable={false}
                />
              </View>

              {/* Venue */}
              <View>
                <Text style={styles.label}>Venue</Text>
                <Input
                  style={styles.field}
                  placeholder="Enter venue name"
                  value={localFormData.venue}
                  onChangeText={(v) => handleLocalFieldChange("venue", v)}
                />
              </View>

              {/* Max Occupancy */}
              <View>
                <View style={styles.iconLabel}>
                  <Users size={16} color={Theme.colors.foreground} />
                  <Text style={styles.label}>Max Occupancy</Text>
                </View>
                <Input
                  style={styles.field}
                  placeholder="Enter maximum capacity"
                  keyboardType="numeric"
                  value={
                    localFormData.maxOccupancy
                      ? String(localFormData.maxOccupancy)
                      : ""
                  }
                  onChangeText={(v) =>
                    handleLocalFieldChange("maxOccupancy", Number(v) || 0)
                  }
                />
              </View>
            </CardContent>
          </Card>

          <Card style={styles.restrictionCard}>
            <CardHeader>
              <CardTitle>Restrictions & Permissions</CardTitle>
            </CardHeader>

            <CardContent style={{ gap: 20 }}>
              {/* AGE + GENDER */}
              <View style={styles.equalRow}>
                {/* Age */}
                <View style={styles.equalCol}>
                  <Text style={styles.label}>Age Restrictions</Text>
                  <TouchableOpacity
                    style={styles.inlineSelect}
                    onPress={() => setAgeOpen(true)}
                  >
                    <Text style={styles.placeholderText}>
                      {localFormData.ageRestriction || "Select age limit"}
                    </Text>
                    <ChevronDown size={18} color="#B9B5D6" />
                  </TouchableOpacity>
                </View>

                {/* Gender */}
                <View style={styles.equalCol}>
                  <Text style={styles.label}>Gender Allowance</Text>
                  <TouchableOpacity
                    style={styles.inlineSelect}
                    onPress={() => setGenderOpen(true)}
                  >
                    <Text style={styles.placeholderText}>
                      {localFormData.genderAllowance || "Select allowance"}
                    </Text>
                    <ChevronDown size={18} color="#B9B5D6" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* DIVIDER */}
              <View style={styles.softDivider} />

              {/* ALCOHOL */}
              <View style={styles.permissionRow}>
                <View>
                  <Text style={styles.permissionTitle}>Alcohol Allowed</Text>
                  <Text style={styles.permissionSub}>
                    Allow alcoholic beverages
                  </Text>
                </View>
                <Switch
                  value={localFormData.alcoholAllowed}
                  onValueChange={(v) =>
                    handleLocalFieldChange("alcoholAllowed", v)
                  }
                  trackColor={{ false: "#2A2444", true: "#7F1AB2" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* SMOKING */}
              <View style={styles.permissionRow}>
                <View>
                  <Text style={styles.permissionTitle}>Smoking Allowed</Text>
                  <Text style={styles.permissionSub}>Allow smoking areas</Text>
                </View>
                <Switch
                  value={localFormData.smokingAllowed}
                  onValueChange={(v) =>
                    handleLocalFieldChange("smokingAllowed", v)
                  }
                  trackColor={{ false: "#2A2444", true: "#7F1AB2" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </CardContent>
          </Card>

          <Card style={styles.ticketCardWrapper}>
            <CardHeader style={styles.ticketHeader}>
              <CardTitle>Availability & Tickets</CardTitle>

              <TouchableOpacity activeOpacity={0.85} onPress={addTicketType}>
                <LinearGradient
                  colors={GRADIENT_COLORS.primary as [string, string]}
                  style={styles.addTicketGradient}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.addTicketText}>Add Ticket</Text>
                </LinearGradient>
              </TouchableOpacity>
            </CardHeader>

            {/* ✅ ONLY SHOW WHEN USER ADDS TICKET */}
            {localFormData.tickets.length > 0 && (
              <CardContent style={styles.cardContentPadding}>
                {localFormData.tickets.map((ticket, index) => {
                  const { serviceCharge, hostReceives } =
                    calculateServiceCharge(ticket.price);

                  return (
                    <View key={ticket.id} style={styles.ticketItemContainer}>
                      <View style={styles.ticketCardNew}>

                        {/* 🔴 HEADER WITH DELETE BUTTON */}
                        <View style={styles.ticketHeaderRowNew}>
                          <Text style={styles.ticketTitleNew}>
                            Ticket Type {index + 1}
                          </Text>

                          {localFormData.tickets.length > 1 && (
                            <TouchableOpacity
                              onPress={() => removeTicket(ticket.id)}
                              style={styles.ticketDeleteButtonNew}
                              activeOpacity={0.8}
                            >
                              <X size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Ticket Name & Price Row */}
                        <View style={styles.ticketRow}>
                          <View style={styles.ticketFieldHalf}>
                            <Text style={styles.ticketLabelNew}>Ticket Name</Text>
                            <Input
                              style={styles.ticketInputNew}
                              value={ticket.name}
                              placeholder="e.g., Standard, Prime, VIP"
                              placeholderTextColor={Theme.colors.mutedForeground}
                              onChangeText={(v) =>
                                handleLocalTicketChange(ticket.id, "name", v)
                              }
                            />
                          </View>

                          <View style={styles.ticketFieldHalf}>
                            <Text style={styles.ticketLabelNew}>Price (₹)</Text>
                            <Input
                              style={styles.ticketInputNew}
                              value={ticket.price > 0 ? String(ticket.price) : ""}
                              placeholder="Enter price"
                              placeholderTextColor={Theme.colors.mutedForeground}
                              keyboardType="numeric"
                              onChangeText={(v) =>
                                handleLocalTicketChange(ticket.id, "price", v)
                              }
                            />
                          </View>
                        </View>

                        {/* Ticket Description */}
                        <View style={styles.ticketFieldFull}>
                          <Text style={styles.ticketLabelNew}>Ticket Description</Text>
                          <Input
                            style={[styles.ticketInputNew, styles.ticketDescriptionInput]}
                            value={ticket.description}
                            placeholder="Briefly describe what this ticket includes..."
                            placeholderTextColor={Theme.colors.mutedForeground}
                            multiline={true}
                            numberOfLines={2}
                            onChangeText={(v) =>
                              handleLocalTicketChange(ticket.id, "description", v)
                            }
                          />
                        </View>

                        {/* Ticket Capacity */}
                        <View style={styles.ticketFieldFull}>
                          <Text style={styles.ticketLabelNew}>Ticket Capacity</Text>
                          <Input
                            style={styles.ticketInputNew}
                            value={ticket.quantityTotal > 0 ? String(ticket.quantityTotal) : ""}
                            placeholder="50"
                            placeholderTextColor={Theme.colors.mutedForeground}
                            keyboardType="numeric"
                            onChangeText={(v) =>
                              handleLocalTicketChange(ticket.id, "quantityTotal", v)
                            }
                          />
                        </View>

                        {/* SERVICE CHARGE BREAKDOWN */}
                        <View style={styles.serviceChargeContainer}>
                          <View style={styles.serviceChargeHeaderNew}>
                            <Info size={16} color="#E879F9" />
                            <Text style={styles.serviceChargeTitleNew}>
                              Service Charge Breakdown
                            </Text>
                          </View>

                          <View style={styles.serviceChargeRowNew}>
                            <Text style={styles.serviceChargeLabelNew}>
                              Ticket Price:
                            </Text>
                            <Text style={styles.serviceChargeValueNew}>
                              ₹{ticket.price || 0}
                            </Text>
                          </View>

                          <View style={styles.serviceChargeRowNew}>
                            <Text style={styles.serviceChargeLabelNew}>
                              TAPPD Service Charge ({SERVICE_CHARGE_PERCENT}%):
                            </Text>
                            <Text style={styles.serviceChargeNegativeNew}>
                              ₹{serviceCharge}
                            </Text>
                          </View>

                          <View style={styles.serviceChargeDividerNew} />

                          <View style={styles.serviceChargeRowNew}>
                            <Text style={styles.serviceChargeNetLabelNew}>
                              You will receive:
                            </Text>
                            <Text style={styles.serviceChargeNetValueNew}>
                              ₹{hostReceives}
                            </Text>
                          </View>
                        </View>

                      </View>
                    </View>
                  );
                })}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>More Event Details</CardTitle>
            </CardHeader>

            <CardContent style={styles.cardContentPadding}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Description</Text>
                <Textarea
                  placeholder="Describe your event in detail..."
                  rows={4}
                  value={localFormData.description}
                  onChangeText={(v) => handleLocalFieldChange("description", v)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Photos (Up to 5)</Text>

                <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                  <Upload
                    size={32}
                    color={Theme.colors.mutedForeground}
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={styles.uploadText}>
                    Click to upload or drag & drop
                  </Text>
                  <Text style={styles.uploadSubText}>
                    PNG, JPG up to 5MB each
                  </Text>
                </TouchableOpacity>
                {/* PHOTO PREVIEW */}
                {localFormData.photos.length > 0 && (
                  <View style={styles.photoPreviewContainer}>
                    {localFormData.photos.map((uri, index) => (
                      <View key={uri} style={styles.photoPreviewItem}>
                        <Image
                          source={{ uri }}
                          style={styles.previewImage}
                        />

                        <TouchableOpacity
                          style={styles.removePhotoButton}
                          onPress={() => removePhoto(index)}
                        >
                          <X size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

              </View>
            </CardContent>
          </Card>
        </View>

        <View style={styles.bottomSpacer} />
      </View>

      {/* ===================== GENRE MODAL ===================== */}
      <Modal transparent visible={genreOpen} animationType="fade">
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setGenreOpen(false)}
        >
          <View style={styles.dropdownBox}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {eventGenres.map((g) => {
                const selected = g === localFormData.genre;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.dropdownItem,
                      selected && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      handleLocalFieldChange("genre", g);
                      setGenreOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{g}</Text>
                    {selected && <CheckCircle2 size={16} color="#FFFFFF" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===================== CATEGORY MODAL ===================== */}
      <Modal transparent visible={categoryOpen} animationType="fade">
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setCategoryOpen(false)}
        >
          <View style={styles.dropdownBox}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {eventCategories.map((c) => {
                const selected = c === localFormData.category;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.dropdownItem,
                      selected && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      handleLocalFieldChange("category", c);
                      setCategoryOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{c}</Text>
                    {selected && <CheckCircle2 size={16} color="#FFFFFF" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal transparent visible={ageOpen} animationType="fade">
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setAgeOpen(false)}
        >
          <View style={styles.dropdownBox}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {ageRestrictions.map((age) => {
                const selected = age === localFormData.ageRestriction;
                return (
                  <TouchableOpacity
                    key={age}
                    style={[
                      styles.dropdownItem,
                      selected && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      handleLocalFieldChange("ageRestriction", age);
                      setAgeOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{age}</Text>
                    {selected && <CheckCircle2 size={16} color="#FFFFFF" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal transparent visible={genderOpen} animationType="fade">
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setGenderOpen(false)}
        >
          <View style={styles.dropdownBox}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {genderOptions.map((g) => {
                const selected = g === localFormData.genderAllowance;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.dropdownItem,
                      selected && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      handleLocalFieldChange("genderAllowance", g);
                      setGenderOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{g}</Text>
                    {selected && <CheckCircle2 size={16} color="#FFFFFF" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
        ticketType: "Premium",
        ticketId: "PRM-023",
        time: "Pending",
        status: "pending",
      },
      {
        id: 4,
        name: "David Kumar",
        email: "d.kumar@email.com",
        ticketType: "Standard",
        ticketId: "STD-078",
        time: "Pending",
        status: "pending",
      },
      {
        id: 5,
        name: "Lisa Anderson",
        email: "lisa.a@email.com",
        ticketType: "VIP",
        ticketId: "VIP-002",
        time: "8:00 PM",
        status: "checked",
      },
      {
        id: 6,
        name: "James Taylor",
        email: "j.taylor@email.com",
        ticketType: "Premium",
        ticketId: "PRM-034",
        time: "Pending",
        status: "pending",
      },
      {
        id: 7,
        name: "Priya Sharma",
        email: "priya.s@email.com",
        ticketType: "VIP",
        ticketId: "VIP-003",
        time: "8:15 PM",
        status: "checked",
      },
      {
        id: 8,
        name: "Robert Martinez",
        email: "r.martinez@email.com",
        ticketType: "Standard",
        ticketId: "STD-089",
        time: "Pending",
        status: "pending",
      },
      {
        id: 9,
        name: "Sophia Lee",
        email: "sophia.l@email.com",
        ticketType: "Premium",
        ticketId: "PRM-056",
        time: "8:30 PM",
        status: "checked",
      },
      {
        id: 10,
        name: "Alex Rodriguez",
        email: "alex.r@email.com",
        ticketType: "Standard",
        ticketId: "STD-112",
        time: "Pending",
        status: "pending",
      },
      {
        id: 11,
        name: "Maya Patel",
        email: "maya.p@email.com",
        ticketType: "VIP",
        ticketId: "VIP-004",
        time: "Pending",
        status: "pending",
      },
      {
        id: 12,
        name: "Daniel Brown",
        email: "d.brown@email.com",
        ticketType: "Premium",
        ticketId: "PRM-067",
        time: "8:45 PM",
        status: "checked",
      },
      {
        id: 13,
        name: "Olivia White",
        email: "olivia.w@email.com",
        ticketType: "Standard",
        ticketId: "STD-123",
        time: "Pending",
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
            Total Guests:{" "}
            <Text style={styles.summaryBold}>{guestList.length}</Text>
          </Text>

          <Text style={styles.summaryText}>
            Checked In:{" "}
            <Text style={[styles.summaryBold, { color: "#22c55e" }]}>
              {guestList.filter((g) => g.status === "checked").length}
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
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

                  {/* Only show time if checked in */}
                  {g.status === "checked" && (
                    <>
                      <Text style={styles.dot}>•</Text>
                      <Text style={[styles.guestMeta, { color: "#4ade80" }]}>
                        {g.time}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {g.status === "checked" ? (
                <UserCheck size={26} color="#4ade80" />
              ) : (
                <TouchableOpacity>
                  <LinearGradient
                    colors={["#D11A87", "#7F1AB2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.checkInButton}
                  >
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
            <Input placeholder="Enter Ticket Number" style={{ flex: 1 }} />

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
            <Text style={[styles.scanStatNumber, { color: "#C84BFF" }]}>
              15
            </Text>
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

  const AnalyticsContent = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 4, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ===== STATS CARDS ===== */}
      <View style={styles.statsCardsRow}>
        <View style={styles.statsCard}>
          <Users size={24} color="#C026D3" style={{ marginBottom: 8 }} />
          <Text style={styles.statsCardNumber}>15</Text>
          <Text style={styles.statsCardLabel}>Booked</Text>
        </View>

        <View style={styles.statsCard}>
          <CheckCircle2 size={24} color="#22c55e" style={{ marginBottom: 8 }} />
          <Text style={styles.statsCardNumber}>7</Text>
          <Text style={styles.statsCardLabel}>Showed Up</Text>
        </View>

        <View style={styles.statsCard}>
          <Clock size={24} color="#facc15" style={{ marginBottom: 8 }} />
          <Text style={styles.statsCardNumber}>8</Text>
          <Text style={styles.statsCardLabel}>Remaining</Text>
        </View>
      </View>

      {/* ===== ATTENDANCE RATE ===== */}
      <View style={styles.analyticsCard}>
        <View style={styles.analyticsHeader}>
          <TrendingUp
            size={18}
            color={Theme.colors.foreground}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.analyticsTitle}>Attendance Rate</Text>
        </View>

        <View style={styles.flexRowSpaceBetweenMb2}>
          <Text style={styles.analyticsLabelSmall}>Current Check-ins</Text>
          <Text style={styles.analyticsValueSmall}>47%</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={["#C026D3", "#DB2777"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: "47%", height: "100%" }}
          />
        </View>
      </View>

      {/* ===== TICKET TYPE BREAKDOWN ===== */}
      <View style={styles.analyticsCard}>
        <Text style={[styles.analyticsTitle, { marginBottom: 16 }]}>
          Ticket Type Breakdown
        </Text>

        {/* VIP */}
        <View style={styles.mb4}>
          <View style={styles.flexRowSpaceBetweenMb2}>
            <Text style={styles.analyticsLabel}>VIP</Text>
            <Text style={styles.analyticsValue}>3 / 5</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={["#C026D3", "#DB2777"]}
              style={{ width: "60%", height: "100%" }}
            />
          </View>
        </View>

        {/* Premium */}
        <View style={styles.mb4}>
          <View style={styles.flexRowSpaceBetweenMb2}>
            <Text style={styles.analyticsLabel}>Premium</Text>
            <Text style={styles.analyticsValue}>3 / 5</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={["#C026D3", "#DB2777"]}
              style={{ width: "60%", height: "100%" }}
            />
          </View>
        </View>

        {/* Standard */}
        <View style={styles.mb4}>
          <View style={styles.flexRowSpaceBetweenMb2}>
            <Text style={styles.analyticsLabel}>Standard</Text>
            <Text style={styles.analyticsValue}>1 / 5</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={["#C026D3", "#DB2777"]}
              style={{ width: "20%", height: "100%" }}
            />
          </View>
        </View>
      </View>

      {/* ===== RECENT CHECK-INS ===== */}
      <View style={styles.analyticsCard}>
        <View style={styles.analyticsHeader}>
          <Eye size={18} color={Theme.colors.foreground} style={{ marginRight: 8 }} />
          <Text style={styles.analyticsTitle}>Recent Check-ins</Text>
        </View>

        {[
          { name: "Ava Garcia", type: "Premium", time: "9:00 PM" },
          { name: "Daniel Brown", type: "Premium", time: "8:45 PM" },
          { name: "Sophia Lee", type: "Premium", time: "8:30 PM" },
          { name: "Priya Sharma", type: "VIP", time: "8:15 PM" },
          { name: "Lisa Anderson", type: "VIP", time: "8:00 PM" },
        ].map((item, index) => (
          <View key={index} style={styles.recentCheckInRow}>
            <View>
              <Text style={styles.checkInName}>{item.name}</Text>
              <Text style={styles.checkInType}>{item.type}</Text>
            </View>
            <Text style={styles.checkInTime}>{item.time}</Text>
          </View>
        ))}
      </View>

      {/* ===== RIDE BOOKING ===== */}
      <View style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <View style={styles.rideIconWrapper}>
            <Car size={18} color="#000000" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.rideTitle}>Need to get to the venue?</Text>
            <Text style={styles.rideSubtitle}>
              Book a ride to manage your event
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.rideButton}>
          <Car size={16} color="#000000" />
          <Text style={styles.rideButtonText}>Book Ride</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );


  // --- MAIN RENDER ---
  return (
    <SafeAreaView
      style={[styles.flex1, { backgroundColor: Theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="light" backgroundColor={Theme.colors.background} />

      <View style={styles.mainContainer}>
        <View style={styles.mainHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIconLeft}
          >
            <ArrowLeft size={22} color={Theme.colors.foreground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(SCREEN_NAMES.DRAFT_EVENTS as never)
            }
            style={styles.draftIconWrapper}
          >
            <FileText size={20} color={Theme.colors.primaryForeground} />
          </TouchableOpacity>

          <Text style={styles.mainHeaderTitle}>Welcome Host</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate(SCREEN_NAMES.MANAGE_EVENTS as never)}
            style={styles.headerIconRight}
          >
            <LayoutDashboard size={22} color={Theme.colors.foreground} />
          </TouchableOpacity>
        </View>
        {/* EVENT CONTROL POPUP */}
        <EventControlPopup
          visible={showEventControlPopup}
          onClose={() => setShowEventControlPopup(false)}
          activeTab={popupActiveTab as "analytics" | "scan" | "guests"}
          onTabChange={(tab) => setPopupActiveTab(tab)}
          AnalyticsContent={AnalyticsContent()}
          ScanContent={ScanContent()}
          GuestsContent={GuestsContent()}
        />

        {/* MENU TABS */}
        <View style={styles.tabMenu}>
          <TouchableOpacity
            onPress={() => {
              if (!editingDraft) {
                setActiveTab("private");
                setShowPublicVerification(false);
              }
            }}

            style={[
              styles.tabButton,
              activeTab === "private" && styles.tabButtonActive,
            ]}
          >
            {activeTab === "private" ? (
              <LinearGradient
                colors={["#D11A87", "#7F1AB2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabButtonGradient}
              >
                <Text style={styles.tabTextActive}>Private Event</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>Private Event</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setActiveTab("public");
              setIsPinVerified(false);
            }}
            style={[
              styles.tabButton,
              activeTab === "public" && styles.tabButtonActive,
            ]}
          >
            <LinearGradient
              colors={
                activeTab === "public"
                  ? ["#D11A87", "#7F1AB2"]
                  : ["transparent", "transparent"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tabButtonGradient}
            >
              <Text
                style={
                  activeTab === "public" ? styles.tabTextActive : styles.tabText
                }
              >
                Public Event
              </Text>

              {isPinVerified && (
                <View style={styles.verifiedBadgeCorner}>
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePublishedTabClick}
            style={styles.tabButton}
          >
            <Text style={styles.tabText}>Published Events</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        {showPublicVerification ? (
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.verificationScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {PublicVerificationForm()}
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.scrollPadding}
            showsVerticalScrollIndicator={false}
          >
            {EventFormContent()}
          </ScrollView>
        )}

        {/* BOTTOM ACTION BAR */}
        {!showPublicVerification && activeTab !== "published" && (
          <View
            style={[
              styles.bottomActionBar,
              { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 },
            ]}
          >
            <View style={styles.bottomActionBarInner}>
              {/* SAVE AS DRAFT */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveDraft}
                style={{ flex: 1 }}
              >
                <View style={styles.draftButton}>
                  <Text style={styles.draftButtonText}>Save as Draft</Text>
                </View>
              </TouchableOpacity>

              {/* PUBLISH EVENT */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePublishEvent}
                disabled={creatingEvent || isDraftLoading}
                style={{ flex: 1, opacity: creatingEvent ? 0.7 : 1 }}
              >
                <LinearGradient
                  colors={GRADIENT_COLORS.primary as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.publishButton}
                >
                  {creatingEvent ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.publishButtonText}>Publish Event</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        themeVariant="dark"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onConfirm={(selectedDate) => {
          console.log("Date confirmed:", selectedDate);
          setShowDatePicker(false);
          const dd = String(selectedDate.getDate()).padStart(2, "0");
          const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
          const yyyy = selectedDate.getFullYear();
          handleLocalFieldChange("date", `${dd}-${mm}-${yyyy}`);
        }}
        onCancel={() => setShowDatePicker(false)}
        modalStyleIOS={{
          backgroundColor: Theme.colors.background,
        }}
        pickerContainerStyleIOS={{
          backgroundColor: Theme.colors.background,
        }}
        customPickerIOSStyle={{
          backgroundColor: Theme.colors.background,
        }}
      />

      {/* Time Picker Modal */}
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        themeVariant="dark"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onConfirm={(selectedTime) => {
          console.log("Time confirmed:", selectedTime);
          setShowTimePicker(false);
          const hh = String(selectedTime.getHours()).padStart(2, "0");
          const mm = String(selectedTime.getMinutes()).padStart(2, "0");
          handleLocalFieldChange("time", `${hh}:${mm}`);
        }}
        onCancel={() => setShowTimePicker(false)}
        modalStyleIOS={{
          backgroundColor: Theme.colors.background,
        }}
        pickerContainerStyleIOS={{
          backgroundColor: Theme.colors.background,
        }}
        customPickerIOSStyle={{
          backgroundColor: Theme.colors.background,
        }}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={(locationData) => {
          setLocalFormData((prev) => ({
            ...prev,
            location: locationData.location,
            address: locationData.address,
            city: locationData.city,
            country: locationData.country || "India",
            venue: locationData.venue,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          }));
          setShowLocationPicker(false);
        }}
        initialLocation={localFormData.location}
      />

      <ComingSoon visible={showComingSoon} onClose={() => setShowComingSoon(false)} />

      <Modal visible={showPinModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <View
            style={{
              backgroundColor: "#1A152E",
              padding: 24,
              borderRadius: 16,
              width: "85%",
              position: "relative",
            }}
          >

            {/* CLOSE BUTTON */}
            <TouchableOpacity
              onPress={() => {
                setShowPinModal(false);
                setPin("");
              }}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                padding: 6,
              }}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Enter Verification PIN
            </Text>

            <Text
              style={{
                color: "#B9B5D6",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              Verification PIN sent to Tappd Event Management Team.
              Enter the PIN to create the public event.
            </Text>

            <Input
              value={pin}
              onChangeText={setPin}
              placeholder="Enter 6 digit PIN"
              keyboardType="numeric"
            />

            {/* VERIFY BUTTON */}
            {/* VERIFY BUTTON */}
            <TouchableOpacity
              onPress={handleVerifyPin}
              style={{
                marginTop: 20,
                backgroundColor: "#C026D3",
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Verify PIN
              </Text>
            </TouchableOpacity>

            {/* RESEND PIN */}
            <TouchableOpacity
              disabled={resendTimer > 0}
              onPress={handleResendPin}
              style={{
                marginTop: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: resendTimer > 0 ? "#777" : "#E879F9",
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                {resendTimer > 0
                  ? `Resend PIN in ${resendTimer}s`
                  : "Resend PIN"}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
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
    backgroundColor: "#2A2344", // same faint circle as screenshot
    padding: 10,
    borderRadius: 30,
  },

  // --- Tab Menu ---
  tabMenu: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    position: "relative",
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderColor: Theme.colors.primary,
  },
  tabButtonGradient: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    position: "relative",

    // 🔑 allow space for badge
    paddingTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  verifiedBadge: {
    backgroundColor: "#22c55e", // Green color for verified badge
    borderColor: "transparent",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 11,
  },

  tabText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  // for date-time dropdown

  dateBoxWrapper: {
    height: 52, // 🔑 SAME HEIGHT
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
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
    height: 52, // 🔑 SAME HEIGHT
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
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
    top: 70, // keep it below the header
    left: 0,
    right: 0,
    bottom: 0, // <-- allow full overlay height so children can size with percentages
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
    height: "94%", // concrete height (adjust if you want taller/shorter)
    width: "92%", // fixed width percent
    overflow: "hidden",
  },

  selectLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
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

  closeButton: {
    padding: 8,
    marginRight: -8,
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
  selectBoxText: {
    height: 52,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.muted,
    paddingHorizontal: 14,
    textAlignVertical: "center",
    color: Theme.colors.foreground,
    fontSize: 14,
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
    backgroundColor: "#30144eff", // darker, deeper purple
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  guestIndexText: {
    color: "#C84BFF", // neon pink-purple from screenshot
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
    backgroundColor: "rgba(34, 197, 94, 0.12)", // light green bg
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.4)", // light green border
  },

  checkedBadgeText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "600",
  },

  pendingBadge: {
    backgroundColor: "rgba(234, 179, 8, 0.12)", // light amber bg
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.4)", // light amber border
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

  // Photo Preview
  photoPreviewContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  photoPreviewItem: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: Theme.colors.destructive,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "white",
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderStyle: "dashed",
    borderRadius: Theme.radius.lg,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.muted,
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadText: {
    color: Theme.colors.foreground,
    fontWeight: "500",
    marginBottom: 4,
  },
  uploadSubText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },

  // --- Verification Form ---
  verificationContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
    minHeight: 400,
  },
  verificationScrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
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
    paddingBottom: 80, // Padding to account for fixed bottom action bar
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

  serviceChargeDetails: {
    gap: 4,
    fontSize: 14,
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

  // --- Fixed Bottom Bar ---
  bottomActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.background,
    borderTopWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
  },

  bottomActionBarInner: {
    flexDirection: "row",
    gap: Theme.spacing.m,
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
    height: 80, // Spacer to account for fixed bottom action bar
  },

  // Stats Cards Styles
  statsCardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statsCardNumber: {
    color: Theme.colors.foreground,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statsCardLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    fontWeight: "500",
  },

  // Analytics Styles
  analyticsCard: {
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  analyticsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  analyticsTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "bold",
  },
  flexRowSpaceBetweenMb2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  analyticsLabelSmall: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },
  analyticsValueSmall: {
    color: Theme.colors.foreground,
    fontSize: 12,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  mb4: {
    marginBottom: 16,
  },
  analyticsLabel: {
    color: Theme.colors.foreground,
    fontSize: 14,
  },
  analyticsValue: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  recentCheckInRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  checkInName: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  checkInType: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  checkInTime: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },
  rideTitle: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "bold",
  },
  rideSubtitle: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  rideCard: {
    backgroundColor: "#0B0B0F",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginTop: 16,
  },

  rideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  rideIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  rideButton: {
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  rideButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "600",
  },


  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  dropdownBox: {
    backgroundColor: Theme.colors.background,
    borderRadius: 18,
    paddingVertical: 6,
    maxHeight: 320,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdownItemSelected: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  dropdownItemText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },

  selectTrigger: {
    height: 52,
    backgroundColor: Theme.colors.inputBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectValue: {
    color: Theme.colors.foreground,
    fontSize: 14,
    flex: 1,
  },

  selectDropdown: {
    backgroundColor: Theme.colors.background,
    borderRadius: 18,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    maxHeight: 260,
  },

  selectItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginVertical: 2,
  },

  selectItemSelected: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  selectItemText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },
  serviceChargeBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(196,81,201,0.35)",
  },

  serviceChargeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  serviceChargeTitle: {
    color: "#E879F9",
    fontSize: 14,
    fontWeight: "600",
  },

  serviceChargeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  serviceChargeLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },

  serviceChargeValue: {
    color: "#FFFFFF",
    fontSize: 13,
  },

  serviceChargeNegative: {
    color: "#F472B6",
    fontSize: 13,
  },

  serviceChargeDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 10,
  },

  serviceChargeNetLabel: {
    color: "#F0ABFC",
    fontSize: 14,
    fontWeight: "600",
  },

  serviceChargeNetValue: {
    color: "#F0ABFC",
    fontSize: 14,
    fontWeight: "700",
  },
  publishGradientButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  publishGradientText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  addTicketGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 999, // pill shape
  },

  addTicketText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  restrictionCard: {
    backgroundColor: "#140E2F",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  equalRow: {
    flexDirection: "row",
    gap: 16,
  },

  equalCol: {
    flex: 1,
  },

  inlineSelect: {
    height: 52,
    backgroundColor: "#221C3D",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  softDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  permissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1E1838",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  permissionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  permissionSub: {
    color: "#B3AFCF",
    fontSize: 12,
    marginTop: 2,
  },
  eventBasicsCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },

  eventBasicsContent: {
    gap: Theme.spacing.l,
  },

  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  field: {
    height: 52,
    backgroundColor: Theme.colors.inputBackground,
    borderRadius: Theme.radius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.m,
  },

  fieldRow: {
    height: 52,
    backgroundColor: Theme.colors.inputBackground,
    borderRadius: Theme.radius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.m,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  fieldText: {
    color: Theme.colors.foreground,
    fontSize: 14,
  },

  placeholderText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  publishButtonWrapper: {
    width: "100%",
  },

  publishButton: {
    height: 52,
    borderRadius: Theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Theme.colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },

  publishButtonText: {
    color: Theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "700",
  },
  draftButton: {
    height: 52,
    borderRadius: Theme.radius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.inputBackground,
  },

  draftButtonText: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },
  tabButtonContent: {
    flexDirection: "row",
    alignItems: "center", // vertical centering
    justifyContent: "center",
    gap: 8,
    height: 24, // 🔑 lock baseline height
  },

  inlineVerifiedBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    height: 18, // 🔑 fixed height
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  inlineVerifiedText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12, // 🔑 text sits dead-center
  },
  tabButtonRelative: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  verifiedBadgeAbsolute: {
    position: "absolute",
    top: -6,
    right: 10,
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    height: 18,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadgeCorner: {
    position: "absolute",
    top: 0,
    right: 0,

    backgroundColor: "#22c55e",
    height: 16,
    paddingHorizontal: 8,
    borderRadius: 999,

    alignItems: "center",
    justifyContent: "center",
  },
  ticketCardWrapper: {
    paddingBottom: 16,
  },
  ticketHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  ticketDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.destructive,
    alignItems: "center",
    justifyContent: "center",
  },

  // Location Picker Styles
  locationSelectButton: {
    height: 52,
    backgroundColor: Theme.colors.inputBackground,
    borderRadius: Theme.radius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.m,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationSelectText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    flex: 1,
  },
  locationSelectPlaceholder: {
    color: Theme.colors.mutedForeground,
  },
  locationHelpText: {
    color: "#22c55e",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
  fieldHelpText: {
    color: Theme.colors.mutedForeground,
    fontSize: 11,
    marginTop: 4,
    fontStyle: "italic",
  },
  autoFilledField: {
    backgroundColor: "rgba(180, 130, 194, 0.1)",
  },

  // New Ticket Styles
  ticketItemContainer: {
    marginBottom: 20,
  },
  ticketCardNew: {
    backgroundColor: "#1A152E",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  ticketHeaderRowNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  ticketTitleNew: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.foreground,
  },
  ticketDeleteButtonNew: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.destructive,
    alignItems: "center",
    justifyContent: "center",
  },
  ticketRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  ticketFieldHalf: {
    flex: 1,
  },
  ticketFieldFull: {
    marginBottom: 16,
  },
  ticketLabelNew: {
    fontSize: 14,
    fontWeight: "500",
    color: Theme.colors.foreground,
    marginBottom: 8,
  },
  ticketInputNew: {
    height: 48,
    backgroundColor: "#252038",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    color: Theme.colors.foreground,
    fontSize: 15,
  },
  ticketDescriptionInput: {
    height: 72,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  serviceChargeContainer: {
    backgroundColor: "rgba(196,81,201,0.12)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(196,81,201,0.3)",
    marginTop: 8,
  },
  serviceChargeHeaderNew: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  serviceChargeTitleNew: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E879F9",
  },
  serviceChargeRowNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  serviceChargeLabelNew: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  serviceChargeValueNew: {
    fontSize: 14,
    color: Theme.colors.foreground,
    fontWeight: "500",
  },
  serviceChargeNegativeNew: {
    fontSize: 14,
    color: Theme.colors.foreground,
    fontWeight: "500",
  },
  serviceChargeDividerNew: {
    height: 1,
    backgroundColor: "rgba(196,81,201,0.3)",
    marginVertical: 12,
  },
  serviceChargeNetLabelNew: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E879F9",
  },
  serviceChargeNetValueNew: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E879F9",
  },
});
