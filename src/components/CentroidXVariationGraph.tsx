'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { drawGreenCentroidXVariationGraph } from '@/lib/canvasUtils';
import type { Wave } from '@/lib/canvasUtils';

interface CentroidXVariationGraphProps {
  waves: Wave[];
  range: { start: number; end: number; };
  lapCount: number;
  className?: string;
}

export const CentroidXVariationGraph: React.FC<CentroidXVariationGraphProps> = ({ waves, range, lapCount, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawGreenCentroidXVariationGraph(
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
    <div className={`w-full h-full bg-gray-900 rounded-lg border border-gray-700 p-2 ${className}`}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};