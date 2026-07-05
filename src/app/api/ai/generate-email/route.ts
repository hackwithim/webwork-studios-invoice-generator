import { NextResponse } from "next/server";
import OpenAI from "openai";

// API Keys should be configured in environment variables
const MODEL_KEYS: Record<string, string> = {};

export async function POST(req: Request) {
  try {
    const { name, audience, model } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required to generate a draft." }, { status: 400 });
    }

    const selectedModel = model || "meta/llama-3.1-70b-instruct";
    const apiKey = MODEL_KEYS[selectedModel] || process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "NVIDIA_API_KEY is not configured in environment variables." }, { status: 500 });
    }

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
