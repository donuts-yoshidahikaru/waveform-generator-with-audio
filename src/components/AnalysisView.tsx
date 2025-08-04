'use client';

import React, { useRef, useEffect } from 'react';
import { drawAnalysisGraphs } from '@/lib/canvasUtils';
import type { Wave } from '@/lib/canvasUtils';

interface AnalysisViewProps {
  waves: Wave[];
  range: { start: number; end: number; };
  lapCount: number;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ waves, range, lapCount }) => {
  const circularCanvasRef = useRef<HTMLCanvasElement>(null);
  const centroidXCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const circularCanvas = circularCanvasRef.current;
    const centroidXCanvas = centroidXCanvasRef.current;

    if (!circularCanvas || !centroidXCanvas) return;

    const handleResize = () => {
      drawAnalysisGraphs(
        circularCanvas,
        centroidXCanvas,
        waves,
        range.start,
        range.end,
        lapCount
      );
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(circularCanvas);
    resizeObserver.observe(centroidXCanvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [waves, range, lapCount]);

  return (
    <div className="w-1/2 flex items-stretch justify-center gap-4 ml-2">
      <div className="w-2/5 flex flex-col justify-center">
        <div className="circular-canvas-container bg-gray-900 rounded-lg border border-gray-700 p-4">
          <canvas ref={circularCanvasRef}></canvas>
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