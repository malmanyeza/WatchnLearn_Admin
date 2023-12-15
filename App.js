import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddSubjectScreen from './screens/AddSubjectScreen';
import SubjectsScreen from './screens/SubjectsScreen';
import SubjectDetailsScreen from './screens/SubjectDetailsScreen';
import ChaptersScreen from './screens/ChaptersScreen';
import ContentScreen from './screens/ContentScreen';
import ContentDetailsScreen from './screens/ContentDetailsScreen';
import VideoScreen from './screens/VideoScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Subjects" component={SubjectsScreen} />
        <Stack.Screen name="AddSubject" component={AddSubjectScreen} />
        <Stack.Screen name="SubjectDetails" component={SubjectDetailsScreen} />
        <Stack.Screen name="Chapters" component={ChaptersScreen} />
        <Stack.Screen name="Content" component={ContentScreen}/>
        <Stack.Screen name="ContentDetails" component={ContentDetailsScreen}/>
        <Stack.Screen name="Video" component={VideoScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;