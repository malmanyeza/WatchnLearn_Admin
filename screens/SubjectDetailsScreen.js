import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import app from '../firebase';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const SubjectDetailsScreen = ({ route }) => {

  const navigation = useNavigation();

  const { subjectId } = route.params;
  const [subject, setSubject] = useState(null);
  const [terms, setTerms] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      const firestore = getFirestore(app);
      const subjectDocRef = doc(firestore, 'subjects', subjectId);
      const subjectDocSnapshot = await getDoc(subjectDocRef);

      if (subjectDocSnapshot.exists()) {
        setSubject({ id: subjectDocSnapshot.id, ...subjectDocSnapshot.data() });
        setNewSubjectName(subjectDocSnapshot.data().name);
        setNewCategory(subjectDocSnapshot.data().category);
      }
    };

    const fetchTerms = async () => {
      const firestore = getFirestore(app);
      const termsCollection = collection(firestore, `subjects/${subjectId}/terms`);
      const termsSnapshot = await getDocs(termsCollection);
      const termsData = termsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort terms by termNumber in ascending order
      termsData.sort((a, b) => a.termNumber - b.termNumber);
      setTerms(termsData);
    };

    fetchSubjectDetails();
    fetchTerms();
  }, [subjectId]);

  const handleUpdateSubjectDetails = async () => {
    try {
      const firestore = getFirestore(app);
      const subjectDocRef = doc(firestore, 'subjects', subjectId);
      await updateDoc(subjectDocRef, {
        name: newSubjectName,
        category: newCategory,
      });
      setSubject({ ...subject, name: newSubjectName, category: newCategory });
      alert('Subject details updated successfully!');
    } catch (error) {
      console.error('Error updating subject details:', error);
      alert('Failed to update subject details. Please try again.');
    }
  };

  const handleTermPress = (termId) => {
    // Navigate to ChaptersScreen with subjectId and termId as route parameters
    navigation.navigate('Chapters', { subjectId, termId });
  };

  const renderTermItem = ({ item }) => (
    <TouchableOpacity
      style={styles.termItem}
      onPress={() => handleTermPress(item.id)}
    >
      <Text>form {item.form} term: {item.term}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {subject && (
        <View>
          <Text style={styles.label}>Subject Name:</Text>
          <TextInput
            style={styles.input}
            value={newSubjectName}
            onChangeText={setNewSubjectName}
          />

          <Text style={styles.label}>Category:</Text>
          <TextInput
            style={styles.input}
            value={newCategory}
            onChangeText={setNewCategory}
          />

          <Button title="Update Subject Details" onPress={handleUpdateSubjectDetails} />

          <Text style={styles.heading}>Terms:</Text>
          <FlatList
            data={terms}
            keyExtractor={(item) => item.id}
            renderItem={renderTermItem}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  termItem: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
});

export default SubjectDetailsScreen;
