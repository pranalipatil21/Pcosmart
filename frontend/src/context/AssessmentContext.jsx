import React, { createContext, useContext, useState } from "react";

const AssessmentContext = createContext(null);

export const AssessmentProvider = ({ children }) => {
  const [symptomData, setSymptomData] = useState(null);
  const [simpleFormData, setSimpleFormData] = useState(null);
  const [clinicalFormData, setClinicalFormData] = useState(null);
  const [mlResult, setMlResult] = useState(null);

  const resetAssessment = () => {
    setSymptomData(null);
    setSimpleFormData(null);
    setClinicalFormData(null);
    setMlResult(null);
  };

  return (
    <AssessmentContext.Provider
      value={{
        // symptom test
        symptomData,
        setSymptomData,

        // simple test form
        simpleFormData,
        setSimpleFormData,

        // clinical test form
        clinicalFormData,
        setClinicalFormData,

        // ML output
        mlResult,
        setMlResult,

        // utility
        resetAssessment,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error(
      "useAssessment must be used inside an AssessmentProvider"
    );
  }
  return context;
};
