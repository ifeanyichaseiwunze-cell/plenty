"use client";
import { useState } from "react";
import { snapAndTag } from "@/lib/snap";
import { joinPantry, addItems } from "@/lib/pantry";
import type { Item } from "@/lib/pantry";

export default function Home() {
  const [code, setCode] = useState("");
  const [pantryId, setPantryId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleJoin() {
    const pantry = await joinPantry(code);
    if (!pantry) {
      setMessage("Wrong code");
      return;
    }
    setPantryId(pantry.id);
    localStorage.setItem("pantryId", pantry.id);
    setMessage("");
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const photo = e.target.files?.[0];
    if (!photo) return;
    setLoading(true);
    setMessage("");
    try {
      setItems(await snapAndTag(photo));
    } catch (err) {
      setMessage("Couldn't read that photo: " + String(err));
    }
    setLoading(false);
  }

  function updateItem(i: number, field: string, value: string) {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: field === "quantity" ? Number(value) : value } as Item;
    setItems(copy);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, j) => j !== i));
  }

  async function handleSave() {
    await addItems(pantryId, items);
    setItems([]);
    setMessage("Added to stock!");
  }

  if (!pantryId) {
    return (
      <main className="p-10 space-y-4">
        <h1 className="text-3xl font-bold">Join your pantry</h1>
        <input className="border p-2" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
        <button className="border p-2 ml-2" onClick={handleJoin}>Join</button>
        {message && <p className="text-red-500">{message}</p>}
      </main>
    );
  }

  return (
    <main className="p-10 space-y-4">
      <h1 className="text-3xl font-bold">📷 Snap a donation</h1>
      <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} />
      {loading && <p>Looking at the photo...</p>}
      {message && <p>{message}</p>}
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input className="border p-1 w-16" type="number" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} />
          <input className="border p-1" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} />
          <input className="border p-1" value={item.brand ?? ""} onChange={(e) => updateItem(i, "brand", e.target.value)} />
          <select className="border p-1" value={item.category} onChange={(e) => updateItem(i, "category", e.target.value)}>
            {["canned", "grain", "baby", "produce", "hygiene", "other"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => removeItem(i)}>❌</button>
        </div>
      ))}
      {items.length > 0 && <button className="border p-2" onClick={handleSave}>Add to stock</button>}
    </main>
  );
}