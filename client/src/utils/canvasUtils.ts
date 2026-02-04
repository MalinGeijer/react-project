import React, { type RefObject } from "react";
import type { PredictionResult } from "./types";

export const startDrawing = (
  e: React.MouseEvent,
  ctxRef: RefObject<CanvasRenderingContext2D | null>,
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!ctxRef.current) return;
  setIsDrawing(true);
  ctxRef.current.beginPath();
  ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
};

export const draw = (
  e: React.MouseEvent,
  ctxRef: RefObject<CanvasRenderingContext2D | null>,
  isDrawing: boolean
) => {
  if (!isDrawing || !ctxRef.current) return;
  ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  ctxRef.current.stroke();
};

export const stopDrawing = (
  ctxRef: RefObject<CanvasRenderingContext2D | null>,
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!ctxRef.current) return;
  setIsDrawing(false);
  ctxRef.current.closePath();
};

export const clearCanvas = (
  ctxRef: RefObject<CanvasRenderingContext2D | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  setResult: React.Dispatch<React.SetStateAction<PredictionResult | null>>,
  setLabel: React.Dispatch<React.SetStateAction<number | null>>
) => {
  if (!ctxRef.current || !canvasRef.current) return;
  ctxRef.current.fillStyle = "black";
  ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  setResult(null);
  setLabel(null);
};
