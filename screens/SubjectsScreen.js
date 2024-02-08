// SubjectsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome from expo vector icons
import app from '../firebase';
import { getFirestore, collection, onSnapshot, deleteDoc, doc} from 'firebase/firestore';
import {ref, getStorage, deleteObject} from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import AddSubjectModal from '../modals/AddSubjectModal'; // Import your AddSubjectModal component

const SubjectsScreen = () => {
  const [subjects, setSubjects] = useState([]);
  const [isAddSubjectModalVisible, setAddSubjectModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const firestore = getFirestore(app);
    const subjectsCollection = collection(firestore, 'subjects');

    const unsubscribe = onSnapshot(subjectsCollection, (snapshot) => {
      const subjectsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubjects(subjectsData);
    });

    return () => unsubscribe(); // Unsubscribe when the component is unmounted
  }, []);

  const handleSubjectPress = (subjectId) => {
    navigation.navigate('SubjectDetails', { subjectId });
  };

  const handleDeleteSubject = async (subjectId, imageUrl) => {
    try {
      const firestore = getFirestore(app);
      const storage = getStorage(app);
  
      // Extract the image filename from the URL
      const filename = imageUrl.split('/').pop();
  
      // Delete image from Firebase Storage in the "subject_images" folder
      const imageRef = ref(storage, `subject_images/${filename}`);
      await deleteObject(imageRef);
  
      // Delete subject from Firestore
      const subjectDocRef = doc(firestore, 'subjects', subjectId);
      await deleteDoc(subjectDocRef);
  
      console.log('Subject and image deleted successfully');
    } catch (error) {
      console.error('Error deleting subject and image:', error);
    }
  };
  

  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity style={styles.subjectItem} onPress={() => handleSubjectPress(item.id)}>
      <View style={styles.itemContainer}>
        <Text>{item.name}</Text>
        <TouchableOpacity onPress={() => handleDeleteSubject(item.subjectId, item.imageUrl)}>
          <FontAwesome name="trash" size={20} color="black" />
        </TouchableOpacity>
      </View>
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
        onPress={() => setAddSubjectModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add New Subject</Text>
      </TouchableOpacity>

      {/* AddSubjectModal */}
      
        <AddSubjectModal 
          onClose={() => setAddSubjectModalVisible(false)}
          isVisible={isAddSubjectModalVisible} 
        />
      
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
