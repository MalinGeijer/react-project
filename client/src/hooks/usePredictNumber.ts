import type { RefObject } from "react";
import type { PredictionResult } from "../utils/types";

export const usePredictNumber = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  model: string,
  setResult: React.Dispatch<React.SetStateAction<PredictionResult | null>>
) => {
  const predictNumber = async () => {
    if (!canvasRef.current) return;

    const image = canvasRef.current.toDataURL("image/png");

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, model }),
      });

      console.log("Sending image to backend for prediction, model=", model);

      if (!res.ok) throw new Error(`Backend error: ${res.status}`);

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Error contacting backend" });
      console.error(err);
      setResult({ error: "Error contacting backend" });
    }
  };

  return predictNumber;
};
