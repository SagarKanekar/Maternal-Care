import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebaseCore";
import type { Assignment, UserProfile } from "@/lib/auth";

export type AssignmentView = {
  motherUid: string;
  motherName: string;
  motherEmail: string;
  assignedDoctorUid: string | null;
  assignedDoctorName: string | null;
  assignmentId: string | null;
};

export async function fetchDoctors(): Promise<UserProfile[]> {
  const q = query(collection(db, "users"), where("role", "==", "doctor"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
}

export async function fetchMothers(): Promise<UserProfile[]> {
  const q = query(collection(db, "users"), where("role", "==", "mother"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
}

export async function fetchActiveAssignments(): Promise<Assignment[]> {
  const q = query(collection(db, "assignments"), where("status", "==", "active"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Assignment));
}

/**
 * Upsert an active assignment for a mother.
 * If an active assignment already exists for that mother, reuse its doc ID.
 * Otherwise create a new doc.
 */
export async function assignDoctorToMother(
  motherUid: string,
  doctorUid: string,
  adminUid: string
): Promise<void> {
  // Find existing active assignment for this mother
  const q = query(
    collection(db, "assignments"),
    where("motherUid", "==", motherUid),
    where("status", "==", "active"),
    limit(1)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    // Update existing doc
    const existingDoc = snap.docs[0];
    await setDoc(
      doc(db, "assignments", existingDoc.id),
      {
        doctorUid,
        assignedAt: serverTimestamp(),
        assignedBy: adminUid,
      },
      { merge: true }
    );
  } else {
    // Create new doc
    const newRef = doc(collection(db, "assignments"));
    await setDoc(newRef, {
      motherUid,
      doctorUid,
      status: "active",
      assignedAt: serverTimestamp(),
      assignedBy: adminUid,
    });
  }
}
