'use client';

import React, { useRef, useEffect, useState } from 'react';
import { drawCompositeWave, getMarkerTimeFromEvent } from '@/lib/canvasUtils';
import type { Wave } from '@/lib/canvasUtils';
import { useAudioContext } from '@/hooks/useAudioContext';

interface CompositeWaveformProps {
  waves: Wave[];
  range: { start: number; end: number; };
  viewMode: 'wave' | 'test';
  lapCount: number;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  markerTime: number | null;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const CompositeWaveform: React.FC<CompositeWaveformProps> = ({
  waves,
  range,
  viewMode,
  lapCount,
  volume,
  onVolumeChange,
  isPlaying,
  onTogglePlay,
  markerTime,
  onMouseDown,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getAudioContext } = useAudioContext();
  const compositeAudioNodes = useRef<{
    oscillators: OscillatorNode[];
    gainNode: GainNode | null;
  }>({ oscillators: [], gainNode: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      drawCompositeWave(
        canvas,
        waves,
        range.start,
        range.end,
        viewMode,
        lapCount,
        markerTime
      );
    };

    // Initial draw and redraw on state changes
    handleResize();

    // Redraw on window resize
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [waves, range, viewMode, lapCount, markerTime]);

  // Audio playback effect
  useEffect(() => {
    const audioContext = getAudioContext();

    const stopAudio = () => {
      if (compositeAudioNodes.current.oscillators.length > 0) {
        compositeAudioNodes.current.oscillators.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {
            // Oscillator might already be stopped
          }
        });
        compositeAudioNodes.current.oscillators = [];
      }
      if (compositeAudioNodes.current.gainNode) {
        compositeAudioNodes.current.gainNode.disconnect();
        compositeAudioNodes.current.gainNode = null;
      }
    };

    if (isPlaying) {
      stopAudio(); // Stop any existing audio before starting new one

      if (waves.length === 0) return;

      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      compositeAudioNodes.current.gainNode = gainNode;

      const currentVolume = volume / 100;
      gainNode.gain.setValueAtTime(currentVolume / waves.length, audioContext.currentTime);

      waves.forEach(wave => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(wave.frequency, audioContext.currentTime);
        oscillator.connect(gainNode);
        oscillator.start();
        compositeAudioNodes.current.oscillators.push(oscillator);
      });
    } else {
      stopAudio();
    }

    // Update volume if playing
    if (isPlaying && compositeAudioNodes.current.gainNode) {
      const currentVolume = volume / 100;
      compositeAudioNodes.current.gainNode.gain.setValueAtTime(currentVolume / waves.length, audioContext.currentTime);
    }

    // Update frequencies if playing and waves change
    if (isPlaying && compositeAudioNodes.current.oscillators.length > 0) {
      compositeAudioNodes.current.oscillators.forEach((osc, index) => {
        if (index < waves.length) {
          try {
            osc.frequency.setValueAtTime(waves[index].frequency, audioContext.currentTime);
          } catch (e) {
            // Oscillator might be stopped
          }
        }
      });
    }

    return () => {
      stopAudio();
    };
  }, [isPlaying, waves, volume, getAudioContext]);

  return (
    <div className="w-full max-w-[900px] flex items-center gap-4">
      <div className="canvas-container flex-grow bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        <canvas
          id="compositeCanvas"
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseDown} // MouseMove is handled by page.tsx's global listener
          onMouseUp={onMouseDown} // MouseUp is handled by page.tsx's global listener
        ></canvas>
      </div>
      <div className="w-40 flex-shrink-0 flex flex-col gap-3 bg-gray-700/50 p-3 rounded-lg">
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-300 mb-2">複合音</label>
          <button onClick={onTogglePlay} className={`audio-btn w-full font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
            <span>{isPlaying ? '停止' : '再生'}</span>
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 text-center">音量</label>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="volume-slider w-full"
          />
          <div className="text-xs text-gray-400 text-center mt-1">
            <span>{volume}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
