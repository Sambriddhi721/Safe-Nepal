import AsyncStorage from '@react-native-async-storage/async-storage';

// Prefixes to keep your storage organized
const NOTE_PREFIX = '@customer_note_';
const SETTING_PREFIX = '@app_setting_';

/**
 * =========================
 * CORE SETTINGS LOGIC
 * =========================
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
 * NOTE/CRM LOGIC (For Emergency Contacts)
 * =========================
 */
export const saveNote = async (contactId, note) => {
    try {
        const key = `${NOTE_PREFIX}${contactId}`;
        await AsyncStorage.setItem(key, note);
        console.log('Contact saved to AsyncStorage');
    } catch (error) {
        console.error('Error saving contact:', error);
    }
};

// NEW: Function to get ALL saved contacts for your list
export const getAllNotes = async () => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        // Filter keys that belong to our notes/contacts
        const contactKeys = allKeys.filter(key => key.startsWith(NOTE_PREFIX));
        
        // Get all data for those keys
        const result = await AsyncStorage.multiGet(contactKeys);

        // Map them into an object format the UI expects
        return result.map(([key, value]) => ({
            id: key,
            title: key.replace(NOTE_PREFIX, ''), // The Phone Number
            content: value                       // The "Name: Rahul" string
        }));
    } catch (error) {
        console.error('Error getting all contacts:', error);
        return [];
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
 */
export const getDBConnection = () => null;
export const createTable = () => console.log('Storage engine: AsyncStorage active.');