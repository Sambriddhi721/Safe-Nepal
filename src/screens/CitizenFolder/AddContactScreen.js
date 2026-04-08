import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { saveNote } from '../../services/dbService';

const AddContactScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!name || !phone) {
      Alert.alert('Missing Info', 'Please provide both a name and a phone number.');
      return;
    }

    try {
      // Saving to SQLite via your dbService
      saveNote(phone, `Name: ${name}`); 
      Alert.alert('Success', 'Emergency contact added successfully!');
      navigation.goBack(); 
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save contact to local database.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#F1F5F9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Contact</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Contact Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Aayam Dawadi"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#94A3B8" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="98XXXXXXXX"
              placeholderTextColor="#64748B"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Emergency Contact</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  flex: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1E293B' 
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F1F5F9' },
  form: { padding: 25 },
  label: { 
    fontSize: 12, 
    color: '#94A3B8', 
    marginBottom: 8, 
    fontWeight: '800', 
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 25,
    paddingHorizontal: 15
  },
  icon: { marginRight: 10 },
  input: { 
    flex: 1, 
    height: 50, 
    color: '#F1F5F9', 
    fontSize: 16 
  },
  saveButton: { 
    backgroundColor: '#3B82F6', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default AddContactScreen;