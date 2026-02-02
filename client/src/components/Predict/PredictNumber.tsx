import type { RefObject } from "react";
import type { PredictionResult } from "../../utils/types";

export const predictNumber = async (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  model: string,
  setResult: React.Dispatch<React.SetStateAction<PredictionResult | null>>
) => {
  if (!canvasRef.current) return;

  // Check if canvas is empty (only black background)
  const ctx = canvasRef.current.getContext("2d");
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
    setResult({ info: "You need to draw a number first!" });
    return;
  }

  const image = canvasRef.current.toDataURL("image/png");

  try {
    const res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, model }),
    });

    const data = await res.json();
    setResult(data);
  } catch (err) {
    setResult({ error: "Error contacting backend" });
    console.error(err);
  }
};
