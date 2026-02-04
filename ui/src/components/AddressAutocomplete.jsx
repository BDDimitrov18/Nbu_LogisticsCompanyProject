import { useEffect, useRef, useState, useCallback } from 'react';

// Load Google Maps script dynamically
let googleMapsPromise = null;
const loadGoogleMapsScript = () => {
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve();
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Google Maps API key not found'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=bg`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

const AddressAutocomplete = ({
  id,
  name,
  value,
  onChange,
  placeholder = 'Въведете адрес',
  required = false,
  disabled = false
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');

  // Keep localValue in sync with prop value
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Load Google Maps
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setIsLoaded(true))
      .catch((err) => console.error('Google Maps error:', err));
  }, []);

  // Notify parent of value change
  const notifyChange = useCallback((newValue) => {
    setLocalValue(newValue);
    if (onChange) {
      // Create a proper synthetic event
      const syntheticEvent = {
        target: {
          name: name,
          value: newValue,
          type: 'text'
        },
        currentTarget: {
          name: name,
          value: newValue,
          type: 'text'
        },
        type: 'change'
      };
      onChange(syntheticEvent);
    }
  }, [name, onChange]);

  // Initialize Autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Clean up previous instance
    if (autocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    // Create new autocomplete
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'bg' },
      types: ['address'],
      fields: ['formatted_address']
    });

    // Handle place selection
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        notifyChange(place.formatted_address);
      }
    });

    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, notifyChange]);

  // Handle manual input changes
  const handleInputChange = (e) => {
    notifyChange(e.target.value);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      id={id}
      name={name}
      value={localValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      autoComplete="off"
    />
  );
};

export default AddressAutocomplete;
