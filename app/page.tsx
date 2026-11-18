"use client";
import { useState } from "react";
import { createPantry, joinPantry, addItems, getStock, getLowItems } from "@/lib/pantry";

export default function Home() {
  const [result, setResult] = useState("");        // what to show
  const [code, setCode] = useState("");            // typed code
  const [pantryId, setPantryId] = useState("");    // which pantry we're in

  async function testCreate() {
    const p = await createPantry("Test Pantry", "123 Main St, Wylie TX");
    setResult("Created! Code: " + p.code);
  }

  async function testJoin() {
    const p = await joinPantry(code);
    if (!p) return setResult("Wrong code");
    setPantryId(p.id);                              // remember which pantry
    setResult("Joined pantry " + p.id);
  }

  async function testDonation() {
    await addItems(pantryId, [                      // a fake donation
      { name: "Black Beans", category: "canned", quantity: 6 },
      { name: "Diapers", category: "baby", quantity: 3 },
      { name: "Rice", category: "grain", quantity: 30 },
    ]);
    setResult("Donation added!");
  }

  async function testStock() {
    const stock = await getStock(pantryId);         // everything
    const low = getLowItems(stock);                 // just the low ones
    setResult("STOCK: " + JSON.stringify(stock) + "  LOW: " + low.map((i) => i.name).join(", "));
  }

  return (
    <main className="p-10 space-y-4">
      <h1 className="text-3xl font-bold">Plenty: stock test</h1>
      <button onClick={testCreate} className="bg-green-700 text-white px-4 py-2 rounded">Create pantry</button>
      <div className="flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code"
          className="border px-3 py-2 rounded text-black" />
        <button onClick={testJoin} className="bg-orange-600 text-white px-4 py-2 rounded">Join</button>
      </div>
      <div className="flex gap-2">
        <button onClick={testDonation} disabled={!pantryId} className="bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-40">Add donation</button>
        <button onClick={testStock} disabled={!pantryId} className="bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-40">Show stock</button>
      </div>
      <p className="text-lg break-all">{result}</p>
    </main>
  );
}