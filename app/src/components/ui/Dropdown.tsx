import { useState, useRef, useEffect, type ReactNode } from 'react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-sm
          border rounded-md bg-white
          ${disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
            : 'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          }
        `}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`w-4 h-4 ml-2 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm text-left
                    hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                    ${option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  `}
                >
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
