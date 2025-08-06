'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { drawCircularWave } from '@/lib/canvasUtils';
import type { Wave } from '@/lib/canvasUtils';

interface CircularGraphProps {
  waves: Wave[];
  range: { start: number; end: number; };
  lapCount: number;
  className?: string;
}

export const CircularGraph: React.FC<CircularGraphProps> = ({ waves, range, lapCount, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawCircularWave(
      canvas,
      waves,
      range.start,
      range.end,
      lapCount
    );
  }, [waves, range, lapCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      drawGraph();
    });

    resizeObserver.observe(canvas);
    drawGraph(); // Initial draw

    return () => {
      resizeObserver.disconnect();
    };
  }, [drawGraph]);

  return (
    <div className={`circular-canvas-container bg-gray-900 rounded-lg border border-gray-700 p-4 flex flex-col items-center ${className}`}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};