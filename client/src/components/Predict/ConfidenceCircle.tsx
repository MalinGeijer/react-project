import React from "react";
import { probabilityToColor } from "../../utils/colorUtils";

interface ConfidenceCircleProps {
  confidence: number;
}

export const ConfidenceCircle: React.FC<ConfidenceCircleProps> = ({ confidence }) => {
  const p = Math.max(0, Math.min(1, confidence));
  const percent = Math.round(p * 100);
  const backgroundColor = probabilityToColor(p);

  return (
    <div className="flex items-center justify-center mt-2">
      <div
        className="w-18 h-12 rounded-full flex items-center justify-center text-black text-xl"
        style={{ backgroundColor }}
      >
        {percent}%
      </div>
    </div>
  );
};
