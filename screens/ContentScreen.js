import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet, TextInput } from 'react-native';
import { FontAwesome, Entypo, MaterialIcons } from '@expo/vector-icons'; // Import icons from expo vector icons
import AddContentModal from '../modals/AddContentModal';
import AddExerciseModal from '../modals/AddExerciseModal';
import app from '../firebase';
import { getFirestore, doc, getDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import { useMyContext } from '../hooks/contextAPI';

const ContentScreen = ({ route }) => {
  const { subjectId = null, termId = null, chapterId = null } = route.params || {};
  const { levelState, selectedCourseId } = useMyContext();
  const [chapter, setChapter] = useState(null);
  const [contents, setContents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterPosition, setNewChapterPosition] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const firestore = getFirestore(app);

    const fetchChapterDetails = async () => {
      const chapterDocRef = doc(
        firestore,
        levelState === 'Tertiary'
          ? `courses/${selectedCourseId}/chapters`
          : `subjects/${subjectId}/terms/${termId}/chapters`,
        chapterId
      );
      const chapterDocSnapshot = await getDoc(chapterDocRef);

      if (chapterDocSnapshot.exists()) {
        setChapter({ id: chapterDocSnapshot.id, ...chapterDocSnapshot.data() });
      }
    };

    const contentsCollectionPath = levelState === 'Tertiary'
      ? `courses/${selectedCourseId}/chapters/${chapterId}/contents`
      : `subjects/${subjectId}/terms/${termId}/chapters/${chapterId}/contents`;
    
    const contentsCollection = collection(firestore, contentsCollectionPath);

    const unsubscribe = onSnapshot(contentsCollection, (snapshot) => {
      const contentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      contentsData.sort((a, b) => a.position - b.position); // Sort contents by position
      setContents(contentsData);
    });

    fetchChapterDetails();

    return () => unsubscribe();
  }, [subjectId, termId, chapterId, levelState, selectedCourseId]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const toggleExerciseModal = () => {
    setIsExerciseModalVisible(!isExerciseModalVisible);
  };

  const handleCreateContent = async (newContent) => {
    try {
      const firestore = getFirestore(app);
      const contentsCollectionPath = levelState === 'Tertiary'
        ? `courses/${selectedCourseId}/chapters/${chapterId}/contents`
        : `subjects/${subjectId}/terms/${termId}/chapters/${chapterId}/contents`;
  
      const contentsCollection = collection(firestore, contentsCollectionPath);
      const newContentRef = await addDoc(contentsCollection, newContent);
  
      console.log('New Content added with ID:', newContentRef.id);
  
      // Extract digits from timeframe
      const extractDigits = (str) => {
        const match = str.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
  
      const timeframeInMinutes = extractDigits(newContent.timeframe);
  
      // Update totalTime for the subject or course
      const docPath = levelState === 'Tertiary'
        ? `courses/${selectedCourseId}`
        : `subjects/${subjectId}/terms/${termId}`;
  
      const docRef = doc(firestore, docPath);
      const docSnapshot = await getDoc(docRef);
  
      if (docSnapshot.exists()) {
        const currentData = docSnapshot.data();
        const currentTotalTime = currentData.totalTime || 0;
        const newTotalTime = currentTotalTime + timeframeInMinutes;
  
        await updateDoc(docRef, {
          totalTime: newTotalTime,
        });
  
        console.log('Total time updated successfully:', newTotalTime);
      } else {
        console.error('Document does not exist!');
      }
    } catch (error) {
      console.error('Error creating new content:', error);
    }
  
    setIsModalVisible(false);
  };
  
  

  const handleSaveChanges = async () => {
    try {
      if (!chapter) {
        console.error('Chapter not found.');
        return;
      }

      const firestore = getFirestore(app);
      const chapterDocRef = doc(
        firestore,
        levelState === 'Tertiary'
          ? `courses/${selectedCourseId}/chapters`
          : `subjects/${subjectId}/terms/${termId}/chapters`,
        chapterId
      );

      // Update chapter details in Firestore
      await updateDoc(chapterDocRef, {
        name: newChapterName || chapter.name,
        position: newChapterPosition || chapter.position,
      });

      console.log('Chapter details updated successfully');
    } catch (error) {
      console.error('Error updating chapter details:', error);
    }
  };

  const handleUploadExercise = async (exerciseDetails) => {
    try {
      const firestore = getFirestore(app);
      const exercisesCollectionPath = levelState === 'Tertiary'
        ? `courses/${selectedCourseId}/chapters/${chapterId}/contents`
        : `subjects/${subjectId}/terms/${termId}/chapters/${chapterId}/contents`;
  
      const exercisesCollection = collection(firestore, exercisesCollectionPath);
      const exerciseRef = await addDoc(exercisesCollection, exerciseDetails);
  
      console.log('Exercise added with ID:', exerciseRef.id);
  
      // Extract digits from timeframe
      const extractDigits = (str) => {
        const match = str.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
  
      const timeframeInMinutes = extractDigits(exerciseDetails.timeframe);
  
      // Update totalTime for the subject or course
      const docPath = levelState === 'Tertiary' ? `courses/${selectedCourseId}` : `subjects/${subjectId}/terms/${termId}`;
      const docRef = doc(firestore, docPath);
      const docSnapshot = await getDoc(docRef);
  
      if (docSnapshot.exists()) {
        const currentData = docSnapshot.data();
        const currentTotalTime = currentData.totalTime || 0;
        const newTotalTime = currentTotalTime + timeframeInMinutes;
  
        await updateDoc(docRef, {
          totalTime: newTotalTime,
        });
  
        console.log('Total time updated successfully:', newTotalTime);
      } else {
        console.error('Document does not exist!');
      }
    } catch (error) {
      console.error('Error uploading exercise:', error);
    }
  };
  

  const handleContentClick = (contentId) => {
    // Navigate to ContentDetailsScreen with the selected contentId
    navigation.navigate('ContentDetails', {
      subjectId,
      termId,
      chapterId,
      contentId,
    });
  };

  const handleDeleteContent = async (contentId) => {
    try {
      const firestore = getFirestore(app);
      const contentDocRef = doc(
        firestore,
        levelState === 'Tertiary'
          ? `courses/${selectedCourseId}/chapters/${chapterId}/contents`
          : `subjects/${subjectId}/terms/${termId}/chapters/${chapterId}/contents`,
        contentId
      );
  
      // Retrieve contentUrl, contentType, and timeframe from the content item
      const contentDocSnapshot = await getDoc(contentDocRef);
      const contentData = contentDocSnapshot.data();
  
      if (!contentData) {
        console.error('Content not found.');
        return;
      }
  
      const { contentType, contentUrl, timeframe } = contentData;
  
      // Extract digits from timeframe
      const extractDigits = (str) => {
        const match = str.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
  
      const timeframeInMinutes = extractDigits(timeframe);
  
      // Delete the content from Firestore
      await deleteDoc(contentDocRef);
  
      // Delete the corresponding file from Firebase Storage
      const storage = getStorage(app);
  
      if (contentType === 'pdf' || contentType === 'video') {
        const fileRef = ref(storage, contentUrl);
        await deleteObject(fileRef);
      } else if (contentType === 'exercise') {
        // Retrieve the exercise data from Firestore
        const exerciseDocRef = doc(
          firestore,
          levelState === 'Tertiary'
            ? `courses/${selectedCourseId}/chapters/${chapterId}/contents`
            : `subjects/${subjectId}/terms/${termId}/chapters/${chapterId}/contents`,
          contentId
        );
        const exerciseDocSnapshot = await getDoc(exerciseDocRef);
        const exerciseData = exerciseDocSnapshot.data();
  
        // Delete files associated with the exercise questions and answers
        if (exerciseData && exerciseData.questions) {
          for (const questionId of Object.keys(exerciseData.questions)) {
            const question = exerciseData.questions[questionId];
            if (question.image) {
              const questionImageRef = ref(storage, question.image);
              await deleteObject(questionImageRef);
            }
  
            if (question.answers) {
              for (const answerId of Object.keys(question.answers)) {
                const answer = question.answers[answerId];
                if (answer.image) {
                  const answerImageRef = ref(storage, answer.image);
                  await deleteObject(answerImageRef);
                }
              }
            }
          }
        }
      }
  
      // Update totalTime for the subject or course
      const docPath = levelState === 'Tertiary' ? `courses/${selectedCourseId}` : `subjects/${subjectId}/terms/${termId}`;
      const docRef = doc(firestore, docPath);
      const docSnapshot = await getDoc(docRef);
  
      if (docSnapshot.exists()) {
        const currentData = docSnapshot.data();
        const currentTotalTime = currentData.totalTime || 0;
        const newTotalTime = Math.max(0, currentTotalTime - timeframeInMinutes); // Ensure totalTime doesn't go negative
  
        await updateDoc(docRef, {
          totalTime: newTotalTime,
        });
  
        console.log('Total time updated successfully:', newTotalTime);
      } else {
        console.error('Document does not exist!');
      }
  
      console.log('Content and file deleted successfully');
    } catch (error) {
      console.error('Error deleting content and file:', error);
    }
  };
  

  const renderContentItem = ({ item }) => {
    let contentTypeIcon;

    switch (item.contentType) {
      case 'pdf':
        contentTypeIcon = <FontAwesome name="book" size={20} color="green" />;
        break;
      case 'video':
        contentTypeIcon = <Entypo name="controller-play" size={20} color="blue" />;
        break;
      case 'exercise':
        contentTypeIcon = <MaterialIcons name="assignment" size={20} color="orange" />;
        break;
      default:
        contentTypeIcon = null;
    }

    return (
      <TouchableOpacity
        style={styles.contentItem}
        onPress={() => handleContentClick(item.id)}
      >
        <View style={styles.itemContainer}>
          {contentTypeIcon && contentTypeIcon}
          <Text style={styles.itemTitle}>{item.topicName}</Text>
          <TouchableOpacity onPress={() => handleDeleteContent(item.id, item.contentUrl)}>
            <FontAwesome name="trash" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text>Chapter Name:</Text>
      <TextInput
        style={styles.input}
        value={newChapterName || (chapter && chapter.name) || ''}
        onChangeText={(text) => setNewChapterName(text)}
      />

      <Text>Current Chapter Position:</Text>
      <TextInput
        style={styles.input}
        value={newChapterPosition || (chapter && chapter.position) || ''}
        onChangeText={(text) => setNewChapterPosition(text)}
      />

      <Button title="Save Changes" onPress={handleSaveChanges} />
      <Button title="Add New Content" onPress={toggleModal} />
      <Button title="Create an Exercise" onPress={toggleExerciseModal} />
      {chapter && (
        <View>
          <Text style={styles.heading}>Chapter: {chapter.name}</Text>
          <Text style={styles.heading}>Contents:</Text>
          <FlatList
            data={contents}
            keyExtractor={(item) => item.id}
            renderItem={renderContentItem}
          />
        </View>
      )}

      <AddContentModal
        isVisible={isModalVisible}
        onClose={toggleModal}
        onCreateContent={handleCreateContent}
        chapterId={chapterId}
      />
      <AddExerciseModal
        isVisible={isExerciseModalVisible}
        onClose={toggleExerciseModal}
        onUploadExercise={handleUploadExercise}
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
  contentItem: {
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
  itemTitle: {
    flex: 1,
    marginLeft: 8,
  },
  input: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 8,
    marginBottom: 16,
    borderRadius: 5,
  }
});

export default ContentScreen;
