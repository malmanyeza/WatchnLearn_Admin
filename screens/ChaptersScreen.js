// ChaptersScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome from expo vector icons
import NewChapterModal from '../modals/NewChapterModal';
import { useNavigation } from '@react-navigation/native';
import app from '../firebase';
import { getFirestore, doc, getDoc, getDocs, collection, onSnapshot, deleteDoc } from 'firebase/firestore';

const ChaptersScreen = ({ route }) => {
  const { subjectId, termId } = route.params;
  const [term, setTerm] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const firestore = getFirestore(app);
  
    const fetchTermDetails = async () => {
      const termDocRef = doc(firestore, `subjects/${subjectId}/terms`, termId);
      const termDocSnapshot = await getDoc(termDocRef);
  
      if (termDocSnapshot.exists()) {
        setTerm({ id: termDocSnapshot.id, ...termDocSnapshot.data() });
      }
    };
  
    const chaptersCollection = collection(firestore, `subjects/${subjectId}/terms/${termId}/chapters`);
    const unsubscribe = onSnapshot(chaptersCollection, (snapshot) => {
      const chaptersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChapters(chaptersData);
    });
  
    fetchTermDetails();
  
    return () => unsubscribe();
  }, [subjectId, termId]);
  
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  
  const handleCreateChapter = (newChapterName) => {
    console.log('Creating new chapter:', newChapterName);
    setIsModalVisible(false);
  };

  const handleChapterPress = (chapter) => {
    navigation.navigate('Content', {
      subjectId,
      termId,
      chapterId: chapter.id,
    });
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      const firestore = getFirestore(app);
      const chapterDocRef = doc(
        firestore,
        `subjects/${subjectId}/terms/${termId}/chapters`,
        chapterId
      );

      await deleteDoc(chapterDocRef);

      console.log('Chapter deleted successfully');
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const renderChapterItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chapterItem}
      onPress={() => handleChapterPress(item)}
    >
      <View style={styles.itemContainer}>
        <Text>{item.name}</Text>
        <TouchableOpacity onPress={() => handleDeleteChapter(item.id)}>
          <FontAwesome name="trash" size={20} color="gray" />
        </TouchableOpacity>
      </View>
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ChaptersScreen;
