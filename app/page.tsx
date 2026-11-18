"use client";
import { useState } from "react";
import { createPantry, joinPantry } from "@/lib/pantry";

export default function Home() {
  const [result, setResult] = useState("");   // what to show on screen
  const [code, setCode] = useState("");       // the code typed in the box

  async function testCreate() {
    const p = await createPantry("Test Pantry", "123 Main St, Wylie TX"); // fake pantry
    setResult("Created! Code: " + p.code);                                // show its code
  }

  async function testJoin() {
    const p = await joinPantry(code);                                     // look up the typed code
    setResult(p ? "Joined: " + JSON.stringify(p) : "Wrong code");         // show the pantry or "Wrong code"
  }

  return (
    <main className="p-10 space-y-4">
      <h1 className="text-3xl font-bold">Plenty: pantry test</h1>
      <button onClick={testCreate} className="bg-green-700 text-white px-4 py-2 rounded">Create pantry</button>
      <div className="flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code"
          className="border px-3 py-2 rounded text-black" />
        <button onClick={testJoin} className="bg-orange-600 text-white px-4 py-2 rounded">Join</button>
      </div>
      <p className="text-lg break-all">{result}</p>
    </main>
  );
}