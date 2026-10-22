"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { getErrorMessage } from "@/lib/axios";
import ConfirmModal from "@/components/common/ConfirmModal";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Dynamic redirect if user is already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const redirectParam = searchParams.get("redirect");
      if (redirectParam) {
        if (user.role === "DRIVER" && redirectParam.startsWith("/driver")) {
          router.replace(redirectParam);
          return;
        }
        if (user.role === "CUSTOMER" && redirectParam.startsWith("/customer")) {
          router.replace(redirectParam);
          return;
        }
      }
      const target = user.role === "DRIVER" ? "/driver" : "/customer";
      router.replace(target);
    }
  }, [loading, isAuthenticated, user, router, searchParams]);

  // Quick fill helper for demo accounts
  const handleQuickFill = (accountType: "CUSTOMER" | "DRIVER") => {
    setErrorMessage("");
    if (accountType === "CUSTOMER") {
      setEmail("customer@chalo.app");
      setPassword("Pass1234!");
    } else {
      setEmail("driver@chalo.app");
      setPassword("Pass1234!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const redirectParam = searchParams.get("redirect") || undefined;
      // Single unified login call with role-based post-login destination routing
      const loggedUser = await login({ email, password }, redirectParam);

      // Explicit routing check based on authenticated user role
      if (redirectParam) {
        if (loggedUser.role === "DRIVER" && redirectParam.startsWith("/driver")) {
          router.replace(redirectParam);
          return;
        }
        if (loggedUser.role === "CUSTOMER" && redirectParam.startsWith("/customer")) {
          router.replace(redirectParam);
          return;
        }
      }

      const destination = loggedUser.role === "DRIVER" ? "/driver" : "/customer";
      router.replace(destination);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-115 mx-auto animate-in fade-in duration-300">
      {/* Auth Card */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-7 sm:p-9 shadow-xl shadow-stone-200/50">
        {/* Brand Headline */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE8] border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span>🛡️</span>
            <span>Unified Chalo Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524] tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-500">
            Sign in with your email and password to access your dashboard.
          </p>
        </div>

        {/* Quick Demo Pre-fill Pill Bar */}
        <div className="mb-6 bg-stone-50 border border-stone-200/90 rounded-2xl p-3 text-center">
          <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block mb-2">
            ⚡ Quick Demo Accounts
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("CUSTOMER")}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 border border-stone-200 shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>🚶</span>
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("DRIVER")}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 border border-stone-200 shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>🏍️</span>
              <span>Driver Demo</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Single Unified Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#292524] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@example.com"
              className="w-full h-11 px-3.5 bg-stone-50 text-[#292524] placeholder-stone-400 rounded-xl border border-stone-200 text-sm focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30 transition-all font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#292524]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-semibold text-stone-600 hover:text-[#292524]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-11 px-3.5 bg-stone-50 text-[#292524] placeholder-stone-400 rounded-xl border border-stone-200 text-sm focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-[#292524] focus:ring-[#FFB7B2] accent-[#292524]"
              />
              <span className="font-medium">Keep me signed in</span>
            </label>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                setIsForgotModalOpen(true);
              }}
              className="text-stone-600 hover:text-[#292524] hover:underline font-medium"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 mt-2 rounded-xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-sm tracking-wide transition-all duration-200 hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : (
              <span>Sign In to Chalo &rarr;</span>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="mt-7 pt-5 border-t border-stone-200 text-center text-xs text-stone-500">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-bold text-[#292524] hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>

      <ConfirmModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Password Reset Notice"
        message="For this demonstration environment, please use one of the Quick Demo Accounts above or create a new account to test the platform."
        confirmText="Understood"
        variant="info"
        isAlertOnly
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="text-stone-700 text-sm font-semibold flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#292524] border-t-transparent rounded-full animate-spin" />
          <span>Loading Chalo login...</span>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
