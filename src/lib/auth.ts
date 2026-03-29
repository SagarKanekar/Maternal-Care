import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebaseCore";

export type UserRole = "mother" | "doctor";

export type UserProfile = {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  displayName?: string;
  status?: string;
};

export type DoctorProfile = {
  uid: string;
  doctorId: string;
  licenseNumber?: string;
  specialization?: string;
  hospitalName?: string;
  phone?: string;
  verificationStatus?: string;
  createdAt?: any;
};

export type MotherProfile = {
  uid: string;
  phone?: string;
  emergencyContact?: string;
  createdAt?: any;
};

export type Assignment = {
  id: string;
  doctorUid: string;
  motherUid: string;
  assignedBy?: string;
  assignedAt?: any;
  status: "active" | "inactive";
};

export async function signUpWithEmailAndRole(params: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  // Doctor-specific optional fields
  doctorId?: string;
  licenseNumber?: string;
  specialization?: string;
  hospitalName?: string;
  phone?: string;
}): Promise<UserCredential> {
  const { email, password, name, role, doctorId, licenseNumber, specialization, hospitalName, phone } = params;
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  // Write shared user doc
  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    name,
    displayName: name,
    role,
    status: "active",
    createdAt: serverTimestamp(),
  });

  // Write role-specific profile
  if (role === "doctor") {
    await setDoc(doc(db, "doctor_profiles", uid), {
      uid,
      doctorId: doctorId ?? "",
      licenseNumber: licenseNumber ?? "",
      specialization: specialization ?? "",
      hospitalName: hospitalName ?? "",
      phone: phone ?? "",
      verificationStatus: "pending",
      createdAt: serverTimestamp(),
    });
  } else {
    await setDoc(doc(db, "mother_profiles", uid), {
      uid,
      phone: phone ?? "",
      emergencyContact: "",
      createdAt: serverTimestamp(),
    });
  }

  return cred;
}

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutCurrentUser() {
  return signOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) {
    return null;
  }

  const data = snap.data() as Omit<UserProfile, "uid">;
  return {
    uid,
    email: data.email,
    role: data.role,
    name: data.name ?? data.displayName ?? "",
    displayName: data.displayName ?? data.name ?? "",
    status: data.status,
  };
}

export async function getDoctorProfile(uid: string): Promise<DoctorProfile | null> {
  const snap = await getDoc(doc(db, "doctor_profiles", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as DoctorProfile;
}

export async function getMotherProfile(uid: string): Promise<MotherProfile | null> {
  const snap = await getDoc(doc(db, "mother_profiles", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as MotherProfile;
}

export async function getActiveAssignmentsForDoctor(doctorUid: string): Promise<Assignment[]> {
  const q = query(
    collection(db, "assignments"),
    where("doctorUid", "==", doctorUid),
    where("status", "==", "active")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Assignment));
}
