import { useRef, useState, useEffect, type RefObject, use } from "react";
import { ProbabilityHeatmap } from "../components/Predict/ProbabilityHeatmap";
import { ConfidenceCircle } from "../components/Predict/ConfidenceCircle";
import { startDrawing, draw, stopDrawing, clearCanvas } from "../utils/canvasUtils";
import { predictNumber } from "../components/Predict/PredictNumber";
import type { PredictionResult } from "../utils/types";

export default function CanvasPredict() {

  // Create refs for the canvas and its 2D rendering context. (the canvas frame and its content)
  const ctxRef: RefObject<CanvasRenderingContext2D | null> = useRef(null);
  const canvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);

  // State variables for drawing status, prediction result, and selected model.
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [model, setModel] = useState<string>("logistic_regression");

  // Set up the canvas when the component mounts. Only runs once.
  // .current is a pointer to the actual DOM element. (similar to self in python)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Drawing styles
        ctx.strokeStyle = "white";
        ctx.lineWidth = 40;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Update the context ref to point to the initialized context.
        ctxRef.current = ctx;
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen space-y-4 text-white p-4">
      <h2 className="text-2xl font-bold text-base-muted">Play Page</h2>
      <p className="text-lg text-base-muted">Draw a number between 0 and 9!</p>

      {/* Canvas element with event handlers for drawing. */}
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => startDrawing(e, ctxRef, setIsDrawing)}
        onMouseMove={(e) => draw(e, ctxRef, isDrawing)}
        onMouseUp={() => stopDrawing(ctxRef, setIsDrawing)}
        onMouseLeave={() => stopDrawing(ctxRef, setIsDrawing)}
        className="rounded-lg border-2 border-base-border cursor-crosshair"
      />

      {/* Model selection */}
      <div className="mt-4 flex items-center">
        <label className="text-black">Model:</label>
        <select
          value={model}
          // Update the selected model when the dropdown value changes.
          onChange={(event) => setModel(event.target.value)}
          className="px-2 py-1 text-black">
          <option value="logistic_regression">Logistic Regression</option>
          <option value="random_forest">Random Forest</option>
          <option value="neural_network">Neural Network</option>
        </select>

        <div className="ml-4" />
          <div className="mt-0 flex space-x-4">
            <button
              // (e) can be omitted since clearCanvas does not use the event object.
              onClick={() => clearCanvas(ctxRef, canvasRef, setResult)}
              className="px-4 py-1 bg-base-muted text-black  hover:bg-base-hover rounded-lg transition">
              Clear
            </button>

            {/* Pass a function to onClick to prevent re-renders; calling predictNumber() directly would trigger an infinite loop. */}
            <button
              onClick={() => predictNumber(canvasRef, model, setResult)}
              className="px-4 py-1 bg-base-muted text-black hover:bg-base-hover rounded-lg transition"
            >
              Predict
            </button>

        </div>
      </div>

      {/* Prediction result, plots and statistics */}
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

    </div>
  );
}
