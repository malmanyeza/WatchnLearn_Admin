import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, Picker, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { WebView } from 'react-native-webview';
import app from '../firebase';
import ActivityIndicatorModal from './ActivityIndicatorModal';

const AddContentModal = ({ isVisible, onClose, onCreateContent, chapterId }) => {
  const [topicName, setTopicName] = useState('');
  const [contentType, setContentType] = useState('pdf');
  const [timeframe, setTimeframe] = useState('');
  const [position, setPosition] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: contentType === 'pdf' ? 'application/pdf' : 'video/*',
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
        // Display preview for video and PDF
        if (contentType === 'pdf') {
          setFilePreview(result.assets[0].uri); // For PDF, result.uri may already be a valid URI
        } else if (contentType === 'video') {
          setFilePreview(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  };

  const handleCreateContent = async () => {
    if (!topicName || !timeframe || !position) {
      alert('Please enter all the fields.');
      return;
    }

    try {
      const storage = getStorage(app);

      if (contentType === 'pdf' || contentType === 'video') {
        if (!selectedFile) {
          alert('Please select a file to upload.');
          return;
        }

        setUploading(true);

        const storageRef = ref(storage, `contents/${selectedFile.name}`);
        const blob = await fetch(selectedFile.uri).then((res) => res.blob());

        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Error uploading file:', error);
            setUploading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            onCreateContent({
              topicName,
              contentType,
              timeframe,
              position,
              contentUrl: downloadURL,
              chapterId,
            });

            setSelectedFile(null);
            setFilePreview(null);
            setUploading(false);
            setUploadProgress(0);
            onClose();
          }
        );
      } else {
        onCreateContent({
          topicName,
          contentType,
          timeframe,
          position,
          chapterId,
        });

        onClose();
      }
    } catch (error) {
      console.error('Error creating new content:', error);
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
          <Text>Topic Name:</Text>
          <TextInput style={styles.input} value={topicName} onChangeText={setTopicName} />

          <Text>Content Type:</Text>
          <Picker
            selectedValue={contentType}
            onValueChange={(value) => setContentType(value)}
            style={styles.picker}
          >
            <Picker.Item label="PDF" value="pdf" />
            <Picker.Item label="Video" value="video" />
          </Picker>

          <Text>Timeframe:</Text>
          <TextInput style={styles.input} value={timeframe} onChangeText={setTimeframe} />

          <Text>Position:</Text>
          <TextInput
            style={styles.input}
            value={position}
            onChangeText={setPosition}
            keyboardType="numeric"
          />

          {filePreview && (
            <View style={styles.previewContainer}>
              {contentType === 'pdf' && (
                <WebView style={styles.previewImage} source={{ uri: filePreview }} />
              )}
              {contentType === 'video' && (
                <Text>Video Preview:</Text>
              )}
            </View>
          )}

          {selectedFile && <Text>Selected File: {selectedFile.name}</Text>}
          {(contentType === 'pdf' || contentType === 'video') && (
            <View>
              <Button title={`Pick ${contentType.toUpperCase()}`} onPress={handlePickDocument} />
            </View>
          )}

          {uploading ? (
           
              <ActivityIndicatorModal visible={uploading} title={`Uploading: ${Math.round(uploadProgress)}%`} />
            
          ) : (
            <Button title="Upload Content" onPress={handleCreateContent} />
          )}

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
  picker: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  previewContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  previewImage: {
    width: 200,
    height: 200,
  },
  uploadContainer: {
    marginVertical: 15,
    alignItems: 'center',
  },
});

export default AddContentModal;
