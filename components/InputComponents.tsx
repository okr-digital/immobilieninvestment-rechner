import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-lg mb-3 bg-white shadow-sm overflow-hidden">
      <button 
        className="w-full px-4 py-3 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-slate-700">{title}</span>
        {isOpen ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  step?: number;
  tooltip?: string;
  min?: number;
  max?: number;
}

export const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, unit, step = 1, tooltip, min, max }) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-1 items-center">
        <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
          {label}
          {tooltip && (
            <div className="group relative">
               <Info size={12} className="text-slate-400 cursor-help" />
               <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded z-10 shadow-lg">
                 {tooltip}
               </div>
            </div>
          )}
        </label>
      </div>
      <div className="relative">
        <input 
          type="number" 
          value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          step={step}
          min={min}
          max={max}
        />
        {unit && (
          <span className="absolute right-3 top-2 text-slate-500 text-sm pointer-events-none">{unit}</span>
        )}
      </div>
    </div>
  );
};

export const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-700">{label}</span>
    <button 
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
    >
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);