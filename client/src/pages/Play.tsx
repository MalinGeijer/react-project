import { useRef, useState, useEffect } from "react";
// - useRef is a hook that allows you to create a reference to a DOM element or a value that
//   persists across renders.

export default function CanvasPredict() {
  // Create a reference to a canvas element of type HTMLCanvasElement.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Create a state variable to track if the user is currently drawing.
  const [isDrawing, setIsDrawing] = useState(false);
  // Create a state variable to hold the response from the backend.
  const [result, setResult] = useState<any | null>(null);

  // Model selection
  const [model, setModel] = useState<string>("logistic_regression");


  // Set up the canvas when the component mounts. Only runs once.
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
        ctx.lineWidth = 25;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctxRef.current = ctx;
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    // Ensure the context exists before starting to draw.
    if (!ctxRef.current) return;
    // Set the drawing flag to true and begin a new path at the mouse position.
    setIsDrawing(true);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  // Function to handle drawing on the canvas as the mouse moves.
  const draw = (e: React.MouseEvent) => {
    // Only draw if the isDrawing flag is true and the context exists.
    if (!isDrawing || !ctxRef.current) return;
    // Draw a line to the current mouse position and stroke it.
    ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.stroke();
  };

  // Function to stop drawing when the mouse is released or leaves the canvas.
  const stopDrawing = () => {
    // Ensure the context exists before stopping drawing.
    if (!ctxRef.current) return;
    // Set the drawing flag to false and close the current path.
    setIsDrawing(false);
    ctxRef.current.closePath();
  };

  // Function to clear the canvas by filling it with black color.
  const clearCanvas = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    ctxRef.current.fillStyle = "black";
    ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

const predictNumber = async () => {
  // Ensure the canvas exists before making a prediction.
  if (!canvasRef.current) return;

  // Convert the canvas content to a data URL (base64 encoded PNG).
  const image = canvasRef.current.toDataURL("image/png");

  // Send the image data to the backend for ML prediction.
  try {
    const res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, model }),
    });

    console.log("Sending image to backend for prediction, model=", model)

    // Check if the response is OK (status code 200-299).
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    // Parse the JSON response from the backend.
    const data = await res.json();
    setResult(data);
  } catch (err) {
    setResult({ error: "Error contacting backend" });
    console.error(err);
  }
};



  // Render the canvas and control buttons.
  return (
    <div className="flex flex-col items-center min-h-screen space-y-4 text-white p-4">
      <h2 className="text-2xl font-bold">Play Page</h2>
      <p className="text-lg">Skriv en siffra i rutan nedan !</p>

      {/* Canvas element with event handlers for drawing. */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="rounded-lg border-2 border-gray-500 cursor-crosshair"
      />

      {/* Model selection */}
      <div className="mt-4 flex items-center space-x-4">
        <label className="text-sm">Model:</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-gray-800 text-white px-2 py-1 rounded">
          <option value="logistic_regression">Logistic Regression</option>
          <option value="random_forest">Random Forest</option>
          <option value="neural_network">Neural Network</option>
        </select>

        <div className="ml-4" />

        <div className="mt-0 flex space-x-4">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
          Clear
        </button>

        <button
          onClick={predictNumber}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
          Predict
        </button>
      </div>
      </div>

      {/* Prediction result */}
      {result && (
        <div className="mt-4 text-white">
          {result.error ? (
            <p className="text-red-400">Fel: {result.error}</p>
          ) : (
            <>
              <p className="text-2xl font-semibold">Predicted: {result.predicted_digit}</p>
              {result.confidence != null && (
                <p className="text-sm">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
              )}

              {result.probabilities && result.probabilities.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Top probabilities:</p>
                  <ul className="list-disc list-inside text-sm">
                    {result.probabilities.map((p: any) => (
                      <li key={p.digit}>{p.digit}: {(p.prob * 100).toFixed(2)}%</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs mt-2 text-gray-300">Model used: {result.model_used}</p>
            </>
          )}
        </div>
      )}

      {/* Plots and statistics */}
    </div>
  );
}
