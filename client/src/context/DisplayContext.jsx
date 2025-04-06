import { createContext, useContext, useState } from 'react';

const DisplayContext = createContext();

export const useDisplay = () => useContext(DisplayContext);

export const DisplayProvider = ({ children }) => {
  const initialDisplayCount = 6;
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);

  const resetDisplayCount = () => {
    setDisplayCount(initialDisplayCount);
  };

  return (
    <DisplayContext.Provider value={{ displayCount, setDisplayCount, resetDisplayCount, initialDisplayCount }}>
      {children}
    </DisplayContext.Provider>
  );
};

export default DisplayContext;
