'use client';

import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { GlobalControls } from '@/components/GlobalControls';
import { CompositeWaveform } from '@/components/CompositeWaveform';
import { WaveformList } from '@/components/WaveformList';
import { AnalysisView } from '@/components/AnalysisView';

import { getMarkerTimeFromEvent } from '@/lib/canvasUtils';
import { useAudioContext } from '@/hooks/useAudioContext';

// Type definition for a single wave
type Wave = {
  id: number;
  frequency: number;
  phase: number;
};

const WaveformGeneratorPage: NextPage = () => {
  // --- State Management ---
  const [waves, setWaves] = useState<Wave[]>([{ id: 0, frequency: 440, phase: 90 }]);
  const [nextWaveId, setNextWaveId] = useState(1);
  const [range, setRange] = useState({ start: 0, end: 16 });
  const [viewMode, setViewMode] = useState<'wave' | 'test'>('wave');
  const [lapCount, setLapCount] = useState(60);
  const [compositeVolume, setCompositeVolume] = useState(50);
  const [compositeIsPlaying, setCompositeIsPlaying] = useState(false);
  const [markerTime, setMarkerTime] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { stopAllAudio } = useAudioContext();

  // --- Event Handlers ---

  const addWave = () => {
    const newWave: Wave = { id: nextWaveId, frequency: 220, phase: 90 };
    setWaves([...waves, newWave]);
    setNextWaveId(prevId => prevId + 1);
  };

  const removeWave = (idToRemove: number) => {
    setWaves(waves.filter(wave => wave.id !== idToRemove));
  };

  const updateWave = (id: number, newValues: Partial<Omit<Wave, 'id'>>) => {
    setWaves(waves.map(wave => wave.id === id ? { ...wave, ...newValues } : wave));
  };

  const toggleCompositePlay = () => {
    setCompositeIsPlaying(!compositeIsPlaying);
  };

  // Global mouse event handlers for marker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const targetCanvas = e.target as HTMLCanvasElement;
      if (targetCanvas && (targetCanvas.id === 'compositeCanvas' || targetCanvas.classList.contains('individual-waveform-canvas'))) {
        const time = getMarkerTimeFromEvent(e as any, targetCanvas, range.start, range.end);
        if (time !== null) {
          setMarkerTime(time);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, range]);

  const onCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    const time = getMarkerTimeFromEvent(e, e.currentTarget, range.start, range.end);
    if (time !== null) {
      setMarkerTime(time);
    }
  };

  // Clean up audio when page is unloaded
  useEffect(() => {
    window.addEventListener('beforeunload', stopAllAudio);
    return () => {
      window.removeEventListener('beforeunload', stopAllAudio);
    };
  }, [stopAllAudio]);

  

  return (
    <div className="bg-gray-900 text-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col items-center">

        <GlobalControls
          range={range}
          onRangeChange={setRange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          lapCount={lapCount}
          onLapCountChange={setLapCount}
        />

        {/* Main content area */}
        <div className="w-full max-w-[900px] flex flex-col items-center gap-4">
          <CompositeWaveform
            waves={waves}
            range={range}
            viewMode={viewMode}
            lapCount={lapCount}
            volume={compositeVolume}
            onVolumeChange={setCompositeVolume}
            isPlaying={compositeIsPlaying}
            onTogglePlay={toggleCompositePlay}
            markerTime={markerTime}
            onMouseDown={onCanvasMouseDown}
          />
          <div className="w-full max-w-[900px] overflow-hidden">
            <div className={`w-[200%] flex sliding-panel-container ${viewMode === 'test' ? 'is-slid' : ''}`}>
              <WaveformList
                waves={waves}
                onUpdateWave={updateWave}
                onRemoveWave={removeWave}
                onAddWave={addWave}
                range={range}
                markerTime={markerTime}
                onCanvasMouseDown={onCanvasMouseDown}
              />
              <AnalysisView
                waves={waves}
                range={range}
                lapCount={lapCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveformGeneratorPage;
