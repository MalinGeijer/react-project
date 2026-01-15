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
  const [response, setResponse] = useState<string | null>(null);


  // Set up the canvas when the component mounts. Only runs once.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Drawing styles
        ctx.strokeStyle = "black";
        ctx.lineWidth = 20;
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
    ctxRef.current.fillStyle = "white";
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
      body: JSON.stringify({ image }),
    });

    // Check if the response is OK (status code 200-299).
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    // Parse the JSON response from the backend.
    const data = await res.json();
    setResponse(data.status);
  } catch (err) {
    setResponse("Error contacting backend");
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

      {/* Implement drop-down menu for selecting machine learning model */}

      <div className="mt-4 flex space-x-4">
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

      {response && (
        <p className="mt-4 text-2xl text-white font-semibold">Du skrev siffran {response}</p>
      )}

      {/* Plots and statistics */}
    </div>
  );
}
