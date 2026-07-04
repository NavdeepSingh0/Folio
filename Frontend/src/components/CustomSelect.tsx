import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({ options, value, onChange, disabled, className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-[var(--color-surface)] dark:bg-slate-800 border border-[var(--color-border)] dark:border-slate-700 rounded-[var(--radius-base)] text-[var(--color-text-primary)] dark:text-gray-200 transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
        }`}
      >
        <div className="flex flex-col items-start truncate">
          <span className="text-sm font-medium">{selectedOption?.label}</span>
          {selectedOption?.description && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {selectedOption.description}
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                    isSelected 
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className={`text-sm ${isSelected ? "font-semibold" : "font-medium"}`}>
                      {option.label}
                    </span>
                    {option.description && (
                      <span className={`text-xs mt-0.5 truncate ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
                        {option.description}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={16} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
