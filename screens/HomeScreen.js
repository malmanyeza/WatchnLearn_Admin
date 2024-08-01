import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMyContext } from '../hooks/contextAPI';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {

    const { levelState, setLevelState } = useMyContext();
    const navigation = useNavigation();

    const handleButtonPress = (level) => {
        setLevelState(level); // Set levelState to the selected button
        navigation.navigate('Subjects'); // Navigate to SubjectsScreen
    };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => handleButtonPress('Primary')}>
        <Text style={styles.buttonText}>Primary</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.highSchoolButton]} onPress={() => handleButtonPress('High School')}>
        <Text style={styles.buttonText}>High School</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.tertiaryButton]} onPress={() => handleButtonPress('Tertiary')}>
        <Text style={styles.buttonText}>Tertiary</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  highSchoolButton: {
    backgroundColor: '#28a745', // Green color for high school button
  },
  tertiaryButton: {
    backgroundColor: '#ffc107', // Yellow color for tertiary button
  },
});

export default HomeScreen;
