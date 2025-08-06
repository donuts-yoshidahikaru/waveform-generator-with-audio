'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { calculateCentroidForLapCount, plotDataOnCanvas, getCanvasParams } from '@/lib/canvasUtils';
import type { Wave } from '@/lib/canvasUtils';

interface GravityGraphProps {
  waves: Wave[];
  range: { start: number; end: number; };
  lapCount: number;
  className?: string;
}

export const GravityGraph: React.FC<GravityGraphProps> = ({ waves, range, lapCount, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const params = getCanvasParams(canvas, range.start, range.end);
    const { width } = params;

    if (waves.length === 0 || width <= 1) return;

    const centroidXData: number[] = [];
    const currentLapCount = lapCount || 1;
    const lapStart = 0.1;
    const lapEnd = Math.max(currentLapCount * 2, 1);
    const lapRange = lapEnd - lapStart;

    for (let i = 0; i < width; i++) {
      const currentLap = lapStart + (i / (width - 1)) * lapRange;
      if (currentLap <= 0) {
        centroidXData.push(0);
        continue;
      }
      const centroid = calculateCentroidForLapCount(currentLap, range.start, range.end, waves);
      centroidXData.push(centroid.x);
    }

    const currentCentroid = calculateCentroidForLapCount(currentLapCount, range.start, range.end, waves);

    plotDataOnCanvas(
      ctx,
      centroidXData,
      "重心X座標",
      lapStart,
      lapRange,
      "",
      { x: currentLapCount, y: currentCentroid.x },
      canvas,
      range.start,
      range.end
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