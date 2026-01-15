// components/Predict/Draw.tsx

// useRef is a hook that allows you to create a reference to a
// DOM element or a value that persists across renders.
import { useRef, type MouseEvent } from "react";


// In React,
// - refs are used to access DOM elements directly without causing re-renders of the component.
// - a refObject is an object with a .current property that points to a DOM element or a value.

// In C++, a reference is an alias to an existing object, allowing direct access and modification
// without creating a copy.

// Define the props type for the Draw component.
// canvasRef is an object with a .current property that points to
// an HTMLCanvasElement.
type DrawProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
};


// Define the Draw component that takes in canvasRef as a prop.
export default function Draw({ canvasRef }: DrawProps) {

  // Create a reference to the drawing state.
  // useRef is used here to avoid re-rendering the component for each mouse event.
  const isDrawingRef = useRef<boolean>(false);

  // Function to handle the start of drawing.
  const startDrawing = (e: MouseEvent) => {
    // Check if the canvas element exists.
    if (!canvasRef.current) return;
    // Set the drawing flag to true.
    isDrawingRef.current = true;
    // Get the CanvasRenderingContext2D object from the canvas.
    const ctx = canvasRef.current.getContext("2d");
    // Check if the context exists.
    if (ctx) {
      // Begin a new path and move to the mouse position.
      ctx.beginPath();
      // Move to the mouse position.
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  }

  // Function to handle the drawing action.
  const draw = (e: MouseEvent) => {
    // Check if we are currently drawing and if the canvas exists.
    if (!isDrawingRef.current || !canvasRef.current) return;
    // Get the CanvasRenderingContext2D object from the canvas.
    const ctx = canvasRef.current.getContext("2d");
    // Check if the context exists.
    if (ctx) {
      // Draw a line to the current mouse position and stroke it.
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    }
  }

  // Function to handle the end of drawing.
  const stopDrawing = () => {
    // Check if the canvas element exists.
    if (!canvasRef.current) return;
    // Set the drawing flag to false.
    isDrawingRef.current = false;
    // Get the CanvasRenderingContext2D object from the canvas.
    const ctx = canvasRef.current.getContext("2d");
    // Check if the context exists.
    if (ctx) {
      // Close the current path.
      ctx.closePath();
    }
  }

  // Render the canvas element with mouse event handlers.
  return (
    <div className="flex flex-col items-center min-h-screen space-y-4 text-white p-4">
      <h2 className="text-2xl font-bold">Play Page</h2>
      <p className="text-lg">Rita en siffra i rutan nedan</p>

      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="rounded-lg border-2 border-gray-500 cursor-crosshair"
      />

      {/* <div className="flex space-x-4 mt-4">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          Clear
        </button>
        <button
          onClick={Predict}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          Predict
        </button>
      </div>

      {prediction && (
        <h3 className="mt-4 text-xl">
          Du skrev en <span className="font-bold">{prediction}</span>
        </h3>
      )} */}

    </div>
  );
}
