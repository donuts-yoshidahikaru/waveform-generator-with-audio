export type Wave = {
  id: number;
  frequency: number;
  phase: number; // in degrees
};

export interface CanvasParams {
  dpr: number;
  width: number;
  height: number;
  midY: number;
  rangeStartMs: number;
  rangeEndMs: number;
  timeRangeMs: number;
}

// Helper to get canvas dimensions and drawing parameters
export const getCanvasParams = (
  canvas: HTMLCanvasElement,
  rangeStartMs: number,
  rangeEndMs: number
): CanvasParams => {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const midY = height / 2;
  const timeRangeMs = rangeEndMs - rangeStartMs;
  return { dpr, width, height, midY, rangeStartMs, rangeEndMs, timeRangeMs };
};

// Helper to resize and clear canvas
export const resizeAndClearCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, params: CanvasParams) => {
  const { dpr, width, height } = params;
  if (width === 0 || height === 0) return;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// Helper to draw X-axes
export const drawXAxes = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rangeStart: number,
  rangeTotal: number,
  unit: string = 'ms'
) => {
  const midY = height / 2;
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();
  const tickCount = 4;
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px Inter'; // Assuming Inter font is loaded via CSS
  ctx.textAlign = 'center';
  for (let i = 0; i <= tickCount; i++) {
    const x = (i / tickCount) * width;
    const value = rangeStart + (i / tickCount) * rangeTotal;
    ctx.beginPath();
    ctx.moveTo(x, midY - 4);
    ctx.lineTo(x, midY + 4);
    ctx.stroke();
    let label;
    if (value > 1000 && unit) {
      label = `${(value/1000).toFixed(1)}k${unit}`;
    } else {
      label = `${value.toFixed(1)}${unit}`;
    }
    ctx.fillText(label, x, midY + 15);
  }
};

// Helper to draw Y-axis labels
export const drawYAxisLabels = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
  const midY = height / 2;
  const topY = midY - (height * 0.4);
  const bottomY = midY + (height * 0.4);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px Inter'; // Assuming Inter font is loaded via CSS
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(scale.toFixed(2), width - 5, topY);
  ctx.fillText((-scale).toFixed(2), width - 5, bottomY);
  if (Math.abs(scale) > 1e-9) {
    ctx.fillText('0.00', width - 5, midY);
  }
};

