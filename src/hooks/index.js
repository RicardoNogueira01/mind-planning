import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching data with loading and error states
 * 
 * @param {Function} fetchFunction - Async function that fetches data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} Object containing data, loading, error, and refetch function
 */
export const useFetch = (fetchFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
};

/**
 * Custom hook for managing local storage with state
 * 
 * @param {string} key - Local storage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {Array} [value, setValue] tuple
 */
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};

/**
 * Custom hook for debouncing a value
 * 
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {*} Debounced value
 */
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Custom hook for managing toggle state
 * 
 * @param {boolean} initialState - Initial state (default: false)
 * @returns {Array} [state, toggle, setTrue, setFalse] tuple
 */
export const useToggle = (initialState = false) => {
    const [state, setState] = useState(initialState);

    const toggle = () => setState(prev => !prev);
    const setTrue = () => setState(true);
    const setFalse = () => setState(false);

    return [state, toggle, setTrue, setFalse];
};

/**
 * Custom hook for managing form state
 * 
 * @param {Object} initialValues - Initial form values
 * @returns {Object} Object containing values, errors, handlers
 */
export const useForm = (initialValues = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (name, value) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleBlur = (name) => {
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    const setFieldError = (name, error) => {
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldError,
        reset
    };
};
