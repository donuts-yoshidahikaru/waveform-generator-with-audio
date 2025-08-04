'use client';

import React from 'react';
import { WaveformItem } from './WaveformItem';

type Wave = {
  id: number;
  frequency: number;
  phase: number;
};

interface WaveformListProps {
  waves: Wave[];
  onUpdateWave: (id: number, newValues: Partial<Omit<Wave, 'id'>>) => void;
  onRemoveWave: (id: number) => void;
  onAddWave: () => void;
  range: { start: number; end: number; };
  markerTime: number | null;
  onCanvasMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void; // Add this line
}

export const WaveformList: React.FC<WaveformListProps> = ({ waves, onUpdateWave, onRemoveWave, onAddWave, range, markerTime, onCanvasMouseDown }) => {
  return (
    <div className="w-1/2 flex flex-col items-center pr-2">
      <div className="w-full flex flex-col items-center gap-4">
        {waves.map(wave => (
          <WaveformItem
            key={wave.id}
            wave={wave}
            onUpdate={onUpdateWave}
            onRemove={onRemoveWave}
            range={range}
            markerTime={markerTime}
            onCanvasMouseDown={onCanvasMouseDown} // Pass the prop here
          />
        ))}
      </div>
      <div className="w-full mt-2">
        <button onClick={onAddWave} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-600 hover:border-cyan-500 hover:text-cyan-500 text-gray-400 font-bold py-3 px-4 rounded-lg transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          波形を追加
        </button>
      </div>
    </div>
  );
};