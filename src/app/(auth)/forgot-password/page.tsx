"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { sendForgotPasswordEmail, resetPassword } from "@/actions/auth";
import { useRouter } from "next/navigation";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"request" | "verify" | "success">("request");
  
  // State for step 2
  const [sentEmail, setSentEmail] = useState("");
  const [serverToken, setServerToken] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onRequestSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const result = await sendForgotPasswordEmail(data);
      
      if (result.success && result.token) {
        setSentEmail(data.email);
        setServerToken(result.token);
        setStep("verify");
        toast.success("Password reset request sent!");
      } else {
        toast.error(result.error || "Failed to send request.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    // Verify OTP (Prototype basic check using base64)
    if (Buffer.from(otpInput).toString('base64') !== serverToken) {
      toast.error("Invalid OTP. Please check the email sent to the founder.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword({ email: sentEmail, newPassword });
      if (result.success) {
        setStep("success");
        toast.success("Password successfully reset!");
      } else {
        toast.error(result.error || "Failed to reset password.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-60 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px]"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="px-8 pt-10 pb-8 sm:px-10">
            
            {/* Header & Logo */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-5 overflow-hidden">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-poppins)" }}>
                {step === "request" && "Reset Password"}
                {step === "verify" && "Enter OTP"}
                {step === "success" && "Success!"}
              </h1>
              <p className="text-sm text-slate-500">
                {step === "request" && "Enter your email and we'll send an OTP to the founder."}
                {step === "verify" && `We've sent a 6-digit OTP to the founder for ${sentEmail}.`}
                {step === "success" && "Your password has been changed successfully."}
              </p>
            </div>

            {/* Form or Success Message */}
            {step === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-4 py-4"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-semibold text-primary">Request Sent</h3>
                <p className="text-sm text-slate-500">
                  You can now log in with your new password.
                </p>
                <Link 
                  href="/login"
                  className="w-full h-11 mt-4 rounded-xl bg-primary text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Return to Login
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            ) : step === "verify" ? (
              <form key="verify-form" onSubmit={onResetSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-primary/90">6-Digit OTP</label>
                  <input
                    value={otpInput || ""}
                    onChange={(e) => setOtpInput(e.target.value)}
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400 tracking-widest text-center text-lg font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-semibold text-primary/90">New Password</label>
                  <input
                    value={newPassword || ""}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 mt-6 rounded-xl bg-primary text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <KeyRound size={16} />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form key="request-form" onSubmit={form.handleSubmit(onRequestSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-primary/90">Email Address</label>
                  <input
                    {...form.register("email")}
                    type="email"
                    placeholder="you@company.com"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 mt-6 rounded-xl bg-primary text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Send Request
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
          
          {/* Footer */}
          {step === "request" && (
            <div className="px-8 py-5 sm:px-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
              <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          )}
          {step === "verify" && (
            <div className="px-8 py-5 sm:px-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
              <button 
                onClick={() => setStep("request")}
                className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={14} />
                Back to Email
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
