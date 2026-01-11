import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  ArrowLeft,
  Star,
  Users,
  Home,
  Search,
  Calendar,
  User,
} from "lucide-react-native";
import Svg, { Line } from "react-native-svg";

/* ---------------- DATA ---------------- */

const EVENTS = [
  {
    title: "Rooftop Jazz Night",
    location: "Sky Lounge",
    registrations: 85,
    earnings: "₹1,02,000",
    rating: "4.7 (42)",
    connections: 78,
    status: "completed",
  },
  {
    title: "Tech Startup Pitch Night",
    location: "Innovation Hub",
    registrations: 142,
    earnings: "₹1,70,400",
    rating: "4.9 (67)",
    connections: 156,
    status: "upcoming",
  },
  {
    title: "Summer Food Festival",
    location: "Central Plaza",
    registrations: 278,
    earnings: "₹3,33,600",
    rating: "4.5 (89)",
    connections: 234,
    status: "ongoing",
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const Y_LABELS = ["₹180k", "₹135k", "₹90k", "₹45k", "₹0k"];

/* ---------------- SCREEN ---------------- */

export default function PublishedEventsScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const contentWidth = isWeb ? Math.min(width, 420) : width;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ alignItems: "center" }}>
        <View style={[styles.phoneFrame, { width: contentWidth }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <ArrowLeft size={22} color="#fff" style={styles.backArrow} />
            <Text style={styles.headerTitle}>Published Events</Text>
          </View>

          <View style={styles.divider} />

          {/* SUMMARY */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.greenText}>₹6,06,000</Text>
              <Text style={styles.subText}>Total Earnings</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.pinkText}>505</Text>
              <Text style={styles.subText}>Total Registrations</Text>
            </View>
          </View>

          {/* SPACE FIX HERE */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>3 events published</Text>
            <Text style={styles.metaText}>Avg. 4.7★ rating</Text>
          </View>

          <View style={styles.divider} />

          {/* GRAPH */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>↗ Earnings Overview</Text>

            <View style={styles.graphRow}>
              <View style={styles.yAxis}>
                {Y_LABELS.map((y) => (
                  <Text key={y} style={styles.axisText}>
                    {y}
                  </Text>
                ))}
              </View>

              <Svg width="100%" height={200}>
                {[0, 45, 90, 135, 180].map((v, i) => (
                  <Line
                    key={i}
                    x1="0"
                    x2="100%"
                    y1={200 - v}
                    y2={200 - v}
                    stroke="#2A2548"
                    strokeDasharray="4 4"
                  />
                ))}

                <Line x1="0" y1="0" x2="0" y2="200" stroke="#9CA3AF" />
                <Line x1="0" y1="200" x2="100%" y2="200" stroke="#9CA3AF" />
              </Svg>
            </View>

            <View style={styles.monthRow}>
              {MONTHS.map((m) => (
                <Text key={m} style={styles.axisText}>
                  {m}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* EVENTS */}
          {EVENTS.map((e, i) => (
            <View key={i} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View>
                  <Text style={styles.eventTitle}>{e.title}</Text>
                  <Text style={styles.eventLocation}>{e.location}</Text>
                </View>
                <View style={[styles.statusBadge, styles[e.status]]}>
                  <Text style={styles.statusText}>{e.status}</Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View>
                  <Text style={styles.metricPink}>{e.registrations}</Text>
                  <Text style={styles.subText}>Registrations</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.metricGreen}>{e.earnings}</Text>
                  <Text style={styles.subText}>Net Earnings</Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <View style={styles.row}>
                  <Star size={16} color="#FBBF24" />
                  <Text style={styles.footerText}>{e.rating}</Text>
                </View>
                <View style={styles.row}>
                  <Users size={16} color="#9CA3AF" />
                  <Text style={styles.footerText}>
                    {e.connections} connections
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <View style={{ height: 140 }} />
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomContent}>
          <BottomTab icon={Home} label="Engage" />
          <BottomTab icon={Search} label="Explore" />
          <BottomTab icon={Users} label="Reconnect" />
          <BottomTab icon={Calendar} label="Host" active />
          <BottomTab icon={User} label="Profile" />
        </View>
      </View>
    </View>
  );
}

/* ---------------- BOTTOM TAB ---------------- */

function BottomTab({ icon: Icon, label, active }: any) {
  return (
    <View style={styles.bottomItem}>
      <View style={[styles.iconWrap, active && styles.activeWrap]}>
        <Icon size={22} color="#fff" />
      </View>
      <Text style={[styles.bottomLabel, active && styles.activeLabel]}>
        {label}
      </Text>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles: any = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0423" },
  phoneFrame: {},

  header: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backArrow: {
    position: "absolute",
    left: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "400",
  },

  divider: {
    height: 1,
    backgroundColor: "#1E1939",
    marginVertical: 16,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#1A1335",
    borderRadius: 18,
    padding: 16,
  },

  greenText: { color: "#4ADE80", fontSize: 22 },
  pinkText: { color: "#D946EF", fontSize: 22 },
  subText: { color: "#9CA3AF", marginTop: 4 },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20, // ✅ spacing fix
  },
  metaText: { color: "#9CA3AF" },

  card: {
    backgroundColor: "#1A1335",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
  },
  cardTitle: { color: "#fff", fontSize: 16, marginBottom: 12 },

  graphRow: { flexDirection: "row" },
  yAxis: { justifyContent: "space-between", paddingRight: 8, height: 200 },
  axisText: { color: "#9CA3AF", fontSize: 12 },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingLeft: 28,
  },

  eventCard: {
    backgroundColor: "#1A1335",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },

  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eventTitle: { color: "#fff", fontSize: 17 },
  eventLocation: { color: "#9CA3AF", marginTop: 4 },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: "#D1D5DB",
    fontSize: 12,
    textTransform: "capitalize",
  },
  completed: { backgroundColor: "rgba(148,163,184,0.18)" },
  upcoming: { backgroundColor: "rgba(59,130,246,0.22)" },
  ongoing: { backgroundColor: "rgba(34,197,94,0.22)" },

  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  metricPink: { color: "#D946EF", fontSize: 26 },
  metricGreen: { color: "#4ADE80", fontSize: 22 },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerText: { color: "#D1D5DB" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#8B1D6B",
    paddingVertical: 10,
  },
  bottomContent: {
    maxWidth: 420,
    alignSelf: "center",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  bottomItem: { alignItems: "center" },
  iconWrap: { padding: 6 },
  activeWrap: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  bottomLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#F1E6F5",
  },
  activeLabel: { color: "#fff" },
});
