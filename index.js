import { registerRootComponent } from 'expo';
import App from './App'; // Ensure App.js exists in the same root folder

/**
 * registerRootComponent:
 * Sets up the environment and registers the root component.
 * This works for Expo Go and standalone native builds.
 */
registerRootComponent(App);