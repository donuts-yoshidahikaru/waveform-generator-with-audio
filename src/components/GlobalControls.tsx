'use client';

import React from 'react';

interface GlobalControlsProps {
  range: { start: number; end: number; };
  onRangeChange: (newRange: { start: number; end: number; }) => void;
  viewMode: 'wave' | 'test';
  onViewModeChange: (mode: 'wave' | 'test') => void;
  lapCount: number;
  onLapCountChange: (count: number) => void;
}

export const GlobalControls: React.FC<GlobalControlsProps> = ({
  range,
  onRangeChange,
  viewMode,
  onViewModeChange,
  lapCount,
  onLapCountChange,
}) => {
  const lapsPerMsDisplay = () => {
    const timeRangeMs = range.end - range.start;
    const lapsPer1000ms = lapCount || 1;
    const totalLapsInRange = (timeRangeMs / 1000) * lapsPer1000ms;
    return `(全域で${totalLapsInRange.toFixed(2)}周)`;
  };

  return (
    <div className="mb-4 w-full max-w-2xl flex flex-col items-center justify-center gap-4">
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Range Control */}
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-gray-300 mb-2 text-center">表示範囲 (ms)</label>
          <div className="flex items-center justify-center gap-2">
            <input
              type="number"
              value={range.start}
              onChange={(e) => onRangeChange({ ...range, start: Number(e.target.value) })}
              step="0.01"
              className="bg-gray-700 border border-gray-600 text-white text-center text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 shadow-inner"
            />
            <span className="text-gray-400">~</span>
            <input
              type="number"
              value={range.end}
              onChange={(e) => onRangeChange({ ...range, end: Number(e.target.value) })}
              step="0.01"
              className="bg-gray-700 border border-gray-600 text-white text-center text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 shadow-inner"
            />
          </div>
        </div>
        {/* Mode Toggle */}
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-gray-300 mb-2 text-center">モード</label>
          <div className="relative flex items-center justify-center bg-gray-700 rounded-lg p-1">
            <button onClick={() => onViewModeChange('wave')} className={`mode-btn flex-1 text-center text-sm py-2 rounded-md transition-colors ${viewMode === 'wave' ? 'bg-cyan-600 text-white' : 'text-gray-400'}`}>波形編集</button>
            <button onClick={() => onViewModeChange('test')} className={`mode-btn flex-1 text-center text-sm py-2 rounded-md transition-colors ${viewMode === 'test' ? 'bg-cyan-600 text-white' : 'text-gray-400'}`}>円形分析</button>
          </div>
        </div>
      </div>
      {/* Lap Count Control */}
      <div className={`w-full max-w-xs ${viewMode === 'test' ? '' : 'hidden'}`}>
        <label htmlFor="lapCount" className="block text-sm font-medium text-gray-300 mb-2 text-center">周回数 (/1000ms)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={lapCount}
            onChange={(e) => onLapCountChange(Number(e.target.value))}
            step="0.1"
            min="0"
            className="bg-gray-700 border border-gray-600 text-white text-center text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 shadow-inner"
          />
          <span className="text-sm text-gray-400 font-mono w-32 text-center">{lapsPerMsDisplay()}</span>
        </div>
      </div>
    </div>
  );
};
