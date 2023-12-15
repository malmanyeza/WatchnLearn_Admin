import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import app from '../firebase';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const SubjectsScreen = () => {
  const [subjects, setSubjects] = useState([]);
    const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const firestore = getFirestore(app);
      const subjectsCollection = collection(firestore, 'subjects');
      const subjectsSnapshot = await getDocs(subjectsCollection);

      const subjectsData = subjectsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSubjects(subjectsData);
    };

    fetchData();
  }, []);

  const handleSubjectPress = (subjectId) => {
    // Navigate to SubjectDetailsScreen with subjectId parameter
    navigation.navigate('SubjectDetails', { subjectId });
  };

  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity
      style={styles.subjectItem}
      onPress={() => handleSubjectPress(item.id)}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={renderSubjectItem}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          // Navigate to the AddSubjectScreen
          navigation.navigate('AddSubject');
        }}
      >
        <Text style={styles.addButtonText}>Add New Subject</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  subjectItem: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SubjectsScreen;
