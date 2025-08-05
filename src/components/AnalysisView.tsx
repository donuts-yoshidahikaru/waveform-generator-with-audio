'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { drawAnalysisGraphs, drawWindingWaveAnimation } from '@/lib/canvasUtils';
import type { Wave } from '@/lib/canvasUtils';

interface AnalysisViewProps {
  waves: Wave[];
  range: { start: number; end: number; };
  lapCount: number;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ waves, range, lapCount }) => {
  const circularCanvasRef = useRef<HTMLCanvasElement>(null);
  const centroidXCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<{ cancel: () => void } | null>(null);

  const drawGraphs = useCallback(() => {
    const circularCanvas = circularCanvasRef.current;
    const centroidXCanvas = centroidXCanvasRef.current;
    if (circularCanvas && centroidXCanvas) {
      drawAnalysisGraphs(
        circularCanvas,
        centroidXCanvas,
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
      drawGraphs();
    }
  }, [isAnimating, waves, range, lapCount, drawGraphs]);

  useEffect(() => {
    const circularCanvas = circularCanvasRef.current;
    const centroidXCanvas = centroidXCanvasRef.current;
    if (!circularCanvas || !centroidXCanvas) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!isAnimating) {
        drawGraphs();
      }
    });

    resizeObserver.observe(circularCanvas);
    resizeObserver.observe(centroidXCanvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isAnimating, drawGraphs]);

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
        <div className="w-full h-3/5 bg-gray-900 rounded-lg border border-gray-700 p-2">
          <canvas ref={centroidXCanvasRef}></canvas>
        </div>
      </div>
    </div>
  );
};