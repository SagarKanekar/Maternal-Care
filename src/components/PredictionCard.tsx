import type { PredictionDoc } from "../lib/firebaseData";

export function PredictionCard({ prediction }: { prediction: PredictionDoc | null }) {
  if (!prediction) {
    return <p className="text-sm text-gray-500">No predictions yet. Run the backend inference notebook.</p>;
  }

  return (
    <div className="space-y-2">
      <p>
        Predicted Status:{" "}
        <strong>{prediction.predictedStatus}</strong>
      </p>
      <ul className="text-sm">
        <li>Critical: {(prediction.criticalProb * 100).toFixed(2)}%</li>
        <li>Moderate: {(prediction.moderateProb * 100).toFixed(2)}%</li>
        <li>Best: {(prediction.bestProb * 100).toFixed(2)}%</li>
      </ul>
      <p className="text-xs text-gray-500">
        Window: {prediction.windowStartTs} → {prediction.windowEndTs}
      </p>
      <p className="text-xs text-gray-500">
        Model version: {prediction.modelVersion ?? "ctu-chb-v1"}
      </p>
    </div>
  );
}