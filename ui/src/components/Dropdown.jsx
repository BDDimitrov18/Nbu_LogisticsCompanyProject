import { useState, useRef, useEffect } from 'react';

const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Изберете...',
  name,
  id,
  required = false,
  disabled = false,
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Find selected option
  const selectedOption = options.find(opt => String(opt.value) === String(value));

  // Filter options based on search
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (option) => {
    onChange({
      target: {
        name,
        value: option.value
      }
    });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleSelect(filteredOptions[0]);
    }
  };

  return (
    <div
      className={`dropdown ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
      ref={dropdownRef}
    >
      <div className="dropdown-trigger" onClick={handleToggle}>
        <span className={`dropdown-value ${!selectedOption ? 'placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="dropdown-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {searchable && options.length > 5 && (
            <div className="dropdown-search">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Търсене..."
                className="dropdown-search-input"
              />
            </div>
          )}
          <div className="dropdown-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`dropdown-option ${String(option.value) === String(value) ? 'selected' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                  {String(option.value) === String(value) && (
                    <span className="dropdown-check">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="dropdown-no-results">Няма резултати</div>
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form validation */}
      <input
        type="hidden"
        name={name}
        id={id}
        value={value || ''}
        required={required}
      />
    </div>
  );
};

export default Dropdown;
