import { registerRootComponent } from 'expo';
import App from './App';
import { Platform } from 'react-native';

// ✅ Optional: If you plan to add Background Tasks for Risk Monitoring 
// (e.g., fetching SARIMAX data while the app is closed), 
// you would register them here.
// import * as BackgroundFetch from 'expo-background-fetch';
// import * as TaskManager from 'expo-task-manager';

/**
 * registerRootComponent:
 * 1. Calls AppRegistry.registerComponent('main', () => App);
 * 2. Ensures the environment is set up for both Expo Go and Native Builds.
 * 3. Automatically handles the Splash Screen if configured in app.json.
 */

registerRootComponent(App);