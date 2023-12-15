import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Alert,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
} from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import app from '../firebase';

const AddSubjectScreen = ({ isVisible, onClose }) => {
  const [subjectName, setSubjectName] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission needed',
            'Please grant camera roll access to pick an image.'
          );
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };

  const saveSubjectToDatabase = async () => {
    try {
      const storage = getStorage(app);
      const firestore = getFirestore(app);

      // Upload image to Firebase Storage
      const imageFileName = `subject_images/${subjectName}_${Date.now()}`;
      const storageRef = ref(storage, imageFileName);
      const imageBlob = await fetch(imageUri).then((res) => res.blob());
      await uploadBytes(storageRef, imageBlob);

      // Get download URL after the upload is complete
      const imageUrl = await getDownloadURL(storageRef);

      // Add subject to "subjects" collection
      const docRef = await addDoc(collection(firestore, 'subjects'), {
        name: subjectName,
        category,
        imageUrl,
      });

      // Add terms to the subject
      await addDoc(collection(firestore, `subjects/${docRef.id}/terms`), {
        termNumber: 1,
        name: 'Form 5 Term 1',
        subjectId: docRef.id,
      });

      await addDoc(collection(firestore, `subjects/${docRef.id}/terms`), {  
        termNumber: 2,
        name: 'Form 5 Term 2',
        subjectId: docRef.id,
      });

      await addDoc(collection(firestore, `subjects/${docRef.id}/terms`), {
        termNumber: 3,
        name: 'Form 5 Term 3',
        subjectId: docRef.id,
      });

      await addDoc(collection(firestore, `subjects/${docRef.id}/terms`), {
        termNumber: 4,
        name: 'Form 6 Term 1',
        subjectId: docRef.id,
      });

      await addDoc(collection(firestore, `subjects/${docRef.id}/terms`), {
        termNumber: 5,
        name: 'Form 6 Term 2',
        subjectId: docRef.id,
      });

      await addDoc(collection(firestore, `subjects/${docRef.id}/terms`), {
        termNumber: 6,
        name: 'Form 6 Term 3',
        subjectId: docRef.id,
      });
      

      Alert.alert('Success', 'Subject saved successfully!');
      onClose(); // Close the modal after successful save
    } catch (error) {
      console.error('Error saving subject:', error);
      Alert.alert(
        'Error',
        'Failed to save subject. Please try again.'
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => onClose()}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.label}>Subject Name:</Text>
          <TextInput
            style={styles.input}
            value={subjectName}
            onChangeText={(text) => setSubjectName(text)}
          />

          <Text style={styles.label}>Category:</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={(text) => setCategory(text)}
          />

          <Button
            title="Pick an image from gallery"
            onPress={pickImage}
            style={styles.pickImageButton}
          />
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
            />
          )}

          <Button
            title="Save Subject"
            onPress={saveSubjectToDatabase}
            style={styles.saveButton}
          />
          <TouchableOpacity
            onPress={() => onClose()}
            style={styles.closeButton}
          >
            <Text style={{ color: 'white' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 20,
  },
  pickImageButton: {
    marginTop: 20,
  },
});

export default AddSubjectScreen;
