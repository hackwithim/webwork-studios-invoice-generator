"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "@/actions/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await loginUser(data);
      
      if (result.success) {
        toast.success("Welcome back to WEBWORK STUDIOS!");
        router.push("/");
      } else {
        toast.error(result.error || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
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
                Welcome back
              </h1>
              <p className="text-sm text-slate-500">
                Sign in to manage invoices & clients.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-primary/90">Email Address</label>
                <input
                  {...form.register("email")}
                  type="email"
                  placeholder="admin@webworkstudios.in"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-primary/90">Password</label>
                  <Link href="/forgot-password" className="text-xs font-medium text-accent hover:text-accent/80 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  {...form.register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message}</p>
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
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Footer */}
          <div className="px-8 py-5 sm:px-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
            <p className="text-sm text-slate-500">
              Need an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:text-accent transition-colors">
                Contact Admin
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