// Helper to draw marker
export const drawMarker = (
  ctx: CanvasRenderingContext2D,
  time: number,
  calculateY: (time: number) => number,
  params: CanvasParams
) => {
  const { width, rangeStartMs, timeRangeMs } = params;
  const markerX = ((time - rangeStartMs) / timeRangeMs) * width;
  if (markerX < 0 || markerX > width) return;
  const y = calculateY(time);
  ctx.beginPath();
  ctx.arc(markerX, y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(255, 235, 59, 1)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
};

// Calculation for composite wave data
export const getCompositeWaveData = (
  numPoints: number,
  rangeStartMs: number,
  timeRangeMs: number,
  waves: Wave[]
) => {
  const compositeValues: number[] = [];
  let maxAbsValue = 0;
  for (let i = 0; i < numPoints; i++) {
    const currentTimeMs = rangeStartMs + (i / (numPoints > 1 ? numPoints - 1 : 1)) * timeRangeMs;
    const currentTimeS = currentTimeMs / 1000;
    let currentValue = 0;
    waves.forEach(wave => {
      const phaseRad = wave.phase * (Math.PI / 180);
      const angleRad = 2 * Math.PI * wave.frequency * currentTimeS + phaseRad;
      currentValue += Math.sin(angleRad);
    });
    compositeValues.push(currentValue);
    if (Math.abs(currentValue) > maxAbsValue) {
      maxAbsValue = Math.abs(currentValue);
    }
  }
  return { values: compositeValues, maxAbsValue };
};

// Drawing for composite wave
export const drawCompositeWave = (
  canvas: HTMLCanvasElement,
  waves: Wave[],
  rangeStartMs: number,
  rangeEndMs: number,
  viewMode: 'wave' | 'test',
  lapCount: number,
  markerTime: number | null
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const params = getCanvasParams(canvas, rangeStartMs, rangeEndMs);
  resizeAndClearCanvas(ctx, canvas, params);
  const { width, height, midY, rangeStartMs: currentRangeStartMs, timeRangeMs } = params;

  drawXAxes(ctx, width, height, currentRangeStartMs, timeRangeMs);

  if (viewMode === 'test') {
    const lapsPer1000ms = lapCount || 1;
    if (lapsPer1000ms > 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      const timePerPi = 500 / lapsPer1000ms; // Time for half a lap
      const startTime = currentRangeStartMs - (currentRangeStartMs % timePerPi);

      for (let t = startTime; t <= rangeEndMs; t += timePerPi) {
        if (t >= currentRangeStartMs) {
          const x = ((t - currentRangeStartMs) / timeRangeMs) * width;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }
  }

  if (waves.length === 0) {
    drawYAxisLabels(ctx, width, height, 1.0);
    return;
  }

  const waveData = getCompositeWaveData(width, currentRangeStartMs, timeRangeMs, waves);
  const yAxisScale = waveData.maxAbsValue < 1e-9 ? 1.0 : waveData.maxAbsValue;
  drawYAxisLabels(ctx, width, height, yAxisScale);
  const scaleFactor = waveData.maxAbsValue < 1e-9 ? 1.0 : waveData.maxAbsValue;
  const dynamicAmplitude = (height * 0.4) / scaleFactor;

  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2;
  ctx.beginPath();
  waveData.values.forEach((value, x) => {
    const y = midY - (value * dynamicAmplitude);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  if (markerTime !== null) {
    const calculateY = (time: number) => {
      const waveDataAtTime = getCompositeWaveData(1, time, 0, waves);
      return midY - (waveDataAtTime.values[0] * dynamicAmplitude);
    };
    drawMarker(ctx, markerTime, calculateY, params);
  }
};

// Drawing for individual wave
export const drawIndividualWave = (
  canvas: HTMLCanvasElement,
  frequency: number,
  phase: number,
  rangeStartMs: number,
  rangeEndMs: number,
  markerTime: number | null
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const params = getCanvasParams(canvas, rangeStartMs, rangeEndMs);
  resizeAndClearCanvas(ctx, canvas, params);
  const { width, height, midY, rangeStartMs: currentRangeStartMs, timeRangeMs } = params;

  const unitAmplitude = height * 0.4;
  drawXAxes(ctx, width, height, currentRangeStartMs, timeRangeMs);
  drawYAxisLabels(ctx, width, height, 1.0);

  ctx.strokeStyle = '#a5b4fc';
  ctx.lineWidth = 1.5;
  const phaseRad = phase * (Math.PI / 180);
  ctx.beginPath();
  for (let x = 0; x < width; x++) {
    const currentTimeMs = currentRangeStartMs + (x / width) * timeRangeMs;
    const currentTimeS = currentTimeMs / 1000;
    const angleRad = 2 * Math.PI * frequency * currentTimeS + phaseRad;
    const y = midY - Math.sin(angleRad) * unitAmplitude;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  if (markerTime !== null) {
    const calculateY = (time: number) => {
      const currentTimeS = time / 1000;
      const angleRad = 2 * Math.PI * frequency * currentTimeS + phaseRad;
      const value = Math.sin(angleRad);
      return midY - (value * unitAmplitude);
    };
    drawMarker(ctx, markerTime, calculateY, params);
  }
};

// Calculation for centroid
export const calculateCentroidForLapCount = (
  lapsPer1000ms: number,
  rangeStartMs: number,
  timeRangeMs: number,
  waves: Wave[]
) => {
  const numPoints = 200;
  const waveData = getCompositeWaveData(numPoints, rangeStartMs, timeRangeMs, waves);
  const scaleFactor = waveData.maxAbsValue < 1e-9 ? 1.0 : waveData.maxAbsValue;

  const baseRadius = 100; // This might need to be dynamic based on canvas size
  const amplitudeScale = baseRadius * 0.8 / scaleFactor;

  let sumX = 0;
  let sumY = 0;

  waveData.values.forEach((value, i) => {
    const progress = i / (numPoints > 1 ? numPoints - 1 : 1);
    const currentTimeMs = rangeStartMs + progress * timeRangeMs;

    const angle = (currentTimeMs / 1000.0) * lapsPer1000ms * 2 * Math.PI;

    const radius = baseRadius + value * amplitudeScale;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    sumX += x;
    sumY += y;
  });

  return (numPoints > 0) ? { x: sumX / numPoints, y: sumY / numPoints } : { x: 0, y: 0 };
};

// Drawing for circular wave
export const drawCircularWave = (
  canvas: HTMLCanvasElement,
  waves: Wave[],
  rangeStartMs: number,
  rangeEndMs: number,
  lapCount: number
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const params = getCanvasParams(canvas, rangeStartMs, rangeEndMs);
  resizeAndClearCanvas(ctx, canvas, params);
  const { width, height, rangeStartMs: currentRangeStartMs, timeRangeMs } = params;
  const centerX = width / 2;
  const centerY = height / 2;
  const lapsPer1000ms = lapCount || 1;

  if (waves.length === 0) return;

  const numPoints = 1000;
  const waveData = getCompositeWaveData(numPoints, currentRangeStartMs, timeRangeMs, waves);
  const scaleFactor = waveData.maxAbsValue < 1e-9 ? 1.0 : waveData.maxAbsValue;

  const baseRadius = Math.min(centerX, centerY) * 0.5;
  const amplitudeScale = baseRadius * 0.8 / scaleFactor;

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = '#67e8f9';
  ctx.lineWidth = 2;
  ctx.beginPath();

  let sumX = 0;
  let sumY = 0;

  waveData.values.forEach((value, i) => {
    const progress = i / (numPoints > 1 ? numPoints - 1 : 1);
    const currentTimeMs = currentRangeStartMs + progress * timeRangeMs;

    const angle = (currentTimeMs / 1000.0) * lapsPer1000ms * 2 * Math.PI;

    const radius = baseRadius + value * amplitudeScale;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    sumX += x;
    sumY += y;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  if (numPoints > 0) {
    const centroidX = sumX / numPoints;
    const centroidY = sumY / numPoints;
    ctx.beginPath();
    ctx.arc(centroidX, centroidY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
};

// Plot data on canvas (for centroid X graph)
export const plotDataOnCanvas = (
  ctx: CanvasRenderingContext2D,
  data: number[],
  label: string,
  rangeStart: number,
  rangeTotal: number,
  unit: string,
  markerValue: { x: number; y: number } | null,
  canvas: HTMLCanvasElement,
  rangeStartMs: number,
  rangeEndMs: number
) => {
  const params = getCanvasParams(canvas, rangeStartMs, rangeEndMs);
  resizeAndClearCanvas(ctx, canvas, params);
  const { width, height } = params;

  if (data.length === 0 || width <= 1) return;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const valueRange = maxVal - minVal;

  drawXAxes(ctx, width, height, rangeStart, rangeTotal, unit);
  const yAxisScale = Math.max(Math.abs(minVal), Math.abs(maxVal));
  drawYAxisLabels(ctx, width, height, yAxisScale < 1e-9 ? 1.0 : yAxisScale);

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  data.forEach((value, i) => {
    const x = (i / (data.length - 1)) * width;
    let y;
    if (valueRange < 1e-9) {
      y = height / 2;
    } else {
      const scale = yAxisScale < 1e-9 ? 1.0 : yAxisScale;
      const normalizedValue = value / (scale * 2);
      y = height / 2 - normalizedValue * height * 0.8;
    }
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  if (markerValue) {
    const { x: markerX_val, y: markerY_val } = markerValue;
    if (markerX_val >= rangeStart && markerX_val <= (rangeStart + rangeTotal)) {
      const markerX = ((markerX_val - rangeStart) / rangeTotal) * width;
      const scale = yAxisScale < 1e-9 ? 1.0 : yAxisScale;
      const normalizedY = markerY_val / (scale * 2);
      const markerY = height / 2 - normalizedY * height * 0.8;

      ctx.beginPath();
      ctx.arc(markerX, markerY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; // red-500
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  ctx.fillStyle = '#e5e7eb';
  ctx.font = '12px Inter'; // Assuming Inter font is loaded via CSS
  ctx.textAlign = 'left';
  ctx.fillText(label, 5, 15);
};

// Drawing for analysis graphs (combines centroidX and circular)
export const drawAnalysisGraphs = (
  circularCanvas: HTMLCanvasElement,
  centroidXCanvas: HTMLCanvasElement,
  waves: Wave[],
  rangeStartMs: number,
  rangeEndMs: number,
  lapCount: number
) => {
  drawCircularWave(circularCanvas, waves, rangeStartMs, rangeEndMs, lapCount);

  const centroidXCtx = centroidXCanvas.getContext('2d');
  if (!centroidXCtx) return;

  const params = getCanvasParams(centroidXCanvas, rangeStartMs, rangeEndMs);
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
    const centroid = calculateCentroidForLapCount(currentLap, rangeStartMs, rangeEndMs, waves);
    centroidXData.push(centroid.x);
  }

  const currentCentroid = calculateCentroidForLapCount(currentLapCount, rangeStartMs, rangeEndMs, waves);

  plotDataOnCanvas(
    centroidXCtx,
    centroidXData,
    "重心X座標",
    lapStart,
    lapRange,
    "",
    { x: currentLapCount, y: currentCentroid.x },
    centroidXCanvas,
    rangeStartMs,
    rangeEndMs
  );
};

// Marker event helpers
export const getMarkerTimeFromEvent = (
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  rangeStartMs: number,
  rangeEndMs: number
) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const { width, timeRangeMs } = getCanvasParams(canvas, rangeStartMs, rangeEndMs);
  if (width > 0) {
    return Math.max(rangeStartMs, Math.min(rangeEndMs, rangeStartMs + (x / width) * timeRangeMs));
  }
  return null;
};
