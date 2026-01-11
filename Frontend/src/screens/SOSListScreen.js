import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";

const API_BASE = "http://10.23.0.48:5000";

export default function SOSListScreen() {
  const { token } = useContext(AuthContext);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSOS();
  }, []);

  const fetchSOS = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/sos/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSosList(res.data);
    } catch (err) {
      console.log("Failed to load SOS", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, action) => {
    try {
      await axios.patch(
        `${API_BASE}/api/sos/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSOS(); // refresh list
    } catch (err) {
      console.log("Failed to update status", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      <Text style={styles.title}>Active SOS Requests</Text>

      <FlatList
        data={sosList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.message}>{item.message}</Text>

            <Text style={styles.location}>
              📍 {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
            </Text>

            <Text style={styles.status}>
              Status: {item.status.toUpperCase()}
            </Text>

            {/* ACTION BUTTONS */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.accept]}
                onPress={() => updateStatus(item.id, "accept")}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.resolve]}
                onPress={() => updateStatus(item.id, "resolve")}
              >
                <Text style={styles.buttonText}>Resolve</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f2027",
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#1b263b",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  message: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 6,
  },

  location: { color: "#aaa" },

  status: {
    marginTop: 6,
    color: "#f5c542",
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  accept: {
    backgroundColor: "#2ecc71",
    marginRight: 8,
  },

  resolve: {
    backgroundColor: "#e67e22",
    marginLeft: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
