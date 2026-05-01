import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, Alert } from "react-native";

// ── Configure foreground notification behavior ────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── Detect Expo Go (push notifications not supported there) ──────────────────
const isExpoGo = Constants.appOwnership === "expo";

export const NotificationService = {

  // ─────────────────────────────────────────────────────────────────────────
  // 🔧 INIT — Call this in App.js useEffect
  // ─────────────────────────────────────────────────────────────────────────
  init: async () => {
    if (isExpoGo) {
      console.warn("⚠️ Push notifications are not supported in Expo Go. Use a development build.");
      return false;
    }

    if (!Device.isDevice) {
      console.warn("⚠️ Push notifications only work on a physical device.");
      return false;
    }

    // ── Android notification channel ──────────────────────────────────────
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("disaster-alerts", {
        name:                 "Disaster Alerts",
        importance:           Notifications.AndroidImportance.MAX,
        vibrationPattern:     [0, 250, 250, 250],
        lightColor:           "#FF231F7C",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound:                "default",
      });

      await Notifications.setNotificationChannelAsync("sos-alerts", {
        name:             "SOS Alerts",
        importance:       Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500],
        lightColor:       "#FF0000",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound:            "default",
      });
    }

    // ── Request permissions ───────────────────────────────────────────────
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Notifications Disabled",
        "Enable notifications in Settings to receive disaster and SOS alerts.",
        [{ text: "OK" }]
      );
      return false;
    }

    console.log("✅ Notification permissions granted.");
    return true;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 📲 GET PUSH TOKEN — for server-side push notifications
  // ─────────────────────────────────────────────────────────────────────────
  getPushToken: async () => {
    if (isExpoGo || !Device.isDevice) return null;

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      console.log("📲 Expo Push Token:", tokenData.data);
      return tokenData.data;
    } catch (error) {
      console.error("❌ Failed to get push token:", error);
      return null;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 🚨 DISASTER ALERT — immediate local notification
  // ─────────────────────────────────────────────────────────────────────────
  triggerDisasterAlert: async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title:    `🚨 ${title}`,
          body:     body,
          data:     { screen: "PredictionAnalytics", ...data },
          sound:    "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === "android" && { channelId: "disaster-alerts" }),
        },
        trigger: null, // immediate
      });
    } catch (error) {
      console.error("❌ Disaster alert error:", error);
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 🆘 SOS ALERT — for incoming SOS from other users
  // ─────────────────────────────────────────────────────────────────────────
  triggerSOSAlert: async (senderName, location, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title:    `🆘 SOS from ${senderName}`,
          body:     `Emergency at ${location}. Tap to view on map.`,
          data:     { screen: "RealTimeMap", ...data },
          sound:    "default",
          priority: Notifications.AndroidNotificationPriority.MAX,
          ...(Platform.OS === "android" && { channelId: "sos-alerts" }),
        },
        trigger: null,
      });
    } catch (error) {
      console.error("❌ SOS alert error:", error);
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ⏰ SCHEDULED ALERT — for weather/flood warnings ahead of time
  // ─────────────────────────────────────────────────────────────────────────
  scheduleAlert: async (title, body, secondsFromNow = 60, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title:    `⚠️ ${title}`,
          body:     body,
          data:     { screen: "PredictionAnalytics", ...data },
          sound:    "default",
          ...(Platform.OS === "android" && { channelId: "disaster-alerts" }),
        },
        trigger: { seconds: secondsFromNow },
      });
      console.log(`⏰ Alert scheduled in ${secondsFromNow}s`);
    } catch (error) {
      console.error("❌ Schedule alert error:", error);
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 🔕 CANCEL ALL — dismiss all pending notifications
  // ─────────────────────────────────────────────────────────────────────────
  cancelAll: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("🔕 All notifications cancelled.");
    } catch (error) {
      console.error("❌ Cancel notifications error:", error);
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 👂 LISTENERS — attach in App.js, detach on unmount
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fires when notification arrives while app is open
   * Usage: const sub = NotificationService.onReceived(n => console.log(n))
   *        sub.remove() // on unmount
   */
  onReceived: (callback) => {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Fires when user taps on a notification
   * Use response.notification.request.content.data.screen to navigate
   */
  onTapped: (callback) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};

export default NotificationService;