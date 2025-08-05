'use client';

import React, { useRef, useEffect } from 'react';
import { drawUnifiedWaveform } from '@/lib/canvasUtils';
import type { Wave } from '@/lib/canvasUtils';

interface UnifiedWaveformCanvasProps {
  waves: Wave[];
  range: { start: number; end: number; };
  lapCount: number;
  isAnimating: boolean;
  animationProgress: number;
}

export const UnifiedWaveformCanvas: React.FC<UnifiedWaveformCanvasProps> = ({
  waves,
  range,
  lapCount,
  isAnimating,
  animationProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      drawUnifiedWaveform(
        canvas,
        waves,
        range.start,
        range.end,
        lapCount,
        isAnimating,
        animationProgress
      );
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [waves, range, lapCount, isAnimating, animationProgress]);

  return (
    <div className="w-full h-[400px] bg-transparent rounded-lg overflow-hidden border border-gray-700">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
