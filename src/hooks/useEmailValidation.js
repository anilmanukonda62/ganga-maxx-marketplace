import { useState, useEffect } from 'react';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const useEmailValidation = (email) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(null); // null = unvalidated, true = valid, false = invalid
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    if (!email || email.trim() === '') {
      setIsValidating(false);
      setIsValid(null);
      setErrorMessage('');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setIsValidating(false);
      setIsValid(false);
      setErrorMessage('Invalid email format');
      return;
    }

    setIsValid(null);
    setErrorMessage('');
    setIsValidating(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const API_URL = import.meta.env.DEV 
          ? '/api' 
          : 'https://ganga-maxx-marketplace-ct25.onrender.com/api';
          
        const response = await fetch(`${API_URL}/validate-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        
        if (!active) return;
        setIsValidating(false);

        if (response.ok && data.success) {
          if (data.valid) {
            setIsValid(true);
            setErrorMessage('');
          } else {
            setIsValid(false);
            setErrorMessage(data.message || 'This email does not exist');
          }
        } else {
          // Server error or 404: do not show green checkmark, keep it unvalidated
          setIsValid(null);
          setErrorMessage('');
        }
      } catch (err) {
        console.error('Email validation error:', err);
        if (!active) return;
        setIsValidating(false);
        setIsValid(null);
        setErrorMessage('');
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [email]);

  return { isValidating, isValid, errorMessage };
};
