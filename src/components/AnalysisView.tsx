'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { drawCircularWave, drawWindingWaveAnimation } from '@/lib/canvasUtils';
import { GravityGraph } from './GravityGraph';
import type { Wave } from '@/lib/canvasUtils';

interface AnalysisViewProps {
  waves: Wave[];
  range: { start: number; end: number; };
  lapCount: number;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ waves, range, lapCount }) => {
  const circularCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<{ cancel: () => void } | null>(null);

  const drawCircular = useCallback(() => {
    const circularCanvas = circularCanvasRef.current;
    if (circularCanvas) {
      drawCircularWave(
        circularCanvas,
        waves,
        range.start,
        range.end,
        lapCount
      );
    }
  }, [waves, range, lapCount]);

  useEffect(() => {
    if (isAnimating) {
      const canvas = circularCanvasRef.current;
      if (!canvas) return;

      animationRef.current = drawWindingWaveAnimation(
        canvas,
        waves,
        range.start,
        range.end,
        lapCount,
        () => {
          setIsAnimating(false);
        }
      );

      return () => {
        animationRef.current?.cancel();
      };
    } else {
      drawCircular();
    }
  }, [isAnimating, waves, range, lapCount, drawCircular]);

  useEffect(() => {
    const circularCanvas = circularCanvasRef.current;
    if (!circularCanvas) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!isAnimating) {
        drawCircular();
      }
    });

    resizeObserver.observe(circularCanvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isAnimating, drawCircular]);

  const handlePlayAnimation = () => {
    if (!isAnimating) {
      setIsAnimating(true);
    }
  };

  return (
    <div className="w-1/2 flex items-stretch justify-center gap-4 ml-2">
      <div className="w-2/5 flex flex-col justify-center">
        <div className="circular-canvas-container bg-gray-900 rounded-lg border border-gray-700 p-4 flex flex-col items-center">
          <canvas ref={circularCanvasRef}></canvas>
          <button onClick={handlePlayAnimation} disabled={isAnimating} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-500">
            {isAnimating ? 'Animating...' : 'Play Animation'}
          </button>
        </div>
      </div>
      <div className="w-3/5 flex flex-col justify-center">
        <GravityGraph
          waves={waves}
          range={range}
          lapCount={lapCount}
          className="h-3/5"
        />
      </div>
    </div>
  );
};