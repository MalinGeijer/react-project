import React, { useRef, useState, useEffect, type RefObject } from 'react';
import { ProbabilityHeatmap } from '../components/Predict/ProbabilityHeatmap';
import { ConfidenceCircle } from '../components/Predict/ConfidenceCircle';
import {
  startDrawing,
  draw,
  stopDrawing,
  clearCanvas,
} from '../utils/canvasUtils';
import type { PredictionResult } from '../utils/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

type InputEvent = React.ChangeEvent<HTMLInputElement>;

export default function CanvasPredict() {
  // Create refs for the canvas and its 2D rendering context. (the canvas frame and its content)
  const ctxRef: RefObject<CanvasRenderingContext2D | null> = useRef(null);
  const canvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);

  // State variables for drawing status, prediction result, and selected model.
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [model, setModel] = useState<string>('logistic_regression');
  const [label, setLabel] = useState<number | null>(null);

  const [history, setHistory] = useState<PredictionResult[]>(() => {
    const storedHistory = localStorage.getItem('predictionHistory');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });

  // Update localStorage whenever history changes.
  useEffect(() => {
    localStorage.setItem('predictionHistory', JSON.stringify(history));
  }, [history]);

  const predictNumber = async (
    canvasRef: RefObject<HTMLCanvasElement | null>,
    model: string, // input form select
    setResult: React.Dispatch<React.SetStateAction<PredictionResult | null>>,
    label?: number | null
  ) => {
    if (!canvasRef.current) return;

    // Check if canvas is empty (only black background)
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, width, height);

    let hasDrawing = false;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];

      if (r !== 0 || g !== 0 || b !== 0) {
        hasDrawing = true;
        break;
      }
    }

    if (!hasDrawing) {
      setResult({ info: 'You need to draw a number first!' });
      return;
    }

    const image = canvasRef.current.toDataURL('image/png');
    const payload: {
      image: string;
      model: string;
      label?: number;
    } = { image, model };

    if (typeof label === 'number') {
      payload.label = label;
    }

    try {
      console.log('Sending payload:', payload);
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResult(data);
      setHistory((prevHistory) => [...prevHistory, data]);
    } catch (err) {
      setResult({ error: 'Error contacting backend' });
      console.error(err);
    }
  };

  function handleLabelChange(e: InputEvent) {
    const value = e.target.valueAsNumber;
    const n = Number(value);
    if (Number.isInteger(n) && n >= 0 && n < 10) {
      setLabel(n);
    } else {
      setLabel(null);
    }
  }

  type HistogramData = {
    digit: number;
    correct: number;
    incorrect: number;
    accuracy: number; // per-digit accuracy
  };

  function buildHistogramFromHistory(
    history: PredictionResult[],
    model: string
  ): HistogramData[] {
    // Filtrera bara prediktioner för den valda modellen
    const filtered = history.filter((entry) => entry.model === model);

    const correctCounts = new Array(10).fill(0);
    const incorrectCounts = new Array(10).fill(0);

    filtered.forEach((entry) => {
      const label = entry.label;
      const pred = entry.predicted_digit;

      if (typeof label === 'number' && typeof pred === 'number') {
        if (pred === label) {
          correctCounts[label]++;
        } else {
          incorrectCounts[label]++;
        }
      }
    });

    // Skapa array med 0-9 som x-axel, inklusive per-digit accuracy
    const histogram = Array.from({ length: 10 }, (_, digit) => {
      const correct = correctCounts[digit];
      const incorrect = incorrectCounts[digit];
      const total = correct + incorrect;
      const accuracy = total > 0 ? correct / total : 0;

      return {
        digit,
        correct,
        incorrect,
        accuracy,
      };
    });

    return histogram;
  }

  // Set up the canvas when the component mounts. Only runs once.
  // .current is a pointer to the actual DOM element. (similar to self in python)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Drawing styles
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 30;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Update the context ref to point to the initialized context.
        ctxRef.current = ctx;
      }
    }
  }, []);

  const lrData = buildHistogramFromHistory(history, 'logistic_regression');
  const rfData = buildHistogramFromHistory(history, 'random_forest');
  const nnData = buildHistogramFromHistory(history, 'neural_network');

  return (
    <>
      <div className="flex flex-col items-center min-h-screen space-y-4">
        <h2 className="text-2xl font-bold">Play Page</h2>
        <p className="text-lg mb-4">Draw a number between 0 and 9!</p>
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => startDrawing(e, ctxRef, setIsDrawing)}
          onMouseMove={(e) => draw(e, ctxRef, isDrawing)}
          onMouseUp={() => stopDrawing(ctxRef, setIsDrawing)}
          onMouseLeave={() => stopDrawing(ctxRef, setIsDrawing)}
          className="rounded-lg cursor-crosshair"
        />
        <div className="flex items-center space-x-2">
          <label className="text-black">Model:</label>
          <select
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="px-2 py-1 text-black">
            <option value="logistic_regression">Logistic Regression</option>
            <option value="random_forest">Random Forest</option>
            <option value="neural_network">Neural Network</option>
          </select>

          <button
            // (e) can be omitted since clearCanvas does not use the event object.
            onClick={() => clearCanvas(ctxRef, canvasRef, setResult, setLabel)}
            className="px-4 py-1 bg-base-muted text-black  hover:bg-base-hover rounded transition">
            Clear Canvas
          </button>

          <button
            onClick={() => predictNumber(canvasRef, model, setResult, label)}
            className="px-4 py-1 bg-base-muted text-black hover:bg-base-hover rounded transition">
            Predict Number
          </button>
        </div>
        <p>The below is only relevant if you the statistics over time</p>

        <div className="flex items-center space-x-2">
          <label className="text-black whitespace-nowrap">
            Enter the number written:
          </label>
          <input
            type="number"
            min={0}
            max={9}
            step={1}
            value={label ?? ''}
            onChange={handleLabelChange}
            className="text-base-muted px-2"
          />
        </div>
        {result && (
          <div className="mt-4 border border-black p-6 rounded-lg w-full max-w-md">
            {result.info ? (
              <p className="text-yellow-300">Info: {result.info}</p>
            ) : result.error ? (
              <p className="text-red-400">Error: {result.error}</p>
            ) : (
              <>
                <p className="text-xl font-semibold">
                  <span className="mr-3">Predicted number:</span>
                  {result.predicted_digit}
                </p>

                <div className="flex items-center text-xl font-semibold">
                  <span className="mr-7">Confidence:</span>
                  {result.confidence != null && (
                    <ConfidenceCircle confidence={result.confidence} />
                  )}
                </div>

                {result.probabilities && (
                  <ProbabilityHeatmap probabilities={result.probabilities} />
                )}
              </>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-4 w-full max-w-xl">
            <h3 className="text-lg text-center font-bold mb-2">
              Logistic Regression
            </h3>
            <div className="max-w-xl h-[20vh]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lrData}>
                  <XAxis dataKey="digit" />
                  <YAxis />
                  <Legend />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={(props) => {
                      if (
                        props.active &&
                        props.payload &&
                        props.payload.length > 0
                      ) {
                        const { digit } = props.payload[0].payload;
                        const accuracy = lrData[digit].accuracy;
                        return (
                          <div>Accuracy: {Math.round(accuracy * 100)}%</div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="correct"
                    fill="#4caf50"
                    stackId="a"
                    barSize={20}
                  />
                  <Bar
                    dataKey="incorrect"
                    fill="#e57373"
                    stackId="a"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <h3 className="text-lg text-center font-bold mb-2">
              Random Forest
            </h3>
            <div className="max-w-xl h-[20vh]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rfData}>
                  <XAxis dataKey="digit" />
                  <YAxis />
                  <Legend />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={(props) => {
                      if (
                        props.active &&
                        props.payload &&
                        props.payload.length > 0
                      ) {
                        const { digit } = props.payload[0].payload;
                        const accuracy = rfData[digit].accuracy;
                        return (
                          <div>Accuracy: {Math.round(accuracy * 100)}%</div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="correct"
                    fill="#4caf50"
                    stackId="a"
                    barSize={20}
                  />
                  <Bar
                    dataKey="incorrect"
                    fill="#e57373"
                    stackId="a"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <h3 className="text-lg text-center font-bold mb-2">
              Neural Network
            </h3>
            <div className="max-w-xl h-[20vh]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nnData}>
                  <XAxis dataKey="digit" />
                  <YAxis />
                  <Legend />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={(props) => {
                      if (
                        props.active &&
                        props.payload &&
                        props.payload.length > 0
                      ) {
                        const { digit } = props.payload[0].payload;
                        const accuracy = nnData[digit].accuracy;
                        return (
                          <div>Accuracy: {Math.round(accuracy * 100)}%</div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="correct"
                    fill="#4caf50"
                    stackId="a"
                    barSize={20}
                  />
                  <Bar
                    dataKey="incorrect"
                    fill="#e57373"
                    stackId="a"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            setHistory([]);
            localStorage.removeItem('predictionHistory');
          }}
          className="px-4 py-1 bg-base-muted text-black hover:bg-base-hover rounded transition">
          Clear History
        </button>
      </div>
    </>
  );
}
