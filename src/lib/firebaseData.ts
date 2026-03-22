import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  onSnapshot as onDocSnapshot,
} from "firebase/firestore";
import { db } from "./firebaseCore";

export type PredictionDoc = {
  id: string;
  windowDocId: string;
  patientId: string;
  windowStartTs?: string;
  windowEndTs?: string;
  predictedStatus: string;
  criticalProb: number;
  moderateProb: number;
  bestProb: number;
  modelVersion?: string;
  createdAt?: string;
};

// Subscribe to the latest prediction (ordered by createdAt)
export function subscribeLatestPrediction(
  cb: (pred: PredictionDoc | null) => void
): () => void {
  const q = query(
    collection(db, "predictions"),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      cb(null);
      return;
    }
    const d = snap.docs[0];
    const data = d.data() as Omit<PredictionDoc, "id">;
    cb({ id: d.id, ...data });
  });
}

// Optional: subscribe to current sensor snapshot (if you have such a doc)
export function subscribeCurrentSensorData(
  cb: (data: any | null) => void
): () => void {
  // adjust path if you use another collection/doc structure
  const ref = doc(db, "Sensor_data", "current");

  return onDocSnapshot(ref, (snap) => {
    cb(snap.exists() ? snap.data() : null);
  });
}

// Optional: subscribe to recent sensor_logs_10s windows
export function subscribeRecentSensorLogs(
  limitN: number,
  cb: (logs: any[]) => void
): () => void {
  const q = query(
    collection(db, "sensor_logs_10s"),
    orderBy("windowEndTs", "desc"),
    limit(limitN)
  );

  return onSnapshot(q, (snap) => {
    const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(logs);
  });
}