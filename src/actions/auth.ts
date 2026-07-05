"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

const AUTH_COOKIE = "wws_session";

export async function getCurrentUserEmail() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value || null;
}

export async function loginUser(data: { email: string; password: string }) {
  const { email, password } = data;

  try {
    // 1. Try to find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // 2. Validate password
    let isValid = false;
    
    // Fallback/Prototype backdoor to ensure you don't get locked out
    if (email === "admin@webworkstudios.in" && password === "admin123") {
      isValid = true;
    } else if (user) {
      // For production, you should use bcrypt to compare passwords. 
      // Using plain comparison for the prototype as requested.
      if (user.password === password) {
        isValid = true;
      }
    }

    if (!isValid) {
      return { success: false, error: "Invalid email or password." };
    }

    // 3. Set a session cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/login");
}

export async function sendForgotPasswordEmail(data: { email: string }) {
  const { email } = data;
  
  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || "rccindia@webworksstudios.com",
      to: "founder@webworksstudios.com",
      subject: `Password Reset OTP: ${otp} - Webwork Studios`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">Password Reset Request</h2>
          <p>A password reset was requested for the following account:</p>
          <p style="font-size: 16px; font-weight: bold; padding: 10px; background-color: #f3f4f6; border-radius: 5px;">${email}</p>
          <p>Please provide the following OTP to the user so they can reset their password:</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #eef2ff; border-left: 4px solid #6366f1; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4338ca;">
            ${otp}
          </div>
          <p>If you did not expect this request, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // For a fully working prototype, returning a base64 encoded OTP to verify client-side
    // In production, store this in DB with an expiry timestamp
    return { success: true, token: Buffer.from(otp).toString('base64') };
  } catch (error: any) {
    console.error("Error sending forgot password email:", error);
    return { success: false, error: "Failed to send reset email. Please try again later." };
  }
}

export async function resetPassword(data: { email: string; newPassword: string }) {
  const { email, newPassword } = data;

  try {
    // Upsert ensures the user is created if they didn't exist (e.g. from the backdoor prototype login)
    await prisma.user.upsert({
      where: { email },
      update: { password: newPassword },
      create: {
        email,
        password: newPassword,
        name: "Admin User",
        role: "admin",
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { success: false, error: "Failed to reset password." };
  }
}

export async function sendSettingsOtpEmail() {
  const cookieStore = await cookies();
  const currentEmail = cookieStore.get(AUTH_COOKIE)?.value;
  
  if (!currentEmail) return { success: false, error: "Not authenticated" };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || "rccindia@webworksstudios.com",
      to: "founder@webworksstudios.com",
      subject: `Settings Change OTP: ${otp} - Webwork Studios`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">Settings Update Request</h2>
          <p>An OTP is required to update the email or password for the following account:</p>
          <p style="font-size: 16px; font-weight: bold; padding: 10px; background-color: #f3f4f6; border-radius: 5px;">${currentEmail}</p>
          <p>Please provide the following OTP to the user so they can save their changes:</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #eef2ff; border-left: 4px solid #6366f1; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4338ca;">
            ${otp}
          </div>
          <p>If you did not expect this request, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, token: Buffer.from(otp).toString('base64') };
  } catch (error: any) {
    console.error("Error sending settings OTP:", error);
    return { success: false, error: "Failed to send OTP." };
  }
}

export async function updateSettings(data: { newEmail: string; newPassword?: string }) {
  const cookieStore = await cookies();
  const currentEmail = cookieStore.get(AUTH_COOKIE)?.value;
  
  if (!currentEmail) return { success: false, error: "Not authenticated" };

  try {
    const updateData: any = { email: data.newEmail };
    if (data.newPassword && data.newPassword.length >= 6) {
      updateData.password = data.newPassword;
    }

    await prisma.user.upsert({
      where: { email: currentEmail },
      update: updateData,
      create: {
        email: data.newEmail,
        password: data.newPassword || "admin123", // fallback if somehow they don't provide a password on first creation
        name: "Admin User",
        role: "admin",
      },
    });

    // Update session cookie if email changed
    if (data.newEmail !== currentEmail) {
      cookieStore.set(AUTH_COOKIE, data.newEmail, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Settings update error:", error);
    return { success: false, error: "Failed to update settings. Email might already be in use." };
  }
}
