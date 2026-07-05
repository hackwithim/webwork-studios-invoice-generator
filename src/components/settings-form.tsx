"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { sendSettingsOtpEmail, updateSettings, getCurrentUserEmail } from "@/actions/auth";

export default function SettingsForm() {
  const [currentEmail, setCurrentEmail] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"edit" | "verify">("edit");
  
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState("");
  
  const [otpInput, setOtpInput] = useState("");
  const [serverToken, setServerToken] = useState("");

  useEffect(() => {
    getCurrentUserEmail().then(email => {
      if (email) {
        setCurrentEmail(email);
        setEmail(email);
      }
      setIsInitializing(false);
    });
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email cannot be empty.");
      return;
    }
    
    // Only request OTP if there are changes
    if (email === currentEmail && !password) {
      toast.info("No changes to save.");
      return;
    }
    
    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendSettingsOtpEmail();
      if (result.success && result.token) {
        setServerToken(result.token);
        setStep("verify");
        toast.success("OTP sent to founder for approval.");
      } else {
        toast.error(result.error || "Failed to send OTP.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    // Verify OTP
    if (Buffer.from(otpInput).toString('base64') !== serverToken) {
      toast.error("Invalid OTP. Please check the email sent to the founder.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateSettings({ newEmail: email, newPassword: password });
      if (result.success) {
        toast.success("Settings updated successfully!");
        setStep("edit");
        setOtpInput("");
        setPassword(""); // Clear password field
      } else {
        toast.error(result.error || "Failed to update settings.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="w-full">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <ShieldCheck size={20} className="text-accent" />
            Security & Login
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Update your login credentials. Changes require founder approval via OTP.
          </p>
        </div>

        <div className="p-6">
          {step === "edit" ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-primary/90">Email Address (Username)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-primary/90">New Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Leave blank to keep current password"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || (email === currentEmail && !password)}
                  className="h-11 px-6 rounded-xl bg-primary text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-4">
                <p className="text-sm text-accent font-medium">
                  We've sent a 6-digit OTP to the founder at <strong>founder@webworksstudios.com</strong> to approve this change.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-primary/90">Enter 6-Digit OTP</label>
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

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep("edit")}
                  disabled={isLoading}
                  className="h-11 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 px-6 rounded-xl bg-primary text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <KeyRound size={16} />
                      Verify & Save
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
