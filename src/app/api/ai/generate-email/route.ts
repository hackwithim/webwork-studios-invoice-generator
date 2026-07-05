import { NextResponse } from "next/server";
import OpenAI from "openai";

// Try to use the same MODEL_KEYS dictionary logic as the agent
const MODEL_KEYS: Record<string, string> = {
  "z-ai/glm-5.2": "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",
  "minimaxai/minimax-m3": "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",
  "google/diffusiongemma-26b-a4b-it": "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",
  "moonshotai/kimi-k2.6": "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",
  "deepseek-ai/deepseek-v4-pro": "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",
  "deepseek-ai/deepseek-v4-flash": "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",
  "google/gemma-4-31b-it": "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",
};

export async function POST(req: Request) {
  try {
    const { name, audience, model } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required to generate a draft." }, { status: 400 });
    }

    const selectedModel = model || "meta/llama-3.1-70b-instruct";
    const fallbackNvidiaKey = "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";
    const apiKey = MODEL_KEYS[selectedModel] || process.env.NVIDIA_API_KEY || fallbackNvidiaKey;

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });

    const systemPrompt = `You are an expert email marketing copywriter. 
Generate a compelling email subject line and email body for a campaign.
The campaign name/topic is: "${name}"
The target audience is: "${audience}"

Use a professional but engaging tone. Keep it concise.
Available variables for personalization: {first_name}, {company_name}.
Output your response as a valid JSON object EXACTLY like this:
{
  "subject": "The generated subject line here",
  "content": "The generated email body here. Use newlines (\\n) for paragraphs."
}
NO other text, NO markdown formatting around the JSON. ONLY RAW JSON.`;

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate the email draft now." }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiResponseText = completion.choices[0]?.message?.content || "";
    
    // Clean up potentially wrapped markdown JSON
    let cleanJsonString = aiResponseText.trim();
    if (cleanJsonString.startsWith("```json")) {
      cleanJsonString = cleanJsonString.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanJsonString.startsWith("```")) {
      cleanJsonString = cleanJsonString.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsed = null;
    try {
      parsed = JSON.parse(cleanJsonString);
    } catch (e) {
      // fallback manual parsing
      const start = cleanJsonString.indexOf("{");
      const end = cleanJsonString.lastIndexOf("}");
      if (start >= 0 && end > start) {
        parsed = JSON.parse(cleanJsonString.substring(start, end + 1));
      } else {
        throw e;
      }
    }

    return NextResponse.json({
      subject: parsed.subject || "",
      content: parsed.content || "",
    });
  } catch (error: any) {
    console.error("AI Email Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate email" }, { status: 500 });
  }
}
