import React, { createContext, useContext, useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

// Context for the Accordion Group
interface AccordionContextType {
  value: string | undefined;
  onValueChange: (value: string) => void;
  type: "single" | "multiple";
  collapsible?: boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  className?: string;
  children: ReactNode;
  defaultValue?: string;
}

export function Accordion({ type = "single", collapsible = false, className = "", children, defaultValue }: AccordionProps) {
  const [value, setValue] = useState<string | undefined>(defaultValue);

  const handleValueChange = (newValue: string) => {
    if (type === "single") {
      if (collapsible && value === newValue) {
        setValue(undefined);
      } else {
        setValue(newValue);
      }
    }
    // We can implement multiple later if needed, but for now single is fine as requested
  };

  return (
    <AccordionContext.Provider value={{ value, onValueChange: handleValueChange, type, collapsible }}>
      <div className={`space-y-1 ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Context for individual Item
interface AccordionItemContextType {
  value: string;
  isOpen: boolean;
  toggle: () => void;
}

const AccordionItemContext = createContext<AccordionItemContextType | undefined>(undefined);

interface AccordionItemProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export function AccordionItem({ value, className = "", children }: AccordionItemProps) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used within Accordion");

  const isOpen = ctx.value === value;

  const toggle = () => {
    ctx.onValueChange(value);
  };

  return (
    <AccordionItemContext.Provider value={{ value, isOpen, toggle }}>
      <div className={`border border-[var(--color-border)] rounded-md overflow-hidden bg-white ${className}`}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps {
  className?: string;
  children: ReactNode;
}

export function AccordionTrigger({ className = "", children }: AccordionTriggerProps) {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) throw new Error("AccordionTrigger must be used within AccordionItem");

  return (
    <button
      onClick={ctx.toggle}
      className={`flex flex-1 items-center justify-between w-full p-4 font-medium transition-all hover:bg-gray-50 focus:outline-none ${className}`}
      aria-expanded={ctx.isOpen}
    >
      <span className="text-left">{children}</span>
      <ChevronDown
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
          ctx.isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

interface AccordionContentProps {
  className?: string;
  children: ReactNode;
}

export function AccordionContent({ className = "", children }: AccordionContentProps) {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) throw new Error("AccordionContent must be used within AccordionItem");

  if (!ctx.isOpen) return null;

  return (
    <div className={`p-4 pt-0 text-sm text-gray-700 border-t border-[var(--color-border)] ${className}`}>
      {children}
    </div>
  );
}
