import { getModel } from "./firebase";
import type { Item } from "./pantry";

export function shrinkImage(file: File, maxSize = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8).split(",")[1]);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === tries - 1) throw err;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw new Error("unreachable");
}

export async function snapAndTag(photo: File): Promise<Item[]> {
  const base64 = await shrinkImage(photo);
  console.log("data:image/jpeg;base64," + base64);
  const prompt = 'You are helping a food pantry log donations. Look at this photo and list every food or supply item you can see. Reply with ONLY a JSON array, no other words, like: [{"name": "black beans", "brand": "Goya 15.5 oz", "category": "canned", "quantity": 6}] name is the generic item name in lowercase. brand is the brand and size printed on the label; use "" if you cannot read it. category must be one of: canned, grain, baby, produce, hygiene, other. quantity is how many you can count. If you see no items, reply [].';
  const result = await withRetry(() => getModel().generateContent([prompt, { inlineData: { data: base64, mimeType: "image/jpeg" } }]));
  const text = result.response.text();
  console.log("AI said:", text);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as Item[];
}