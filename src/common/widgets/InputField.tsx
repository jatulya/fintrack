import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-medium text-slate-700 ml-1">{label}</label>}
      <input
        className={`clay p-3 px-4 border-none outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${error ? 'ring-2 ring-rose-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 ml-1">{error}</span>}
    </div>
  );
};

export const SelectField: React.FC<{ label?: string, options: { value: string, label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>> = ({ label, options, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-medium text-slate-700 ml-1">{label}</label>}
      <select
        className="clay p-3 px-4 border-none outline-none focus:ring-2 focus:ring-indigo-400 transition-all appearance-none bg-white cursor-pointer"
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};
