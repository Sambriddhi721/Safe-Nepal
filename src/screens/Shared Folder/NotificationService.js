import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";

// Configure how notifications appear when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  /**
   * Initialize Permissions and Android Channels
   * Call this in your App.js useEffect
   */
  init: async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("disaster-alerts", {
        name: "Disaster Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permissions not granted.");
      return false;
    }
    return true;
  },

  /**
   * Trigger the Alert
   */
  triggerDisasterAlert: async (title, body) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚨 ${title}`,
          body: body,
          data: { screen: "PredictionAnalytics" },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error("Notification Trigger Error:", error);
    }
  },
};