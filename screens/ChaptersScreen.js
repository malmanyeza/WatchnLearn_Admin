import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome from expo vector icons
import NewChapterModal from '../modals/NewChapterModal';
import { useNavigation } from '@react-navigation/native';
import app from '../firebase';
import { getFirestore, doc, getDoc, collection, onSnapshot, deleteDoc, addDoc } from 'firebase/firestore';
import { useMyContext } from '../hooks/contextAPI';

const ChaptersScreen = ({ route }) => {
  const { subjectId = null, termId = null } = route.params || {};
  const [term, setTerm] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();
  const { levelState, selectedCourseId } = useMyContext();

  useEffect(() => {
    const firestore = getFirestore(app);
    const fetchTermDetails = async () => {
      if (levelState !== 'Tertiary') {
        const termDocRef = doc(firestore, `subjects/${subjectId}/terms`, termId);
        const termDocSnapshot = await getDoc(termDocRef);
        if (termDocSnapshot.exists()) {
          setTerm({ id: termDocSnapshot.id, ...termDocSnapshot.data() });
        }
      }
    };

    const chaptersCollectionPath =
      levelState === 'Tertiary'
        ? `courses/${selectedCourseId}/chapters`
        : `subjects/${subjectId}/terms/${termId}/chapters`;
    const chaptersCollection = collection(firestore, chaptersCollectionPath);

    const unsubscribe = onSnapshot(chaptersCollection, (snapshot) => {
      const chaptersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort chapters by position
      chaptersData.sort((a, b) => a.position - b.position);
      setChapters(chaptersData);
      console.log('Chapters:', chaptersData);
    });

    fetchTermDetails();

    return () => unsubscribe();
  }, [subjectId, termId, levelState, selectedCourseId]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleCreateChapter = async (newChapterName) => {
    try {
      const firestore = getFirestore(app);
      const chaptersCollectionPath =
        levelState === 'Tertiary'
          ? `courses/${selectedCourseId}/chapters`
          : `subjects/${subjectId}/terms/${termId}/chapters`;

      const chaptersCollection = collection(firestore, chaptersCollectionPath);
      const position = chapters.length + 1; // Set position as the next in sequence
      await addDoc(chaptersCollection, { name: newChapterName, position });

      console.log('New Chapter added:', newChapterName);
    } catch (error) {
      console.error('Error creating new chapter:', error);
    }

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
        levelState === 'Tertiary'
          ? `courses/${selectedCourseId}/chapters`
          : `subjects/${subjectId}/terms/${termId}/chapters`,
        chapterId
      );

      await deleteDoc(chapterDocRef);

      console.log('Chapter deleted successfully');
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const renderChapterItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.chapterItem}
      onPress={() => handleChapterPress(item)}
    >
      <View style={styles.itemContainer}>
        <Text>{index + 1}. {item.name}</Text>
        <TouchableOpacity onPress={() => handleDeleteChapter(item.id)}>
          <FontAwesome name="trash" size={20} color="gray" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Button title="Add New Chapter" onPress={toggleModal} />
      {levelState !== 'Tertiary' && term && (
        <Text style={styles.heading}>Term: {term.name}</Text>
      )}
      <Text style={styles.heading}>Chapters:</Text>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id}
        renderItem={renderChapterItem}
      />

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
