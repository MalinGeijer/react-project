import React from "react";
import { probabilityToColor } from "../../utils/colorUtils";

interface Probability {
  digit: number;
  prob: number;
}

interface ProbabilityHeatmapProps {
  probabilities: Probability[];
}

export const ProbabilityHeatmap: React.FC<ProbabilityHeatmapProps> = ({ probabilities }) => {
  return (
    <div className="mt-4">
      <p className="text-sm font-medium mb-2">Probability heatmap</p>

      <div className="grid grid-cols-10 gap-1">
        {probabilities.map((p) => (
          <div
            key={p.digit}
            className="h-16 flex flex-col items-center justify-center rounded text-xs font-semibold"
            style={{
              backgroundColor: probabilityToColor(p.prob),
              color: p.prob > 0.5 ? "white" : "black",
            }}
          >
            <div>{p.digit}</div>
            <div>{(p.prob * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};
