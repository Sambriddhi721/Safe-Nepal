import AsyncStorage from '@react-native-async-storage/async-storage';

// Prefixes to keep your storage organized
const NOTE_PREFIX = '@customer_note_';
const SETTING_PREFIX = '@app_setting_';

/**
 * =========================
 * CORE SETTINGS LOGIC
 * =========================
 * Handles complex data like Booleans (Toggles) and Objects
 */
export const saveSetting = async (key, value) => {
    try {
        const storageKey = `${SETTING_PREFIX}${key}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(value));
        console.log(`Setting [${key}] saved.`);
    } catch (e) {
        console.error("Error saving setting:", e);
    }
};

export const getSetting = async (key, defaultValue) => {
    try {
        const storageKey = `${SETTING_PREFIX}${key}`;
        const value = await AsyncStorage.getItem(storageKey);
        return value !== null ? JSON.parse(value) : defaultValue;
    } catch (e) {
        console.error("Error getting setting:", e);
        return defaultValue;
    }
};

/**
 * =========================
 * NOTE/CRM LOGIC
 * =========================
 * Maintains compatibility with your previous SQLite function names
 */
export const saveNote = async (contactId, note) => {
    try {
        const key = `${NOTE_PREFIX}${contactId}`;
        await AsyncStorage.setItem(key, note);
        console.log('Note saved to local storage');
    } catch (error) {
        console.error('Error saving note:', error);
    }
};

export const getNote = async (contactId) => {
    try {
        const key = `${NOTE_PREFIX}${contactId}`;
        const note = await AsyncStorage.getItem(key);
        return note != null ? note : '';
    } catch (error) {
        console.error('Error getting note:', error);
        return '';
    }
};

/**
 * =========================
 * COMPATIBILITY LAYER
 * =========================
 * Keeps the app from crashing if old SQLite init code is called
 */
export const getDBConnection = () => null;
export const createTable = () => console.log('Storage engine: AsyncStorage active.');