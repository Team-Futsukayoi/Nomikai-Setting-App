import { createContext, useContext, useState } from 'react';
import BeerLoader from '../components/Loading/BeerLoader';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && <BeerLoader />}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);
