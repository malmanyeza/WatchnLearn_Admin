import { Platform } from 'react-native';
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
  ScrollView,
} from 'react-native';
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
} from 'firebase/storage';
import { getFirestore, collection, addDoc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import app from '../firebase';
import ActivityIndicatorModal from './ActivityIndicatorModal';

const AddSubjectModal = ({ isVisible, onClose }) => {
  const [subjectName, setSubjectName] = useState('');
  const [category, setCategory] = useState('');
  const [subjectImageUri, setSubjectImageUri] = useState(null);
  const [tutorName, setTutorName] = useState('');
  const [tutorImageUri, setTutorImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [syllabusName, setSyllabusName] = useState('');
  const [syllabusDocumentUri, setSyllabusDocumentUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documentName, setDocumentName] = useState('');

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

  const pickSubjectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setSubjectImageUri(result.uri);
    }
  };

  const pickTutorImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setTutorImageUri(result.uri);
    }
  };

  const pickSyllabusDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: '*/*' });

    if (!result.cancelled) {
      setSyllabusDocumentUri(result.assets[0].uri);
      setDocumentName(result.assets[0].name);
    }
  };

  const saveSubjectToDatabase = async () => {
    if (!subjectName || !category || !subjectImageUri || !tutorName || !tutorImageUri || !description || !syllabusName || !syllabusDocumentUri) {
      alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    
    try {
      setLoading(true);
      const storage = getStorage(app);
      const firestore = getFirestore(app);

      // Upload image to Firebase Storage
      const imageFileName = `subject_images/${subjectName}_${Date.now()}`;
      const storageRef = ref(storage, imageFileName);
      const imageBlob = await fetch(subjectImageUri).then((res) => res.blob());
      await uploadBytes(storageRef, imageBlob);
      const subjectImageUrl = await getDownloadURL(storageRef);

      // Upload tutor image to Firebase Storage
      const tutorImageFileName = `tutor_images/${tutorName}_${Date.now()}`;
      const tutorImageRef = ref(storage, tutorImageFileName);
      const tutorImageBlob = await fetch(tutorImageUri).then((res) => res.blob());
      await uploadBytes(tutorImageRef, tutorImageBlob);
      const tutorImageUrl = await getDownloadURL(tutorImageRef);

       // Upload syllabus document to Firebase Storage
       const syllabusDocumentFileName = `syllabus_documents/${syllabusName}_${Date.now()}`;
       const syllabusDocumentRef = ref(storage, syllabusDocumentFileName);
       const syllabusDocumentBlob = await fetch(syllabusDocumentUri).then((res) => res.blob());
       await uploadBytes(syllabusDocumentRef, syllabusDocumentBlob);
       const syllabusDocumentUrl = await getDownloadURL(syllabusDocumentRef);

      // Add subject to "subjects" collection
      const docRef = await addDoc(collection(firestore, 'subjects'), {
        name: subjectName,
        category,
        subjectImageUrl,
        tutor: {
          name: tutorName,
          image: tutorImageUrl,
        },
        description,
        syllabus: {
          name: syllabusName,
          document: syllabusDocumentUrl,
        },
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
      
      setLoading(false);
      alert('Success', 'Subject saved successfully!');
      onClose(); // Close the modal after successful save
    } catch (error) {
      se
      console.error('Error saving subject:', error);
      alert(
        'Error',
        'Failed to save subject. Please try again.'
      );
      onClose()
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => onClose()}
    >
      <ScrollView>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.label}>Subject Name:</Text>
          <TextInput
            style={styles.input}
            value={subjectName}
            onChangeText={(text) => setSubjectName(text)}
          />

          <Button
            title="Pick an image from gallery"
            onPress={pickSubjectImage}
            style={styles.pickImageButton}
          />
          {subjectImageUri && (
            <Image
              source={{ uri: subjectImageUri }}
              style={styles.image}
            />
          )}

          <Text style={styles.label}>Category:</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={(text) => setCategory(text)}
          />

          <Text style={styles.label}>Tutor Name:</Text>
          <TextInput
            style={styles.input}
            value={tutorName}
            onChangeText={(text) => setTutorName(text)}
          />

         <Button
            title="Pick Tutor Image"
            onPress={pickTutorImage}
            style={styles.pickImageButton}
          />
          {tutorImageUri && (
            <Image
              source={{ uri: tutorImageUri }}
              style={styles.image}
            />
          )}

          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={(text) => setDescription(text)}
          />

          <Text style={styles.label}>Syllabus Name:</Text>
          <TextInput
            style={styles.input}
            value={syllabusName}
            onChangeText={(text) => setSyllabusName(text)}
          />

          <Button
            title="Pick Syllabus Document"
            onPress={pickSyllabusDocument}
            style={styles.pickImageButton}
          />
          {syllabusDocumentUri && (
            <Text style={styles.documentText}>{documentName}</Text>
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
      </ScrollView>
      <ActivityIndicatorModal visible={loading} title="Saving Subject..." />
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
  documentText: {
    fontSize: 16,
    marginBottom: 15,
  },
});

export default AddSubjectModal;
