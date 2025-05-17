import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  let toastId = null;

  const startLoader = (message = 'Processing...') => {
    if (!isLoading && !toastId) { 
      setIsLoading(true);
      toastId = toast.loading(message, {
        duration: Infinity,
        style: {
          background: '#333',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    }
  };

  const stopLoader = (isSuccess = true, successMessage = 'Completed successfully!', errorMessage = 'Server Down, Try Later') => {
    if (toastId) {
      if (isSuccess) {
        toast.success(successMessage, {
          id: toastId,
          duration: 2000,
          style: {
            background: 'green',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
      } else {
        toast.error(errorMessage, {
          id: toastId,
          duration: 2000,
          style: {
            background: 'red',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        });
      }
      setIsLoading(false);
      toastId = null;
    }
  };


  const invalidPath = (message = 'Invalid path! Please check the URL.') => {
    
    toast.loading(message, {
      duration: 2000,
      style: {
        background: 'orange',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  };

  return (
    <LoaderContext.Provider value={{ isLoading, startLoader, stopLoader, invalidPath }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
