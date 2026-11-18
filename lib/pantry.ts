import { signInAnonymously } from "firebase/auth";
import { setDoc, doc, collection, addDoc, serverTimestamp, query, where, getDocs, increment } from "firebase/firestore";
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
export type Item = {
    name: string;
    category: string;
    quantity: number;
};

function itemId(name: string) : string{
    return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export async function addItems(pantryId: string, items: Item[]) {
    for (const item of items) {
        const ref = doc(db, "pantries", pantryId, "stock", itemId(item.name));
        await setDoc(ref, {
            name: item.name.toLowerCase(),
            category: item.category,
            quantity: increment(item.quantity),
            updatedAt: serverTimestamp(),
        }, { merge: true });
    }
}

export async function getStock(pantryId: string) {
    const snap = await getDocs(collection(db, "pantries", pantryId, "stock"));
    return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Item),
    }));
}

export type StockItem = Item & { id: string };

const LOW_AT: Record<string, number> = {
    baby: 10,
    canned: 20,
    grain: 15,
    produce: 10,
    hygiene: 10,
};

export function getLowItems(stock: StockItem[]): StockItem[] {
    return stock
        .filter((i) => i.quantity < (LOW_AT[i.category] ?? 10))
        .sort((a, b) => a.quantity - b.quantity);
}