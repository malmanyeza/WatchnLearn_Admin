// AddExerciseModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Button,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {FontAwesome} from '@expo/vector-icons'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from '../firebase';

const AddExerciseModal = ({ isVisible, onClose, onUploadExercise }) => {
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exercisePosition, setExercisePosition] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', image: null, answers: [{ text: '', image: null, isCorrect: false }] },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  const handleAddImage = async (index, isQuestion) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const updatedArray = isQuestion
        ? [...questions]
        : [...questions[currentQuestionIndex].answers];
      updatedArray[isQuestion ? currentQuestionIndex : currentAnswerIndex].image = result.uri;
      setQuestions(
        isQuestion
          ? updatedArray
          : questions.map((q, i) =>
              i === currentQuestionIndex
                ? { ...q, answers: updatedArray }
                : q
            )
      );
      setPreviewImage(result.uri)
      setImageModalVisible(true)
    }
  };

  const handleRemoveImage = (index, isQuestion) => {
    const updatedArray = isQuestion
      ? [...questions]
      : [...questions[currentQuestionIndex].answers];
    updatedArray[isQuestion ? currentQuestionIndex : currentAnswerIndex].image = null;
    setQuestions(
      isQuestion
        ? updatedArray
        : questions.map((q, i) =>
            i === currentQuestionIndex
              ? { ...q, answers: updatedArray }
              : q
          )
    );
  };

  const handleNextQuestion = () => {
    setCurrentAnswerIndex(0);
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);

    // Clear the modal for the next question
    setQuestions([
      ...questions,
      {
        questionText: '',
        image: null,
        answers: [{ text: '', image: null, isCorrect: false }],
      },
    ]);
  };

  const handleDeleteQuestion = (index) => {
    setQuestions((prevQuestions) => prevQuestions.filter((_, i) => i !== index));
    setCurrentAnswerIndex(0);

    // Reset the index to the last question if the current question being deleted is the last one
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex >= questions.length - 1 ? prevIndex - 1 : prevIndex
    );
  };

  const handleRemoveAnswerImage = (aIndex) => {
    const updatedArray = [...questions[currentQuestionIndex].answers];
    updatedArray[aIndex].image = null;
    setQuestions(
      questions.map((q, i) =>
        i === currentQuestionIndex ? { ...q, answers: updatedArray } : q
      )
    );
  };

  const generateRandomId = () => {
    return 'xxxxxx'.replace(/[x]/g, function() {
      const random = (Math.random() * 16) | 0;
      return random.toString(16);
    });
  };

  const handleUploadExercise = async () => {
    const storage = getStorage(app);

    const randomId = generateRandomId()

    // Create a function to upload an image to Firebase Storage and return the download URL
    const uploadImageToStorage = async (imageUri, folderName) => {
      const imageRef = ref(storage, `${folderName}/${Date.now()}`);
      const response = await uploadBytes(imageRef, await fetch(imageUri).then((res) => res.blob()));
      return getDownloadURL(response.ref);
    };

    // Check for images in questions and answers and upload them if they exist
    const updatedQuestions = await Promise.all(
      questions.map(async (question) => {
        const questionImage = question.image
          ? await uploadImageToStorage(question.image, 'questions')
          : null;
        const updatedAnswers = await Promise.all(
          question.answers.map(async (answer) => {
            const answerImage = answer.image
              ? await uploadImageToStorage(answer.image, 'answers')
              : null;
            return { ...answer, image: answerImage };
          })
        );
        return { ...question, image: questionImage, answers: updatedAnswers };
      })
    );

    // Use the stored exercise details, questions, and answers
    onUploadExercise({
      contentType:'exercise',
      topicName: exerciseName,
      timeframe:exerciseDuration,
      questions: updatedQuestions,
      position:exercisePosition,
      contentUrl:randomId
    });

    // Close the modal after uploading
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => onClose()}
    >
      <View style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <Text>Exercise Title:</Text>
          <TextInput
            style={styles.input}
            value={exerciseName}
            onChangeText={setExerciseName}
          />

          <Text>Position:</Text>
          <TextInput 
            style={styles.input}
            value={exercisePosition}
            onChangeText={setExercisePosition}
          />

          <Text>Exercise Duration:</Text>
          <TextInput
            style={styles.input}
            value={exerciseDuration}
            onChangeText={setExerciseDuration}
          />

          {questions.map((question, qIndex) => (
            <View key={qIndex}>
              <View style={styles.questionNumberAndDeleteButton}>
                <Text>Question {qIndex + 1}:</Text>
                <TouchableOpacity style={styles.addImageButton} onPress={() => handleDeleteQuestion(qIndex)}>
                  <Text style={{marginRight:5}}>Delete Question</Text>
                  <FontAwesome name='trash-o' size={18} color={'black'} />
                </TouchableOpacity>
              </View>
              <View style={styles.questionContainer}>
              <TextInput
                multiline={true}
                style={styles.questionInput}
                value={question.questionText}
                onChangeText={(text) => {
                  const updatedQuestions = [...questions];
                  updatedQuestions[qIndex].questionText = text;
                  setQuestions(updatedQuestions);
                }}
              />
              <View style={styles.addButtonAndIcon}>
                <TouchableOpacity onPress={() => handleAddImage(qIndex, true)}>
                  {question.image ? (
                    <Image 
                      source={{ uri: question.image }} 
                      style={styles.imageIcon} 
                      resizeMode='contain'
                    />
                  ) : (
                    <Text style={styles.addImageButton}>Add Image</Text>
                  )}
                </TouchableOpacity>

                {question.image ?<TouchableOpacity onPress={() => handleRemoveImage(qIndex, true)}>
                  <Text style={styles.addImageButton}>Remove Image</Text>
                </TouchableOpacity>
                :
                null
                }
              </View>
              </View>

              <Text>Answers: Dont forget to tick the correct answer</Text>
              {question.answers.map((answer, aIndex) => (
                <View key={aIndex} style={styles.answerContainer}>
                  <View style={styles.answerInputContainer}>
                    <TextInput
                      multiline={true}
                      style={styles.answerInput}
                      value={answer.text}
                      onChangeText={(text) => {
                        const updatedArray = [...questions[qIndex].answers];
                        updatedArray[aIndex].text = text;
                        setQuestions(
                          questions.map((q, i) =>
                            i === qIndex
                              ? { ...q, answers: updatedArray }
                              : q
                          )
                        );
                      }}
                    />
                  <View style={styles.addButtonAndIcon}>
                  <TouchableOpacity onPress={() => handleAddImage(aIndex, false)}>
                    {answer.image ? (
                      <Image 
                        source={{ uri: answer.image }} 
                        style={styles.imageIcon}
                        resizeMode='contain'
                      />
                    ) : (
                      <Text style={styles.addImageButton}>Add Image</Text>
                    )}
                  </TouchableOpacity>

                    {answer.image ? <TouchableOpacity onPress={() => handleRemoveAnswerImage(aIndex)}>
                      <Text style={styles.addImageButton}>Remove Image</Text>
                    </TouchableOpacity>
                    : 
                    null}
                  
                  <TouchableOpacity
                    style={styles.correctAnswerButton}
                    onPress={() => {
                      const updatedArray = [...questions[qIndex].answers];
                      updatedArray[aIndex].isCorrect = !answer.isCorrect;
                      setQuestions(
                        questions.map((q, i) =>
                          i === qIndex
                            ? { ...q, answers: updatedArray }
                            : q
                        )
                      );
                    }}
                  >
                    {answer.isCorrect ? (
                        <FontAwesome name="check-circle" size={24} color={'gray'} />
                      ) : (
                        <FontAwesome name="circle-o" size={23} color={'gray'} />
                      )}
                  </TouchableOpacity>
                  </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  setQuestions(
                    questions.map((q, i) =>
                      i === qIndex
                        ? { ...q, answers: [...q.answers, { text: '', image: null, isCorrect: false }] }
                        : q
                    )
                  )
                }
              >
                <Text>Add Answer</Text>
              </TouchableOpacity>

              
            </View>
          ))}

          <View style={styles.buttonsContainer}>
            <Button title="Next" onPress={handleNextQuestion} style={styles.button} />
            <Button title="Upload Exercise" onPress={handleUploadExercise} style={styles.button} />
          </View>

          <Button title="Cancel" onPress={() => onClose()} style={styles.cancelButton} />
        </ScrollView>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={imageModalVisible}
      >
        <View style={styles.previewModal}>
          <Text style={styles.imagePreviewHeader}>Image Preview</Text>
          <Image
              source={{uri: previewImage}}
              style={styles.imagePreview}
              resizeMode='contain'
          />
          <TouchableOpacity 
            style={styles.imagePreviewCloseButton}
            onPress={()=>setImageModalVisible(false)}>
            <Text style={styles.imagePreviewCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    maxHeight: '80%',
  },
  input:{
    height:40,
    paddingHorizontal:10,
    borderRadius:5,
    borderWidth:1,
    borderColor:'gray'
  },
  questionInput: {
    width:'100%',
    minHeight: 50,
    paddingHorizontal: 10,
  },
  answerInput:{
    width:'100%',
    minHeight:50,
    paddingHorizontal: 10,
  },
  answerContainer: {
    borderRadius: 5,
    borderColor:'gray',
    borderWidth:1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  answerInputContainer: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
  },
  imageIcon: {
    width: 50,
    height: 50,
    marginLeft: 10,
  },
  correctAnswerButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctAnswerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'black',
  },
  addButtonAndIcon:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  addImageButton:{
    flexDirection:'row',
    marginLeft:5,
    backgroundColor:'#DDDDDD',
    borderRadius:5,
    padding:5
  },
  addButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#DDDDDD',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'red',
    marginTop: 10,
  },
  questionContainer:{
    borderRadius: 5,
    borderColor:'gray',
    borderWidth:1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent:'space-between',
    paddingRight:5
  },
  imagePreview:{
    width:'80%',
    height:'80%',
    marginBottom:20
  },
  previewModal:{
    flex:1,
    backgroundColor:'white',
    height:'80%',
    width:'80%',
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'center',
    borderRadius:10
  },
  imagePreviewCloseButton:{
    backgroundColor:'blue',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:5,
    width:'100%',
    padding:5,
    marginHorizontal:10
  },
  imagePreviewHeader:{
    fontSize:25,
    fontWeight:'bold'
  },
  imagePreviewCloseButtonText:{
    color:'white',
    fontWeight:'bold'
  },
  questionNumberAndDeleteButton:{
    flexDirection:'row',
    flex:1,
    justifyContent:'space-between',
    marginBottom:10,
    alignItems:'center',
    marginTop:30
  }
});

export default AddExerciseModal;
