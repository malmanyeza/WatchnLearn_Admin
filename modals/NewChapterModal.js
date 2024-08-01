// modals/NewChapterModal.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';
import app from '../firebase';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useMyContext } from '../hooks/contextAPI';

const NewChapterModal = ({ isVisible, onClose, onCreateChapter, subjectId, termId }) => {
  const [newChapterName, setNewChapterName] = useState('');
  const [position, setPosition] = useState('');
  const [week, setWeek] = useState('');
  const { levelState, selectedCourseId } = useMyContext();

  const handleCreateChapter = async () => {
    try {
      const firestore = getFirestore(app);
      let chaptersCollectionPath;

      if (levelState === 'Tertiary' && selectedCourseId) {
        chaptersCollectionPath = `courses/${selectedCourseId}/chapters`;
      } else {
        chaptersCollectionPath = `subjects/${subjectId}/terms/${termId}/chapters`;
      }

      const chapterDocRef = await addDoc(collection(firestore, chaptersCollectionPath), {
        name: newChapterName,
        position,
        week
        // Add any other relevant chapter properties here
      });

      // Notify the parent component about the created chapter
      onCreateChapter({ id: chapterDocRef.id, name: newChapterName });

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error creating chapter:', error);
      // Handle the error appropriately (e.g., show an error message to the user)
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
          <Text>Chapter Name:</Text>
          <TextInput
            style={styles.input}
            value={newChapterName}
            onChangeText={setNewChapterName}
          />

          <Text>Position:</Text>
          <TextInput
            style={styles.input}
            value={position}
            onChangeText={setPosition}
          />

          <Text>Week:</Text>
          <TextInput
            style={styles.input}
            value={week}
            onChangeText={setWeek}
          />

          <Button title="Create Chapter" onPress={handleCreateChapter} />
          <Button title="Cancel" onPress={() => onClose()} />
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default NewChapterModal;
