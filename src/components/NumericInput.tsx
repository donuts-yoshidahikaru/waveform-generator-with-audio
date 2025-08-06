'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

// --- Helper Components (defined outside) ---

const ChevronIcon = ({ direction = 'right' }: { direction?: 'left' | 'right' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={direction === 'left' ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}></polyline>
  </svg>
);

const DoubleChevronIcon = ({ direction = 'right' }: { direction?: 'left' | 'right' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={direction === 'left' ? "11 17 6 12 11 7" : "13 17 18 12 13 7"}></polyline>
    <polyline points={direction === 'left' ? "18 17 13 12 18 7" : "6 17 11 12 6 7"}></polyline>
  </svg>
);

const TripleChevronIcon = ({ direction = 'right' }: { direction?: 'left' | 'right' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={direction === 'left' ? "8 17 3 12 8 7" : "16 17 21 12 16 7"}></polyline>
        <polyline points={direction === 'left' ? "15 17 10 12 15 7" : "9 17 14 12 9 7"}></polyline>
        <polyline points={direction === 'left' ? "22 17 17 12 22 7" : "2 17 7 12 2 7"}></polyline>
    </svg>
);

interface StepButtonProps {
    amount: number;
    handleUpdate: (amount: number) => void;
    children: React.ReactNode;
}

const StepButton = React.memo(({ amount, handleUpdate, children }: StepButtonProps) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isPressed, setIsPressed] = useState(false);

    const stopTimers = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsPressed(false);
    }, []);

    const startContinuousUpdate = useCallback(() => {
        stopTimers(); // Clear any existing timers
        setIsPressed(true);
        handleUpdate(amount);

        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                handleUpdate(amount);
            }, 80);
        }, 400);
    }, [amount, handleUpdate, stopTimers]);

    useEffect(() => {
        return stopTimers;
    }, [stopTimers]);

    const buttonClasses = [
        'text-white',
        'rounded',
        'transition-colors',
        'w-full',
        'flex',
        'items-center',
        'justify-center',
        'p-1',
        'h-full',
        'select-none',
        isPressed ? 'bg-cyan-700' : 'bg-gray-600 hover:bg-gray-500'
    ].join(' ');

    return (
        <button
            onMouseDown={startContinuousUpdate}
            onMouseUp={stopTimers}
            onMouseLeave={stopTimers}
            onTouchStart={(e) => { e.preventDefault(); startContinuousUpdate(); }}
            onTouchEnd={stopTimers}
            className={buttonClasses}
        >
            <div className="pointer-events-none">{children}</div>
        </button>
    );
});
StepButton.displayName = 'StepButton';

// --- Main Component ---

interface NumericInputProps {
  id: string;
  value: number;
  onChange: (newValue: number) => void;
  label: string;
}

export const NumericInput: React.FC<NumericInputProps> = ({ id, value, onChange, label }) => {

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const handleUpdate = useCallback((amount: number) => {
    const newValue = parseFloat((valueRef.current + amount).toPrecision(15));
    onChange(newValue);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-300 text-center block mb-1">{label}</label>
      <input
        type="number"
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-gray-900 border border-gray-600 text-white text-center text-md rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 shadow-inner"
      />
      <div className="grid grid-cols-6 gap-1">
        <StepButton amount={-10} handleUpdate={handleUpdate}><TripleChevronIcon direction="left" /></StepButton>
        <StepButton amount={-1} handleUpdate={handleUpdate}><DoubleChevronIcon direction="left" /></StepButton>
        <StepButton amount={-0.1} handleUpdate={handleUpdate}><ChevronIcon direction="left" /></StepButton>
        <StepButton amount={0.1} handleUpdate={handleUpdate}><ChevronIcon direction="right" /></StepButton>
        <StepButton amount={1} handleUpdate={handleUpdate}><DoubleChevronIcon direction="right" /></StepButton>
        <StepButton amount={10} handleUpdate={handleUpdate}><TripleChevronIcon direction="right" /></StepButton>
      </div>
    </div>
  );
};