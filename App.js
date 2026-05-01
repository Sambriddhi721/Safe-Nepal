import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import NotificationService from "./src/screens/SharedFolder/NotificationService";

export default function App() {
  const navigation = useNavigation();

  useEffect(() => {
    // Init permissions + channels
    NotificationService.init();

    // Get & send push token to your backend
    NotificationService.getPushToken().then((token) => {
      if (token) {
        // TODO: POST token to your backend /api/users/push-token
        console.log("Push token:", token);
      }
    });

    // Listen for notifications while app is open
    const receivedSub = NotificationService.onReceived((notification) => {
      console.log("📩 Notification received:", notification);
    });

    // Navigate when user taps notification
    const tappedSub = NotificationService.onTapped((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen) navigation.navigate(screen);
    });

    return () => {
      receivedSub.remove();
      tappedSub.remove();
    };
  }, []);

  return null; 
}