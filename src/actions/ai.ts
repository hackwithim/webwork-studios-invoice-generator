"use server";

export async function generateAIText(prompt: string, context?: string) {
  const apiKey = process.env.NVIDIA_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: "NVIDIA_API_KEY is not configured in environment variables." };
  }

  const systemMessage = "You are a professional AI assistant integrated into a B2B invoicing application for Webwork Studios. Your job is to write crisp, highly professional, and perfectly formatted descriptions, terms, and notes for invoices, services, and products. Never output markdown formatting or bullet points unless requested. Keep it extremely concise and directly usable in a text input field.";

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "minimaxai/minimax-m3",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: context ? `Context: ${context}\n\nTask: ${prompt}` : prompt }
        ],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.95,
        stream: false,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NVIDIA API Error:", errorText);
      return { success: false, error: "Failed to generate text." };
    }

    const data = await response.json();
    return { 
      success: true, 
      text: data.choices[0]?.message?.content?.trim() || "" 
    };
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function draftOutreachMessage(lead: any, context: string, type: "email" | "whatsapp") {
  const prompt = `You are an expert sales representative for Webwork Studios.
Your goal is to write a highly converting, personalized ${type} outreach message to a new lead.
Keep it professional but approachable.

Lead Information:
Name: ${lead.name}
Company: ${lead.companyName || "N/A"}
Source: ${lead.source || "N/A"}

Additional Context: ${context}

${type === "whatsapp" ? "Keep it short, friendly, and suitable for a WhatsApp message (no subject line)." : "Include a catchy Subject Line (format: 'Subject: [Subject text]') and a well-structured email body."}
`;

  return generateAIText(prompt, "Draft a personalized outreach message based on the provided details.");
}
