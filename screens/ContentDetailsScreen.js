// ContentDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import app from '../firebase';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const ContentDetailsScreen = ({ route }) => {
  const { subjectId, termId, chapterId, contentId } = route.params;
  const [content, setContent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedPosition, setEditedPosition] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const firestore = getFirestore(app);

    const fetchContentDetails = async () => {
      const contentDocRef = doc(
        firestore,
        `subjects/${subjectId}/terms/${termId}/chapters/${chapterId}/contents`,
        contentId
      );
      const contentDocSnapshot = await getDoc(contentDocRef);

      if (contentDocSnapshot.exists()) {
        const data = contentDocSnapshot.data();
        setContent({ id: contentDocSnapshot.id, ...data });
        setEditedContent(data.topicName); // Assuming 'topicName' is an attribute
        setEditedPosition(data.position.toString()); // Assuming 'position' is an attribute
      }
    };

    fetchContentDetails();
  }, [subjectId, termId, chapterId, contentId]);

  const handleSaveEdits = async () => {
    console.log('Saving edits...');
    try {
      const firestore = getFirestore(app);
      const contentDocRef = doc(
        firestore,
        `subjects/${subjectId}/terms/${termId}/chapters/${chapterId}/contents`,
        contentId
      );

      // Update the content with the edited values
      await updateDoc(contentDocRef, {
        topicName: editedContent,
        position: parseInt(editedPosition), // Convert position to an integer
        // Add more attributes as needed
      });

      console.log('Content edited successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing content:', error);
    }
  };

  const handleViewContent = () => {
    if (content) {
      const { contentType, downloadURL } = content;

      if (contentType === 'video') {
        // Navigate to VideoScreen and pass video URL
        navigation.navigate('Video', { downloadURL });
      } else if (contentType === 'pdf') {
        // Navigate to PdfScreen and pass PDF URL
        navigation.navigate('Pdf', { downloadURL });
      }
      // Add more conditions for other content types as needed
    }
  };

  return (
    <View style={styles.container}>
      {content && (
        <View>
          <Text style={styles.heading}>Content Details</Text>
          <View style={styles.itemContainer}>
            <Text>Topic Name:</Text>
            <TextInput
              style={styles.input}
              value={editedContent}
              onChangeText={(text) => setEditedContent(text)}
            />
          </View>
          <View style={styles.itemContainer}>
            <Text>Position:</Text>
            <TextInput
              style={styles.input}
              value={editedPosition}
              onChangeText={(text) => setEditedPosition(text)}
            />
          </View>
          {/* Display more attributes here */}
          <Button title={'Save Edits'} onPress={handleSaveEdits} />
          <Button title={`View ${content.contentType}`} onPress={handleViewContent} />
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
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginTop:5,
  },
  itemContainer: {
    marginBottom: 20,
    justifyContent:'center'
  },
});

export default ContentDetailsScreen;
