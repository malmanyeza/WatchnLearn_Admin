// src/context/ContextTemplate.js
import React, { createContext, useState, useContext } from 'react';

// Create a context
const MyContext = createContext();

// Create a provider component
const MyContextProvider = ({ children }) => {
    const [levelState, setLevelState] = useState('')
    const [selectedCourseId, setSelectedCourseId] = useState('')

    return (
        <MyContext.Provider value={{ 
            levelState, setLevelState,
            setSelectedCourseId, selectedCourseId
         }}>
            {children}
        </MyContext.Provider>
    );
};

// Create a custom hook for easy context consumption
const useMyContext = () => {
    const context = useContext(MyContext);
    if (context === undefined) {
        throw new Error('useMyContext must be used within a MyProvider');
    }
    return context;
};

export { MyContextProvider, useMyContext };
