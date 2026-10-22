"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { getErrorMessage } from "@/lib/axios";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user, isAuthenticated, loading } = useAuth();

  const initialRole =
    searchParams.get("role") === "DRIVER" ? "DRIVER" : "CUSTOMER";

  const [role, setRole] = useState<"CUSTOMER" | "DRIVER">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState<"BIKE" | "CAR">("BIKE");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const target = user.role === "DRIVER" ? "/driver" : "/customer";
      router.replace(target);
    }
  }, [loading, isAuthenticated, user, router]);

  const handleQuickFill = (targetRole: "CUSTOMER" | "DRIVER") => {
    setRole(targetRole);
    setErrorMessage("");

    if (targetRole === "CUSTOMER") {
      setName("Sarah Khan");
      setEmail("customer@chalo.app");
      setPassword("Pass1234!");
    } else {
      setName("Rafiqul Alam");
      setEmail("driver@chalo.app");
      setPassword("Pass1234!");
      setVehicleType("BIKE");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (role === "DRIVER" && !vehicleType) {
      setErrorMessage("Vehicle type (Bike or Car) is required for drivers.");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        vehicleType: role === "DRIVER" ? vehicleType : undefined,
      });
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-115 mx-auto animate-in fade-in duration-300">
      <div className="bg-white border border-stone-200/90 rounded-3xl p-7 sm:p-9 shadow-xl shadow-stone-200/50">
        {/* Role Switcher Tabs */}
        <div className="flex bg-stone-100/90 p-1.5 rounded-2xl mb-6 border border-stone-200/80">
          <button
            type="button"
            onClick={() => {
              setRole("CUSTOMER");
              setErrorMessage("");
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              role === "CUSTOMER"
                ? "bg-[#292524] text-white shadow-xs"
                : "text-stone-600 hover:text-[#292524]"
            }`}
          >
            <span>🚶</span>
            <span>Customer Sign Up</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("DRIVER");
              setErrorMessage("");
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              role === "DRIVER"
                ? "bg-[#292524] text-white shadow-xs"
                : "text-stone-600 hover:text-[#292524]"
            }`}
          >
            <span>🏍️</span>
            <span>Driver Sign Up</span>
          </button>
        </div>

        {/* Headline */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#292524] tracking-tight">
            {role === "CUSTOMER"
              ? "Create your Customer account"
              : "Register as a Driver"}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-500">
            {role === "CUSTOMER"
              ? "Fast, calm, and zero-surge rides across your city"
              : "Earn with our flat 10% platform fee and take home 90%"}
          </p>
        </div>

        {/* Quick Demo Pre-fill Pill Bar */}
        <div className="mb-6 bg-stone-50 border border-stone-200/90 rounded-2xl p-3 text-center">
          <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block mb-2">
            ⚡ Quick Prototype Demo
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("CUSTOMER")}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 border border-stone-200 shadow-2xs transition-colors"
            >
              Fill Customer Data
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("DRIVER")}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 border border-stone-200 shadow-2xs transition-colors"
            >
              Fill Driver Data
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#292524] mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Khan"
              className="w-full h-11 px-3.5 bg-stone-50 text-[#292524] placeholder-stone-400 rounded-xl border border-stone-200 text-sm focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#292524] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. customer@example.com"
              className="w-full h-11 px-3.5 bg-stone-50 text-[#292524] placeholder-stone-400 rounded-xl border border-stone-200 text-sm focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30 transition-all font-medium"
            />
          </div>

          {/* Vehicle Type (Only required for Drivers) */}
          {role === "DRIVER" && (
            <div>
              <label className="block text-xs font-bold text-[#292524] mb-1.5">
                Vehicle Type (Required for Driver)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVehicleType("BIKE")}
                  className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    vehicleType === "BIKE"
                      ? "bg-[#FFB7B2]/20 text-[#292524] border-[#FFB7B2] ring-2 ring-[#FFB7B2] shadow-xs"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span>🏍️</span>
                  <span>Bike</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleType("CAR")}
                  className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    vehicleType === "CAR"
                      ? "bg-[#FFB7B2]/20 text-[#292524] border-[#FFB7B2] ring-2 ring-[#FFB7B2] shadow-xs"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span>🚗</span>
                  <span>Car</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#292524] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full h-11 px-3.5 bg-stone-50 text-[#292524] placeholder-stone-400 rounded-xl border border-stone-200 text-sm focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30 transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 rounded-xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-bold text-sm tracking-wide transition-all duration-200 hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>
                Register as {role === "CUSTOMER" ? "Customer" : "Driver"} →
              </span>
            )}
          </button>
        </form>

        {/* Footer Link to Sign In */}
        <div className="mt-7 pt-5 border-t border-stone-200 text-center text-xs text-stone-500">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-bold text-[#292524] hover:underline"
          >
            Sign in to your account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="text-stone-700 text-sm font-semibold flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#292524] border-t-transparent rounded-full animate-spin" />
          <span>Loading Chalo registration...</span>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
