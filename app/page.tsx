"use client"; 
import { useState } from "react";
import { getModel } from "@/lib/firebase";

export default function Home() {
  const [answer, setAnswer] = useState(""); 
  const [loading, setLoading] = useState(false); 

  async function testAI() {
    setLoading(true);
    try {
      const result = await getModel().generateContent("Say hello to a food pantry volunteer in Spanish, one sentence.");
      setAnswer(result.response.text()); 
    } catch (err) {
      setAnswer("Error: " + String(err)); 
    }
    setLoading(false);
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4">Plenty: AI test</h1>
      <button onClick={testAI} className="bg-green-700 text-white px-4 py-2 rounded">
        {loading ? "Thinking..." : "Test Gemini"}
      </button>
      <p className="mt-6 text-lg">{answer}</p>
    </main>
  );
}