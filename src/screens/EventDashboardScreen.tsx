import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  BarChart3,
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Camera,
  Search,
  Ticket,
  UserPlus,
  UserCheck
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useHostStore } from "../store/hostStore";
import Toast from "react-native-toast-message";

export default function EventDashboardScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Accept event data passed via navigation params, or provide defaults
  const event = (route.params as any)?.event || {
    eventName: "Electro Night Party",
    location: "Club Nexus, Downtown",
    eventDatetime: new Date().toISOString(),
    bookedCount: 0,
    checkedInCount: 0,
  };

  const { guests, fetchGuests, loading, manualScan } = useHostStore();

  const totalBooked = Math.max(event.bookedCount || 0, guests.length);
  const checkedIn = Math.max(event.checkedInCount || 0, guests.filter(g => g.checkedIn).length);
  const pending = Math.max(0, totalBooked - checkedIn);
  const attendancePercent = totalBooked > 0 ? Math.round((checkedIn / totalBooked) * 100) : 0;

  useEffect(() => {
    if (event?.id) {
       fetchGuests(event.id);
    }
  }, [event?.id, fetchGuests]);

  const [activeTab, setActiveTab] = useState<"analytics" | "scan" | "guests">("analytics");
  const [ticketInput, setTicketInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Derived lists
  const filteredGuests = guests.filter(g => 
    (g.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) || 
    (g.email || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    (g.bookingId || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );
  
  const recentCheckins = [...guests].filter(g => g.checkedIn).reverse().slice(0, 3);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const startScanning = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
         alert("Camera permission is required to scan QR codes.");
         return;
      }
    }
    setScannedResult(null);
    setIsScanning(true);
  };

  const handleBarcodeScanned = async ({ type, data }: any) => {
    setIsScanning(false);
    setScannedResult(data);
    setTicketInput(data); 

    const guestMatch = guests.find(g => g.bookingId === data);
    if (guestMatch?.checkedIn) {
       Toast.show({
          type: "error",
          text1: "Already checked in",
          text2: `${guestMatch.name} has already entered.`,
       });
       return;
    }

    try {
      if (event.id) {
        await manualScan(event.id, data);
        Toast.show({
           type: "success",
           text1: "Check-in Successful",
           text2: guestMatch ? `Checked in ${guestMatch.name}` : `Successfully checked in ticket`,
        });
        await fetchGuests(event.id);
        setTicketInput("");
      }
    } catch (e: any) {
      Toast.show({
         type: "error",
         text1: "Ticket not found",
         text2: "The scanned ticket is invalid.",
      });
    }
  };

  const handleManualCheckIn = async (ticketId: string) => {
     if (!ticketId || ticketId.trim() === "") {
        Toast.show({
           type: "error",
           text1: "Please enter a ticket number",
        });
        return;
     }

     const guestMatch = guests.find(g => g.bookingId === ticketId);
     if (guestMatch?.checkedIn) {
        Toast.show({
           type: "error",
           text1: "Already checked in",
           text2: `${guestMatch.name} has already entered.`,
        });
        return;
     }

     try {
       if (event.id) {
         await manualScan(event.id, ticketId);
         Toast.show({
            type: "success",
            text1: "Check-in Successful",
            text2: guestMatch ? `Checked in ${guestMatch.name}` : `Successfully checked in ticket`,
         });
         await fetchGuests(event.id);
         setTicketInput("");
       }
     } catch(e: any) {
        Toast.show({
           type: "error",
           text1: "Ticket not found",
           text2: "The entered ticket is invalid.",
        });
     }
  };

  const formatEventDate = (datetimeString: string) => {
    try {
      const date = new Date(datetimeString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Mar 5";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0714" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{event.eventName}</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
          
          <View style={styles.subtitleRow}>
            <Calendar size={14} color="#B482C2" />
            <Text style={styles.subtitleText}>{formatEventDate(event.eventDatetime)}</Text>
            <Text style={styles.separator}>•</Text>
            <MapPin size={14} color="#B482C2" />
            <Text style={styles.subtitleText} numberOfLines={1}>{event.location || 'Location TBD'}</Text>
          </View>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        {/* Analytics Tab */}
        <TouchableOpacity 
          style={styles.tabWrapper}
          onPress={() => setActiveTab("analytics")}
          activeOpacity={0.8}
        >
          {activeTab === "analytics" ? (
            <LinearGradient
              colors={["#C84BFF", "#D946EF"]}
              style={styles.activeTabBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <BarChart3 size={18} color="#FFFFFF" />
              <Text style={styles.activeTabText}>Analytics</Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveTab}>
              <BarChart3 size={18} color="#FFFFFF" />
              <Text style={styles.inactiveTabText}>Analytics</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Scan Tab */}
        <TouchableOpacity 
          style={styles.tabWrapper}
          onPress={() => setActiveTab("scan")}
          activeOpacity={0.8}
        >
          {activeTab === "scan" ? (
             <LinearGradient
             colors={["#C84BFF", "#D946EF"]}
             style={styles.activeTabBackground}
             start={{ x: 0, y: 0 }}
             end={{ x: 1, y: 0 }}
           >
             <QrCode size={18} color="#FFFFFF" />
             <Text style={styles.activeTabText}>Scan</Text>
           </LinearGradient>
          ) : (
            <View style={styles.inactiveTab}>
              <QrCode size={18} color="#FFFFFF" />
              <Text style={styles.inactiveTabText}>Scan</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Guests Tab */}
        <TouchableOpacity 
          style={styles.tabWrapper}
          onPress={() => setActiveTab("guests")}
          activeOpacity={0.8}
        >
          {activeTab === "guests" ? (
             <LinearGradient
             colors={["#C84BFF", "#D946EF"]}
             style={styles.activeTabBackground}
             start={{ x: 0, y: 0 }}
             end={{ x: 1, y: 0 }}
           >
             <Users size={18} color="#FFFFFF" />
             <Text style={styles.activeTabText}>Guests</Text>
           </LinearGradient>
          ) : (
            <View style={styles.inactiveTab}>
              <Users size={18} color="#FFFFFF" />
              <Text style={styles.inactiveTabText}>Guests</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* TAB CONTENT: ANALYTICS */}
      {activeTab === "analytics" && (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* STATS ROW */}
          <View style={styles.statsRow}>
            {/* Total Booked */}
            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: "rgba(59, 130, 246, 0.2)" }]}>
                <Users size={24} color="#3B82F6" />
              </View>
              <Text style={styles.statNumber}>{totalBooked}</Text>
              <Text style={styles.statLabel}>Total Booked</Text>
            </View>

            {/* Checked In */}
            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: "rgba(16, 185, 129, 0.2)" }]}>
                <CheckCircle2 size={24} color="#10B981" />
              </View>
              <Text style={styles.statNumber}>{checkedIn}</Text>
              <Text style={styles.statLabel}>Checked In</Text>
            </View>

            {/* Pending */}
            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: "rgba(234, 179, 8, 0.2)" }]}>
                <Clock size={24} color="#EAB308" />
              </View>
              <Text style={styles.statNumber}>{pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          {/* ATTENDANCE RATE CARD */}
          <View style={styles.largeCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapperSmall, { backgroundColor: "rgba(217, 70, 239, 0.15)" }]}>
                <TrendingUp size={16} color="#D946EF" />
              </View>
              <Text style={styles.cardTitle}>Attendance Rate</Text>
            </View>

            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Current Check-ins</Text>
              <Text style={styles.progressValue}>{attendancePercent}%</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${attendancePercent}%` }]} />
            </View>

            <View style={styles.progressFooter}>
              <Text style={styles.progressFooterText}>{checkedIn} checked in</Text>
              <Text style={styles.progressFooterText}>{pending} remaining</Text>
            </View>
          </View>

          {/* EVENT STATUS CARD */}
          <View style={styles.statusCard}>
            <View style={styles.statusCardLeft}>
              <Text style={styles.statusLabel}>Event Status</Text>
              <Text style={styles.statusValue}>Live Now</Text>
            </View>
            <View style={styles.statusCardRight}>
              <View style={styles.pulsingDotOutline}>
                <View style={styles.pulsingDotInner} />
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* TAB CONTENT: SCAN */}
      {activeTab === "scan" && isScanning ? (
        <View style={styles.cameraContainer}>
           <CameraView 
             style={StyleSheet.absoluteFillObject}
             facing="back"
             onBarcodeScanned={scannedResult ? undefined : handleBarcodeScanned}
             barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
           >
             <View style={styles.cameraOverlay}>
                <View style={styles.scanTargetBox} />
                <TouchableOpacity 
                   style={styles.cancelScanBtn} 
                   onPress={() => setIsScanning(false)}
                >
                   <Text style={styles.cancelScanBtnText}>Cancel Scan</Text>
                </TouchableOpacity>
             </View>
           </CameraView>
        </View>
      ) : activeTab === "scan" && !isScanning && (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Scanner Box Placeholder */}
          <View style={styles.scanBoxWrapper}>
            <LinearGradient
              colors={["rgba(217, 70, 239, 0.15)", "rgba(217, 70, 239, 0.05)"]}
              style={styles.scanDeviceMock}
            >
              <QrCode size={70} color="#D946EF" />
              <TouchableOpacity activeOpacity={0.8} style={styles.floatingCameraBtn}>
                 <Camera size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <Text style={styles.scanInstruction}>Scan QR code or enter ticket number manually</Text>

          {/* Open Camera Button */}
          <TouchableOpacity activeOpacity={0.8} onPress={startScanning}>
            <LinearGradient
              colors={["#A82EBE", "#7D1380"]}
              style={styles.openCameraBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Camera size={20} color="#FFF" />
              <Text style={styles.openCameraText}>Open Camera to Scan QR Code</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.orDividerRow}>
            <View style={styles.orDividerLine} />
            <Text style={styles.orDividerText}>OR</Text>
            <View style={styles.orDividerLine} />
          </View>

          {/* Manual Input */}
          <View style={styles.manualInputRow}>
            <View style={styles.ticketInputWrapper}>
              <TextInput 
                placeholder="Enter ticket number (e.g., VIP-001)"
                placeholderTextColor="#6B7280"
                style={styles.ticketInputBox}
                value={ticketInput}
                onChangeText={setTicketInput}
              />
            </View>
            <TouchableOpacity style={styles.checkInBtn} onPress={() => handleManualCheckIn(ticketInput)}>
               <Text style={styles.checkInBtnText}>Check In</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Check-ins */}
          <Text style={styles.sectionHeader}>Recent Check-ins</Text>
          
          <View style={styles.checkinList}>
            {recentCheckins.map((item, idx) => (
              <View key={idx} style={styles.checkinListItem}>
                <View style={styles.checkinUserIconWrapper}>
                   <UserCheck size={20} color="#10B981" />
                </View>
                <View style={styles.checkinDetails}>
                  <Text style={styles.checkinName}>{item.name || (item.bookingId ? `Guest ${item.bookingId.slice(-4)}` : "Unknown Guest")}</Text>
                  <Text style={styles.checkinSubtext}>
                    {item.status || "Standard"} • {(item.bookingId || "N/A").slice(-6)}
                    <Text style={{ color: "#10B981" }}>
                      {" • "}
                      {new Date((item as any).checkedInAt || (item as any).updatedAt || new Date()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </Text>
                </View>
              </View>
            ))}
            {recentCheckins.length === 0 && (
              <Text style={{ color: "#8A85A3", textAlign: "center", marginTop: 20 }}>
                No recent check-ins found.
              </Text>
            )}
          </View>
          <View style={{height: 40}} />
        </ScrollView>
      )}

      {/* TAB CONTENT: GUESTS */}
      {activeTab === "guests" && (
        <View style={[styles.scrollContent, { paddingHorizontal: 0 }]}>
           {/* Top Stats */}
           <View style={{ paddingHorizontal: 20 }}>
             <View style={styles.guestsTopStats}>
                <View style={styles.gStatBlock}>
                   <Text style={styles.gStatLabel}>Total Guests</Text>
                   <Text style={styles.gStatValueWhite}>{totalBooked}</Text>
                </View>
                <View style={styles.gStatDivider} />
                <View style={styles.gStatBlock}>
                   <Text style={styles.gStatLabel}>Checked In</Text>
                   <Text style={[styles.gStatValueWhite, { color: "#10B981" }]}>{checkedIn}</Text>
                </View>
                <View style={styles.gStatDivider} />
                <View style={styles.gStatBlock}>
                   <Text style={styles.gStatLabel}>Pending</Text>
                   <Text style={[styles.gStatValueWhite, { color: "#EAB308" }]}>{pending}</Text>
                </View>
             </View>

             {/* Search */}
             <View style={styles.guestSearchRow}>
                <Search size={20} color="#6B7280" />
                <TextInput
                  placeholder="Search guests by name, email or ticket..."
                  placeholderTextColor="#6B7280"
                  style={styles.guestSearchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
             </View>
           </View>

           <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
              {filteredGuests.map((guest, idx) => (
                <View key={idx} style={[
                  styles.guestRowCard, 
                  idx === 0 && { borderColor: 'rgba(16, 185, 129, 0.4)' }
                ]}>
                  {/* Left Avatar circle */}
                  <View style={styles.guestAvatar}>
                     <Text style={styles.guestAvatarText}>#{idx + 1}</Text>
                  </View>

                  {/* Middle Details */}
                  <View style={styles.guestInfo}>
                     <View style={styles.guestNameRow}>
                       <Text style={styles.guestName}>{guest.name || (guest.bookingId ? `Guest ${guest.bookingId.slice(-4)}` : "Unknown Guest")}</Text>
                       {guest.checkedIn ? (
                         <View style={styles.checkedInTag}>
                           <CheckCircle2 size={12} color="#10B981" />
                           <Text style={styles.checkedInTagText}>Checked In</Text>
                         </View>
                       ) : (
                         <View style={styles.pendingTag}>
                           <Text style={styles.pendingTagText}>Pending</Text>
                         </View>
                       )}
                    </View>
                    <Text style={styles.guestEmail}>{guest.email || "No email provided"}</Text>
                    
                    <View style={styles.guestTicketRow}>
                       <Ticket size={12} color="#8A85A3" />
                       <Text style={styles.guestTicketText}>
                         {guest.status || "VIP"} • {(guest.bookingId || "N/A").slice(-6)}
                         {guest.checkedIn && (
                           <Text style={{ color: "#10B981" }}>
                             {" • "}
                             {new Date((guest as any).checkedInAt || (guest as any).updatedAt || new Date()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                           </Text>
                         )}
                       </Text>
                    </View>
                  </View>

                  {/* Right Action */}
                  <View style={styles.guestActionContainer}>
                     {guest.checkedIn ? (
                        <UserCheck size={28} color="#10B981" />
                     ) : (
                        <TouchableOpacity 
                           style={styles.checkInActionBtn}
                           onPress={() => handleManualCheckIn(guest.bookingId)}
                        >
                           <Text style={styles.checkInActionBtnText}>Check In</Text>
                        </TouchableOpacity>
                     )}
                  </View>
                </View>
              ))}
              {loading && <ActivityIndicator size="large" color="#D946EF" style={{ marginTop: 20 }} />}
              {!loading && filteredGuests.length === 0 && (
                <Text style={{ color: "#8A85A3", textAlign: "center", marginTop: 40 }}>
                  No guests found.
                </Text>
              )}
           </ScrollView>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0714",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitleContainer: {
    marginLeft: 16,
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 10,
    flexShrink: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 4,
  },
  liveText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtitleText: {
    color: "#B482C2",
    fontSize: 14,
    marginLeft: 6,
  },
  separator: {
    color: "#5C567A",
    marginHorizontal: 8,
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#161125",
    marginHorizontal: 20,
    borderRadius: 30,
    padding: 6,
  },
  tabWrapper: {
    flex: 1,
  },
  activeTabBackground: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  inactiveTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 8,
  },
  activeTabText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  inactiveTabText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // ANALYTICS STYLES
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#161125",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#8A85A3",
    fontSize: 12,
    fontWeight: "500",
  },
  largeCard: {
    backgroundColor: "#161125",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconWrapperSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  progressLabel: {
    color: "#8A85A3",
    fontSize: 14,
  },
  progressValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#2A2344",
    borderRadius: 5,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#D946EF",
    borderRadius: 5,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressFooterText: {
    color: "#5C567A",
    fontSize: 13,
  },
  statusCard: {
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    marginBottom: 40,
  },
  statusCardLeft: {},
  statusLabel: {
    color: "#8A85A3",
    fontSize: 14,
    marginBottom: 6,
  },
  statusValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  statusCardRight: {},
  pulsingDotOutline: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  pulsingDotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
  },
  
  // SCANNER TAB STYLES
  scanBoxWrapper: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  scanDeviceMock: {
    width: 180,
    height: 180,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "rgba(217, 70, 239, 0.3)",
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  floatingCameraBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 36,
    height: 36,
    backgroundColor: '#D946EF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0B0714',
  },
  scanInstruction: {
    color: "#B482C2",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  openCameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 12,
    gap: 10,
  },
  openCameraText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  orDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  orDividerText: {
    color: "#5C567A",
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  manualInputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  ticketInputWrapper: {
    flex: 1,
    backgroundColor: "#161125",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  ticketInputBox: {
    color: "#FFF",
    fontSize: 15,
    height: 52,
  },
  checkInBtn: {
    backgroundColor: "#9D1BB2",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  checkInBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionHeader: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  checkinList: {
    gap: 12,
  },
  checkinListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161125",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  checkinUserIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  checkinDetails: {
    flex: 1,
  },
  checkinName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  checkinSubtext: {
    color: "#8A85A3",
    fontSize: 14,
  },
  
  // GUESTS TAB STYLES
  guestsTopStats: {
     flexDirection: "row",
     backgroundColor: "#161125",
     borderRadius: 16,
     paddingVertical: 16,
     marginBottom: 20,
     borderWidth: 1,
     borderColor: "rgba(255,255,255,0.05)",
  },
  gStatBlock: {
     flex: 1,
     alignItems: "center",
     justifyContent: "center",
  },
  gStatDivider: {
     width: 1,
     backgroundColor: "rgba(255,255,255,0.08)",
     marginVertical: 4,
  },
  gStatLabel: {
     color: "#8A85A3",
     fontSize: 12,
     marginBottom: 8,
  },
  gStatValueWhite: {
     color: "#FFF",
     fontSize: 22,
     fontWeight: "bold",
  },
  guestSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161125",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 24,
  },
  guestSearchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 15,
    marginLeft: 12,
  },
  guestRowCard: {
    flexDirection: "row",
    backgroundColor: "#161125",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
  },
  guestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  guestAvatarText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  guestInfo: {
    flex: 1,
  },
  guestNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  guestName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  checkedInTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  checkedInTagText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "600",
  },
  pendingTag: {
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.3)",
  },
  pendingTagText: {
    color: "#EAB308",
    fontSize: 11,
    fontWeight: "600",
  },
  guestEmail: {
    color: "#8A85A3",
    fontSize: 14,
    marginBottom: 8,
  },
  guestTicketRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  guestTicketText: {
    color: "#5C567A",
    fontSize: 12,
    fontWeight: "500",
  },
  guestActionContainer: {
    marginLeft: 10,
    justifyContent: "center",
  },
  checkInActionBtn: {
    backgroundColor: "#9D1BB2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkInActionBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  
  // LIVE CAMERA SCANNER STYLES
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTargetBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#D946EF',
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginBottom: 40,
  },
  cancelScanBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cancelScanBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
