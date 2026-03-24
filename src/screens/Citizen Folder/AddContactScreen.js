import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Button, Text, Alert } from 'react-native';
// --- UPDATED IMPORT FOR EXPO ---
import { saveNote } from '../../services/dbService';

const AddContactScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Please fill in both name and phone');
      return;
    }

    try {
      // Expo SQLite doesn't need to 'await' the DB connection like the native version
      saveNote(phone, `Name: ${name}`); 
      Alert.alert('Success', 'Contact Saved!');
      navigation.goBack(); // Go back to the list screen
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save contact');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Contact Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Name"
        value={name}
        onChangeText={setName}
      />
      
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      
      <Button title="Save Contact" onPress={handleSave} color="#007AFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20, borderRadius: 5 },
});

export default AddContactScreen;