import React, { createContext, useContext, useEffect, useState } from 'react';
import app from '../firebase';


const FirebaseContext = createContext();


export const useFirebase = () => {
  return useContext(FirebaseContext);
};

export const FirebaseProvider = ({ children }) => {
  

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
