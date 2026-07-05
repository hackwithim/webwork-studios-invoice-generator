import { Client, LocalAuth } from "whatsapp-web.js";

// Ensure global scope for Next.js hot-reloading
declare global {
  var whatsappClient: Client | undefined;
  var whatsappStatus: "disconnected" | "generating_qr" | "connected";
  var whatsappQR: string | null;
  var whatsappError: string | null;
}

if (!global.whatsappStatus) {
  global.whatsappStatus = "disconnected";
  global.whatsappQR = null;
  global.whatsappError = null;
}

export const getWhatsAppClient = (): Client => {
  if (global.whatsappClient) {
    return global.whatsappClient;
  }

  console.log("[WhatsApp] Initializing new client...");
  global.whatsappStatus = "generating_qr";
  global.whatsappError = null;
  
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: "webwork-crm" }),
    puppeteer: {
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      ],
    }
  });

  client.on("qr", (qr) => {
    console.log("[WhatsApp] QR Code Received!");
    global.whatsappQR = qr;
    global.whatsappStatus = "generating_qr";
  });

  client.on("ready", () => {
    console.log("[WhatsApp] Client is ready and connected!");
    global.whatsappStatus = "connected";
    global.whatsappQR = null;
  });

  client.on("authenticated", () => {
    console.log("[WhatsApp] Authenticated successfully.");
    global.whatsappStatus = "connected";
    global.whatsappQR = null;
  });

  client.on("auth_failure", (msg) => {
    console.error("[WhatsApp] Authentication failure", msg);
    global.whatsappStatus = "disconnected";
    global.whatsappQR = null;
  });

  client.on("disconnected", (reason) => {
    console.log("[WhatsApp] Client disconnected", reason);
    global.whatsappStatus = "disconnected";
    global.whatsappQR = null;
    
    // Attempt to re-initialize or clear instance
    global.whatsappClient = undefined;
  });

  // Start the initialization process
  client.initialize().catch(err => {
    console.error("[WhatsApp] Initialization error:", err);
    global.whatsappStatus = "disconnected";
    global.whatsappError = err.message || "Failed to launch WhatsApp engine.";
    global.whatsappClient = undefined;
  });

  global.whatsappClient = client;
  return client;
};

export const getWhatsAppStatus = () => {
  return {
    status: global.whatsappStatus,
    qr: global.whatsappQR,
    error: global.whatsappError
  };
};

export const disconnectWhatsApp = async () => {
  if (global.whatsappClient) {
    try {
      await global.whatsappClient.logout();
      await global.whatsappClient.destroy();
    } catch (e) {
      console.error("Error logging out", e);
    }
    global.whatsappClient = undefined;
    global.whatsappStatus = "disconnected";
    global.whatsappQR = null;
  }
};

export const sendWhatsAppMessage = async (to: string, message: string) => {
  const client = getWhatsAppClient();
  
  if (global.whatsappStatus !== "connected") {
    throw new Error("WhatsApp client is not connected.");
  }

  // Format the number: whatsapp-web.js requires country code + number + "@c.us"
  // Remove non-numeric characters
  let cleanNumber = to.replace(/\D/g, "");
  
  // Default to Indian country code if only 10 digits are provided
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }

  const chatId = `${cleanNumber}@c.us`;

  try {
    await client.sendMessage(chatId, message);
  } catch (err: any) {
    if (err.message && err.message.includes("detached Frame")) {
      console.error("[WhatsApp] Puppeteer frame detached. Destroying client to allow re-initialization.");
      try { await client.destroy(); } catch (e) {}
      global.whatsappClient = undefined;
      global.whatsappStatus = "disconnected";
      throw new Error("WhatsApp connection was lost due to a background process reset. Please try sending the message again (it will auto-reconnect).");
    }
    if (err.message && err.message.includes("No LID for user")) {
      throw new Error(`The phone number +${cleanNumber} is not registered on WhatsApp, or the format is invalid.`);
    }
    throw err;
  }
};
