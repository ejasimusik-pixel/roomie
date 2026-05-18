import React, { createContext, useContext, useState, useEffect } from 'react';
import { AI_MODELS } from '../lib/ai/openrouter';

const AIContext = createContext();

export function AIProvider({ children }) {
  const [activeModel, setActiveModel] = useState(AI_MODELS.FAST.id);
  const [temperature, setTemperature] = useState(0.7);
  const [aiStudioOpen, setAiStudioOpen] = useState(false);
  
  // Persist model in localStorage for dev convenience
  useEffect(() => {
    const saved = localStorage.getItem('roomie_ai_model');
    if (saved) setActiveModel(saved);
  }, []);

  const setModel = (modelId) => {
    setActiveModel(modelId);
    localStorage.setItem('roomie_ai_model', modelId);
  };

  return (
    <AIContext.Provider value={{ 
      activeModel, 
      setModel, 
      temperature, 
      setTemperature,
      aiStudioOpen,
      setAiStudioOpen
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  return useContext(AIContext);
}
