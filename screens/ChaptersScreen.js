import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet } from 'react-native';
import NewChapterModal from '../modals/NewChapterModal';
import { useNavigation } from '@react-navigation/native';
import app from '../firebase';
import { getFirestore, doc, getDoc, getDocs, collection, onSnapshot } from 'firebase/firestore';

const ChaptersScreen = ({ route }) => {
  const { subjectId, termId } = route.params;
  const [term, setTerm] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const firestore = getFirestore(app);
  
    // Fetch term details
    const fetchTermDetails = async () => {
      const termDocRef = doc(firestore, `subjects/${subjectId}/terms`, termId);
      const termDocSnapshot = await getDoc(termDocRef);
  
      if (termDocSnapshot.exists()) {
        setTerm({ id: termDocSnapshot.id, ...termDocSnapshot.data() });
      }
    };
  
    // Fetch chapters and set up real-time listener
    const chaptersCollection = collection(firestore, `subjects/${subjectId}/terms/${termId}/chapters`);
    const unsubscribe = onSnapshot(chaptersCollection, (snapshot) => {
      const chaptersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChapters(chaptersData);
    });
  
    // Fetch term details once at the beginning
    fetchTermDetails();
  
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [subjectId, termId]);
  
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  
  const handleCreateChapter = (newChapterName) => {
    // Implement logic to create a new chapter in your database
    // The real-time listener will automatically update the local state
    console.log('Creating new chapter:', newChapterName);
    // Close the modal
    setIsModalVisible(false);
  };

  const handleChapterPress = (chapter) => {
    // Navigate to ContentScreen with the selected chapter details
    navigation.navigate('Content', {
      subjectId,
      termId,
      chapterId: chapter.id,
    });
  };

  const renderChapterItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chapterItem}
      onPress={() => handleChapterPress(item)}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Button title="Add New Chapter" onPress={toggleModal} />
      {term && (
        <View>
          <Text style={styles.heading}>Term: {term.name}</Text>
          <Text style={styles.heading}>Chapters:</Text>
          <FlatList
            data={chapters}
            keyExtractor={(item) => item.id}
            renderItem={renderChapterItem}
          />
        </View>
      )}

      <NewChapterModal
        isVisible={isModalVisible}
        onClose={toggleModal}
        onCreateChapter={handleCreateChapter}
        subjectId={subjectId}
        termId={termId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  chapterItem: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
});

export default ChaptersScreen;
