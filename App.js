import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SubjectsScreen from './screens/SubjectsScreen';
import SubjectDetailsScreen from './screens/SubjectDetailsScreen';
import ChaptersScreen from './screens/ChaptersScreen';
import ContentScreen from './screens/ContentScreen';
import ContentDetailsScreen from './screens/ContentDetailsScreen';
import VideoScreen from './screens/VideoScreen';
import HomeScreen from './screens/HomeScreen';
import { FirebaseProvider } from './hooks/firebaseContext';
import { MyContextProvider } from './hooks/contextAPI';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <FirebaseProvider>
      <MyContextProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Subjects" component={SubjectsScreen} />
            <Stack.Screen name="SubjectDetails" component={SubjectDetailsScreen} />
            <Stack.Screen name="Chapters" component={ChaptersScreen} />
            <Stack.Screen name="Content" component={ContentScreen}/>
            <Stack.Screen name="ContentDetails" component={ContentDetailsScreen}/>
            <Stack.Screen name="Video" component={VideoScreen}/>
          </Stack.Navigator>
        </NavigationContainer>
      </MyContextProvider>
    </FirebaseProvider>
  );
}

export default App;