// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD939qUqn4p_9wuFXNuGGObPibVfLvnLLY",
  authDomain: "watchnlearntrial.firebaseapp.com",
  projectId: "watchnlearntrial",
  storageBucket: "watchnlearntrial.appspot.com",
  messagingSenderId: "993508798548",
  appId: "1:993508798548:web:c7a2ca286dd8ec8cce3dc1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;