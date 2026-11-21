import { getModel } from "./firebase";
import type { Item } from "./pantry";

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function snapAndTag(photo: File): Promise<Item[]> {
  const base64 = await fileToBase64(photo);
  const prompt = 'You are helping a food pantry log donations. Look at this photo and list every food or supply item you can see. Reply with ONLY a JSON array, no other words, like: [{"name": "black beans", "brand": "Goya 15.5 oz", "category": "canned", "quantity": 6}] name is the generic item name in lowercase. brand is the brand and size printed on the label; use "" if you cannot read it. category must be one of: canned, grain, baby, produce, hygiene, other. quantity is how many you can count. If you see no items, reply [].';
  const result = await getModel().generateContent([prompt, { inlineData: { data: base64, mimeType: photo.type } }]);
  const text = result.response.text();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as Item[];
}