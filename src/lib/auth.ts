import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseCore";

export type UserRole = "mother" | "doctor";

export type UserProfile = {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
};

export async function signUpWithEmailAndRole(params: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}): Promise<UserCredential> {
  const { email, password, name, role } = params;
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    name,
    role,
    createdAt: serverTimestamp(),
  });

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
    name: data.name,
  };
}
