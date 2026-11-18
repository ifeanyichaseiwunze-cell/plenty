import { signInAnonymously } from "firebase/auth";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";

function makeCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createPantry(name: string, address: string) {
  await signInAnonymously(auth);
  const code = makeCode();
  const ref = await addDoc(collection(db, "pantries"), {
    name,
    address,
    code,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, code };
}

export async function joinPantry(code: string) {
  await signInAnonymously(auth);
  const q = query(collection(db, "pantries"), where("code", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}