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
import { getFirestore, collection, addDoc, setDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import app from '../firebase';
import ActivityIndicatorModal from './ActivityIndicatorModal';
import { useMyContext } from '../hooks/contextAPI';

const AddSubjectModal = ({ isVisible, onClose }) => {
  const { levelState } = useMyContext();
  const [courseName, setCourseName] = useState('');
  const [category, setCategory] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [tutorImageUri, setTutorImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [syllabusDocumentUri, setSyllabusDocumentUri] = useState(null);
  const [syllabusDocumentName, setSyllabusDocumentName] = useState(''); // Added state for syllabus document name
  const [loading, setLoading] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectImageUri, setSubjectImageUri] = useState(null); // Added state for subject image
  const [courseImageUri, setCourseImageUri] = useState(null); // Added state for course image
  const [universityName, setUniversityName] = useState('');

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission needed',
            'Please grant camera roll access to pick an image.'
          );
        }
      }
    })();
  }, []);

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

  const pickCourseImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setCourseImageUri(result.uri);
    }
  };

  const validateInputs = () => {

    if (levelState === 'Tertiary') {
      if (!courseName || !category || !tutorName || !tutorImageUri || !description || !courseImageUri || !syllabusDocumentName ||  !universityName) {
        
        alert('Missing fields', 'Please fill in all fields.');
        return false;
      }
    } else {
      if (!subjectName || !category || !subjectImageUri || !tutorName || !tutorImageUri || !description || !syllabusDocumentUri || !syllabusDocumentName) {
        console.log(subjectName, category, subjectImageUri, tutorName, tutorImageUri, description, syllabusDocumentUri, syllabusDocumentName)
        alert('Missing fields....', 'Please fill in all fields.');
        return false;
      }
    }
    return true;
  };

  const saveSubjectToDatabase = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const storage = getStorage(app);
      const firestore = getFirestore(app);

      // Upload tutor image to Firebase Storage
      const tutorImageFileName = `tutor_images/${tutorName}_${Date.now()}`;
      const tutorImageRef = ref(storage, tutorImageFileName);
      const tutorImageBlob = await fetch(tutorImageUri).then((res) => res.blob());
      await uploadBytes(tutorImageRef, tutorImageBlob);
      const tutorImageUrl = await getDownloadURL(tutorImageRef);

      // Upload subject image to Firebase Storage
      const subjectImageFileName = `subject_images/${subjectName}_${Date.now()}`;
      const subjectImageRef = ref(storage, subjectImageFileName);
      const subjectImageBlob = await fetch(subjectImageUri).then((res) => res.blob());
      await uploadBytes(subjectImageRef, subjectImageBlob);
      const subjectImageUrl = await getDownloadURL(subjectImageRef);

      // Upload course image to Firebase Storage
      const courseImageFileName = `course_images/${courseName}_${Date.now()}`;
      const courseImageRef = ref(storage, courseImageFileName);
      const courseImageBlob = await fetch(courseImageUri).then((res) => res.blob());
      await uploadBytes(courseImageRef, courseImageBlob);
      const courseImageUrl = await getDownloadURL(courseImageRef);

      // Upload syllabus document to Firebase Storage
      const syllabusDocumentFileName = `syllabus_documents/${courseName}_${Date.now()}`;
      const syllabusDocumentRef = ref(storage, syllabusDocumentFileName);
      const syllabusDocumentBlob = await fetch(syllabusDocumentUri).then((res) => res.blob());
      await uploadBytes(syllabusDocumentRef, syllabusDocumentBlob);
      const syllabusDocumentUrl = await getDownloadURL(syllabusDocumentRef);

      // Add course to "courses" collection if level is "Tertiary"
      const collectionName = levelState === 'Tertiary' ? 'courses' : 'subjects';

      // Initialize the document with common fields
      let docData = {
        name: levelState === 'Tertiary' ? courseName : subjectName,
        category,
        tutor: {
          name: tutorName,
          image: tutorImageUrl,
        },
        description,
        syllabus: {
          document: syllabusDocumentUrl,
        },
      };

      // Conditionally add image field based on levelState
      if (levelState === 'Tertiary') {
        docData.courseImage = courseImageUrl;  // Use courseImage for tertiary level
        docData.semester = syllabusDocumentName; // Use semester for tertiary level
        docData.universityName = universityName;
      } else {
        docData.subjectImage = subjectImageUrl; // Use subjectImage for other levels
        docData.syllabus.name = syllabusDocumentName; // Use syllabus.documentName for other levels
        docData.schoolName =  universityName ||''
      }

      // Add the document to Firestore
      const docRef = await addDoc(collection(firestore, collectionName), docData);

      // If level is "Tertiary", create chapters collection for the course
      if (levelState === 'Tertiary') {
        const chaptersCollectionRef = collection(firestore, `courses/${docRef.id}/chapters`);
        await setDoc(chaptersCollectionRef, { /* Initial data for chapters collection */ });
      } else {
        // Add terms to the subject
        // Loop to create and update term documents
        await updateDoc(docRef, { subjectId: docRef.id });

        for (let i = 1; i <= 6; i++) {
          await (async () => {
            const termData = {
              termNumber: i,
              form: i <= 3 ? '5' : '6',
              term: i <= 3 ? `${i}` : `${i - 3}`,
              subjectId: docRef.id,
            };
            const termDocRef = await addDoc(collection(firestore, `subjects/${docRef.id}/terms`), termData);
            await updateDoc(termDocRef, { termId: termDocRef.id });
          })();
        }
      }

      setLoading(false);
      Alert.alert('Success', 'Subject saved successfully!');
      onClose(); // Close the modal after successful save
    } catch (error) {
      setLoading(false);
      console.error('Error saving subject:', error);
      Alert.alert(
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
          <View style={[styles.modalContent, { marginVertical: 0 }]}>
            <Text style={styles.label}>{levelState === 'Tertiary' ? 'Course Name:' : 'Subject Name:'}</Text>
            <TextInput
              style={styles.input}
              value={levelState === 'Tertiary' ? courseName : subjectName}
              onChangeText={(text) => levelState === 'Tertiary' ? setCourseName(text) : setSubjectName(text)}
            />

            <View>
              <Button
                title="Pick an image from gallery"
                onPress={levelState === 'Tertiary' ? pickCourseImage : pickSubjectImage}
                style={styles.pickImageButton}
              />
              {levelState === 'Tertiary' ? courseImageUri && (
                <Image
                  source={{ uri: courseImageUri }}
                  style={styles.image}
                />
              ) : subjectImageUri && (
                <Image
                  source={{ uri: subjectImageUri }}
                  style={styles.image}
                />
              )}
            </View>

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

            <Text style={styles.label}>{levelState === 'Tertiary' ? 'Enter semester' : 'Syllabus Document:'}</Text>
            <TextInput
              style={styles.input}
              value={syllabusDocumentName}
              onChangeText={(text) => setSyllabusDocumentName(text)}
            />

            <Text style={styles.label}>{levelState === 'Tertiary'? 'University':'School (optional)'}</Text>
            <TextInput
              style={styles.input}
              value={universityName}
              onChangeText={(text) => setUniversityName(text)}
            />


            <Button
              title={levelState === 'Tertiary' ? 'Pick Course Outline Document' : 'Pick Syllabus Document'}
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
      <ActivityIndicatorModal visible={loading} title={'Saving subject....'} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: '100%',
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
