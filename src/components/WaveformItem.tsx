'use client';

import React, { useRef, useEffect, useState } from 'react';
import { drawIndividualWave } from '@/lib/canvasUtils';
import type { Wave } from '@/lib/canvasUtils';
import { useAudioContext } from '@/hooks/useAudioContext';
import { NumericInput } from './NumericInput';

interface WaveformItemProps {
  wave: Wave;
  onUpdate: (id: number, newValues: Partial<Omit<Wave, 'id'>>) => void;
  onRemove: (id: number) => void;
  range: { start: number; end: number; };
  markerTime: number | null;
  onCanvasMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void; // Add this line
}

export const WaveformItem: React.FC<WaveformItemProps> = ({ wave, onUpdate, onRemove, range, markerTime, onCanvasMouseDown }) => { // Add onCanvasMouseDown here
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getAudioContext } = useAudioContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioNodes = useRef<{
    oscillator: OscillatorNode | null;
    gainNode: GainNode | null;
  }>({ oscillator: null, gainNode: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      drawIndividualWave(
        canvas,
        wave.frequency,
        wave.phase,
        range.start,
        range.end,
        markerTime
      );
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [wave, range, markerTime]);

  // Audio playback effect
  useEffect(() => {
    const audioContext = getAudioContext();

    const stopAudio = () => {
      if (audioNodes.current.oscillator) {
        try {
          audioNodes.current.oscillator.stop();
        } catch (e) {
          // Oscillator might already be stopped
        }
        audioNodes.current.oscillator = null;
      }
      if (audioNodes.current.gainNode) {
        audioNodes.current.gainNode.disconnect();
        audioNodes.current.gainNode = null;
      }
    };

    if (isPlaying) {
      stopAudio(); // Stop any existing audio before starting new one

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(wave.frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Default volume

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();

      audioNodes.current.oscillator = oscillator;
      audioNodes.current.gainNode = gainNode;
    } else {
      stopAudio();
    }

    // Update frequency if playing and wave frequency changes
    if (isPlaying && audioNodes.current.oscillator) {
      try {
        audioNodes.current.oscillator.frequency.setValueAtTime(wave.frequency, audioContext.currentTime);
      } catch (e) {
        // Oscillator might be stopped
      }
    }

    return () => {
      stopAudio();
    };
  }, [isPlaying, wave.frequency, getAudioContext]);

  return (
    <div className="w-full flex items-center gap-4">
      <div className="canvas-container flex-grow bg-gray-900 rounded-lg overflow-hidden border border-gray-600">
        <canvas
          className="individual-waveform-canvas"
          ref={canvasRef}
          onMouseDown={onCanvasMouseDown} // Use the passed onCanvasMouseDown
          onMouseMove={onCanvasMouseDown} // Use the passed onCanvasMouseDown
          onMouseUp={onCanvasMouseDown} // Use the passed onCanvasMouseDown
          onMouseLeave={onCanvasMouseDown} // Use the passed onCanvasMouseDown
        ></canvas>
      </div>
      <div className="w-40 flex-shrink-0 flex flex-col bg-gray-700/50 p-3 rounded-lg self-stretch justify-center">
        <NumericInput
          id={`freq-${wave.id}`}
          label="周波数 (Hz)"
          value={wave.frequency}
          onChange={(newValue) => onUpdate(wave.id, { frequency: newValue })}
        />
        <div>
          <label htmlFor={`phase-${wave.id}`} className="text-sm font-medium text-gray-300 text-center block mb-1">位相 (°)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              id={`phase-${wave.id}`}
              min="0"
              max="360"
              value={wave.phase}
              onChange={(e) => onUpdate(wave.id, { phase: Number(e.target.value) })}
              className="phase-slider flex-grow"
            />
            <span className="text-xs font-mono text-cyan-300 w-9 text-center">{wave.phase}°</span>
          </div>
        </div>
        <button onClick={() => setIsPlaying(!isPlaying)} className={`audio-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs transition-all flex items-center justify-center gap-1 mt-2 ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          )}
          <span>{isPlaying ? '停止' : '再生'}</span>
        </button>
        <button onClick={() => onRemove(wave.id)} className="text-gray-400 hover:bg-red-500 hover:text-white transition-colors w-full flex items-center justify-center gap-1.5 text-sm py-2 rounded-md bg-gray-600/50 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          削除
        </button>
      </div>
    </div>
  );
};
