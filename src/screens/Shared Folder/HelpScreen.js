import React, { useState, useContext } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  LayoutAnimation, Platform, UIManager, StatusBar 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
  {
    question: "How do I report a flood?",
    answer: "Go to the Home screen and tap 'Report Disaster'. Select 'Flood', add a photo if possible, and submit. Our SARIMAX AI will analyze the risk level immediately."
  },
  {
    question: "What is the SOS button for?",
    answer: "The SOS button sends your precise GPS coordinates to the nearest Police/Responder unit and alerts your emergency contacts."
  },
  {
    question: "Can I use Safe Nepal offline?",
    answer: "You can view previously loaded 'Safety Tips' and 'Emergency Contacts' offline, but reporting and real-time maps require an internet connection."
  },
  {
    question: "How accurate is the prediction?",
    answer: "We use Random Forest and SARIMAX models based on Dept. of Hydrology data. While highly accurate, always follow official government instructions during emergencies."
  }
];

export default function HelpScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>How can we help?</Text>
        
        {/* CONTACT CARDS */}
        <View style={styles.supportRow}>
          <SupportCard 
            icon="chatbubbles-outline" 
            label="Live Chat" 
            color="#3b82f6" 
            bgColor={isDarkMode ? "#0f172a" : "#fff"}
            textColor={colors.text}
          />
          <SupportCard 
            icon="mail-outline" 
            label="Email Us" 
            color="#10b981" 
            bgColor={isDarkMode ? "#0f172a" : "#fff"}
            textColor={colors.text}
          />
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {FAQ_DATA.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            activeOpacity={0.7}
            onPress={() => toggleExpand(index)}
            style={[styles.faqCard, { backgroundColor: isDarkMode ? "#0f172a" : "#fff" }]}
          >
            <View style={styles.questionRow}>
              <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
              <Ionicons 
                name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                size={18} 
                color={colors.subText} 
              />
            </View>
            {expandedIndex === index && (
              <Text style={[styles.answer, { color: colors.subText }]}>{item.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function SupportCard({ icon, label, color, bgColor, textColor }) {
  return (
    <TouchableOpacity style={[styles.sCard, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.sLabel, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 25 },
  supportRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  sCard: { width: "47%", padding: 20, borderRadius: 20, alignItems: "center", elevation: 2 },
  sLabel: { marginTop: 10, fontWeight: "600" },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#64748b", marginBottom: 15, textTransform: "uppercase" },
  faqCard: { padding: 20, borderRadius: 16, marginBottom: 12, elevation: 1 },
  questionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  question: { fontSize: 15, fontWeight: "700", flex: 1, paddingRight: 10 },
  answer: { marginTop: 12, fontSize: 14, lineHeight: 20 }
});