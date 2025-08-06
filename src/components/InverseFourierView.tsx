'use client';

import React from 'react'; // Removed useState
import { GravityGraph } from './GravityGraph';
// Removed NumericInput import
import { CentroidCircularGraph } from './CentroidCircularGraph';
import type { Wave } from '@/lib/canvasUtils';

interface InverseFourierViewProps {
  waves: Wave[];
  range: { start: number; end: number; };
  lapCount: number; // Added lapCount prop
}

export const InverseFourierView: React.FC<InverseFourierViewProps> = ({ waves, range, lapCount }) => {
  // Removed inverseLapCount state

  return (
    <div className="w-full bg-gray-900 rounded-lg border border-gray-700 p-4 flex flex-col gap-4">
      <div className="w-full flex items-start gap-4">
        {/* Left side for circular graph */}
        <div className="w-1/2 h-96">
          <CentroidCircularGraph
            waves={waves}
            range={range}
            lapCount={lapCount} // Use global lapCount
            className="h-full"
          />
        </div>
        {/* Right side for controls and gravity graph */}
        <div className="w-1/2 flex flex-col gap-4">
          {/* Removed NumericInput for inverseLapCount */}
          <div className="w-full h-64">
            <GravityGraph
              waves={waves}
              range={range}
              lapCount={lapCount} // Use global lapCount
            />
          </div>
        </div>
      </div>
    </div>
  );
};