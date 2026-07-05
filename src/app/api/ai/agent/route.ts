import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { getCompany } from "@/actions/company";

// Move API Keys to environment variables
const MODEL_KEYS: Record<string, string> = {};

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { messages, model } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const company = await getCompany();
    if (!company) {
      return NextResponse.json({ error: "Company context missing" }, { status: 400 });
    }
    const companyId = company.id;

    // 1. Fetch available contacts (Leads and Clients) to provide context to the AI
    const leads = await prisma.lead.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true, phone: true }
    });

    const clients = await prisma.client.findMany({
      where: { companyId },
      select: { id: true, clientName: true, email: true, phone: true }
    });

    const contactsList = [
      ...leads.map(l => `[LEAD] ID: ${l.id}, Name: ${l.name}, Email: ${l.email || 'N/A'}, Phone: ${l.phone || 'N/A'}`),
      ...clients.map(c => `[CLIENT] ID: ${c.id}, Name: ${c.clientName}, Email: ${c.email || 'N/A'}, Phone: ${c.phone || 'N/A'}`)
    ].join("\n");

    // 2. Call NVIDIA NIM to extract intent using Function Calling / JSON mode
    const systemMessage = `
You are an intelligent CRM AI Agent for Webwork Studios.
Your task is to parse the user's natural language request and determine if they are asking a question/chatting about the CRM, OR if they want to dispatch a message (EMAIL or WHATSAPP).

Here are the available contacts in the database:
${contactsList}

Rules:
1. If the user asks a question (e.g. "Who are my clients?", "How many leads do I have?"), use the CHAT action and answer conversationally based on the contacts list provided.
2. If the user wants to send a message, identify the best matching contact from the list above. 
3. If the user wants to send a message to a direct phone number or email address that isn't in the database, use it directly (targetType="DIRECT").
4. If no contact matches for a send request, return an ERROR action.
5. If the user doesn't specify a channel for sending, infer it (default to EMAIL if email is available, otherwise WHATSAPP if phone is available).
6. Output your response EXACTLY as a SINGLE JSON object matching this schema:
{
  "action": "CHAT" | "SEND_MESSAGE" | "ERROR",
  "channel": "EMAIL" | "WHATSAPP" | null,
  "targetId": "<The ID of the matched contact, or null if DIRECT/CHAT>",
  "targetType": "LEAD" | "CLIENT" | "DIRECT" | null,
  "directTo": "<The exact phone number or email address provided by the user, if targetType is DIRECT>",
  "subject": "<Subject line, only if channel is EMAIL>",
  "content": "<The drafted message body, the conversational response, or error message>"
}
OUTPUT NOTHING BUT THE RAW JSON OBJECT. NO EXPLANATIONS. NO PREAMBLE. NO CONVERSATIONAL TEXT.`;

    const selectedModel = model || "meta/llama-3.1-70b-instruct";
    const apiKey = MODEL_KEYS[selectedModel] || process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "NVIDIA_API_KEY is not configured in environment variables." }, { status: 500 });
    }

    // Instantiate client dynamically per request to use the correct API key
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: "system", content: systemMessage },
        ...messages
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    const aiResponseText = completion.choices[0]?.message?.content || "";
    
    // Clean up potential markdown formatting from the response
    let cleanJsonString = aiResponseText.replace(/```json\n?|```\n?/g, "").trim();
    
    let parsedIntent: any;
    try {
      parsedIntent = JSON.parse(cleanJsonString);
    } catch (e) {
      // Fallback: try finding the last { ... } by manually looking backwards
      let found = false;
      let braceCount = 0;
      let endIndex = cleanJsonString.lastIndexOf('}');
      let startIndex = -1;
      
      if (endIndex !== -1) {
        for (let i = endIndex; i >= 0; i--) {
          if (cleanJsonString[i] === '}') braceCount++;
          if (cleanJsonString[i] === '{') braceCount--;
          if (braceCount === 0) {
            startIndex = i;
            break;
          }
        }
      }
      
      if (startIndex !== -1 && endIndex !== -1) {
         try {
           parsedIntent = JSON.parse(cleanJsonString.substring(startIndex, endIndex + 1));
           found = true;
         } catch(e3) { }
      }
      
      if (!found) {
        console.error("AI JSON Parse Error:", aiResponseText);
        return NextResponse.json({ error: "Failed to parse AI response.", raw: aiResponseText }, { status: 500 });
      }
    }

    if (parsedIntent.action === "ERROR") {
      return NextResponse.json({ error: parsedIntent.content || "AI could not determine a valid action." }, { status: 400 });
    }

    if (parsedIntent.action === "CHAT") {
      return NextResponse.json({ 
        success: true, 
        is_chat: true, 
        message: parsedIntent.content,
        ai_intent: parsedIntent 
      });
    }

    if (parsedIntent.action !== "SEND_MESSAGE") {
      return NextResponse.json({ error: "AI could not determine a valid action." }, { status: 400 });
    }

    let targetContact;
    if (parsedIntent.targetType === "DIRECT") {
      targetContact = {
        id: "direct",
        name: "Direct Contact",
        email: parsedIntent.channel === "EMAIL" ? parsedIntent.directTo : null,
        phone: parsedIntent.channel === "WHATSAPP" ? parsedIntent.directTo : null,
      };
    } else {
      targetContact = parsedIntent.targetType === "LEAD" 
        ? leads.find(l => l.id === parsedIntent.targetId)
        : clients.find(c => c.id === parsedIntent.targetId);

      if (!targetContact) {
        return NextResponse.json({ error: "AI identified a contact that does not exist." }, { status: 404 });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 3. Dispatch the message
    if (parsedIntent.channel === "WHATSAPP") {
      if (!targetContact.phone) {
        return NextResponse.json({ error: "Target contact does not have a phone number." }, { status: 400 });
      }

      const res = await fetch(`${appUrl}/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: targetContact.phone,
          text: parsedIntent.content,
          leadId: parsedIntent.targetType === "LEAD" ? targetContact.id : undefined,
          clientId: parsedIntent.targetType === "CLIENT" ? targetContact.id : undefined,
        })
      });

      const result = await res.json();
      
      if (!res.ok) {
        return NextResponse.json({ error: result.error || "Failed to dispatch WhatsApp message." }, { status: res.status });
      }

      return NextResponse.json({ 
        success: true, 
        message: `Successfully dispatched WhatsApp to ${(targetContact as any).name || (targetContact as any).clientName}`,
        ai_intent: parsedIntent,
        dispatch_result: result 
      });

    } else if (parsedIntent.channel === "EMAIL") {
      if (!targetContact.email) {
        return NextResponse.json({ error: "Target contact does not have an email address." }, { status: 400 });
      }

      const res = await fetch(`${appUrl}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: targetContact.email,
          subject: parsedIntent.subject || "Webwork Studios Communication",
          text: parsedIntent.content,
          leadId: parsedIntent.targetType === "LEAD" ? targetContact.id : undefined,
          clientId: parsedIntent.targetType === "CLIENT" ? targetContact.id : undefined,
        })
      });

      const result = await res.json();

      if (!res.ok) {
        return NextResponse.json({ error: result.error || "Failed to dispatch Email message." }, { status: res.status });
      }

      return NextResponse.json({ 
        success: true, 
        message: `Successfully dispatched Email to ${(targetContact as any).name || (targetContact as any).clientName}`,
        ai_intent: parsedIntent,
        dispatch_result: result 
      });
    }

    return NextResponse.json({ error: "Invalid channel selected by AI." }, { status: 400 });

  } catch (error: any) {
    console.error("AI Agent Error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
