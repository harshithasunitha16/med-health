import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `
You are "Healthy", the official AI Health Assistant for MedVault.
MedVault is a digital health record system. 
Your goal is to help users understand their health, provide wellness tips, and explain medical terminology simply.

Rules:
1. Be professional, empathetic, and encouraging.
2. ALWAYS provide a disclaimer: "I am an AI assistant, not a doctor. For emergencies, call your local emergency services immediately."
3. Do not prescribe specific medications.
4. If a user asks about their specific records in MedVault, explain that you don't have direct access to their private files for security reasons, but you can help interpret general medical terms or reports if they describe them.
5. Keep responses concise and formatted for mobile viewing (use bullet points).
`;

export async function chatWithHealthu(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Inject system prompt into history or as the first message if empty
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: `System Instruction: ${SYSTEM_PROMPT}` }] },
        { role: 'model', parts: [{ text: "Understood. I am Healthu, your MedVault assistant. How can I help you today?" }] },
        ...history
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Healthu Error:", error);
    throw new Error("I'm feeling a bit under the weather. Please try again in a moment.");
  }
}
