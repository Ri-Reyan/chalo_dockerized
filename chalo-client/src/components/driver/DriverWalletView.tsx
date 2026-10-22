"use client";

import React, { useState, useEffect, useCallback } from "react";
import api, { getErrorMessage } from "@/lib/axios";
import toast from "@/lib/toast";

interface DriverWalletViewProps {
  balance: number;
  onWithdrawSuccess: (amount: number) => void;
}

interface WithdrawalItem {
  id: string;
  amount: number;
  method?: string;
  account?: string;
  status: "COMPLETED" | "PENDING" | "REJECTED";
  createdAt: string;
}

export const DriverWalletView: React.FC<DriverWalletViewProps> = ({
  balance,
  onWithdrawSuccess,
}) => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bKash" | "Nagad" | "Bank">("bKash");
  const [accountNumber, setAccountNumber] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real withdrawal transactions from server
  const fetchWithdrawalHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await api.get("/drivers/balance");
      if (res.data?.success && res.data?.data) {
        if (Array.isArray(res.data.data.withdrawals)) {
          setWithdrawals(res.data.data.withdrawals);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch withdrawal history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawalHistory();
  }, [fetchWithdrawalHistory]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      setError("Minimum withdrawal amount is $10.00.");
      return;
    }

    if (numAmount > balance) {
      setError(`Amount exceeds your available balance ($${balance.toFixed(2)}).`);
      return;
    }

    if (!accountNumber.trim()) {
      setError("Please enter your recipient account number or details.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting payout request...", "Connecting to settlement ledger");

    try {
      const response = await api.post("/drivers/withdrawals", {
        amount: numAmount,
        method,
        accountNumber: accountNumber.trim(),
      });

      toast.dismiss(toastId);

      if (response.data?.success) {
        const data = response.data.data;
        const newRecord: WithdrawalItem = {
          id: data.id || data.withdrawalId || `wth-${Date.now()}`,
          amount: Number(data.amount) || numAmount,
          method,
          account: accountNumber.trim(),
          status: data.status || "PENDING",
          createdAt: data.createdAt || new Date().toISOString(),
        };

        // Immediately update local history list
        setWithdrawals((prev) => [newRecord, ...prev]);

        // Deduct from dashboard balance immediately
        onWithdrawSuccess(numAmount);

        // Close modal and reset fields
        setShowModal(false);
        setAmount("");
        setAccountNumber("");

        toast.success(
          "Withdrawal Submitted!",
          `$${numAmount.toFixed(2)} payout requested via ${method}. Status: PENDING.`
        );

        // Re-sync with backend history
        fetchWithdrawalHistory();
      } else {
        const errorMsg = response.data?.message || "Failed to submit withdrawal request.";
        setError(errorMsg);
        toast.error("Withdrawal Failed", errorMsg);
      }
    } catch (err: unknown) {
      toast.dismiss(toastId);
      const errMsg = getErrorMessage(err);
      setError(errMsg);
      toast.error("Withdrawal Failed", errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPreset = (presetAmount: number) => {
    if (presetAmount > balance) {
      setAmount(balance.toFixed(2));
    } else {
      setAmount(presetAmount.toString());
    }
    setError("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Balance Banner */}
      <div className="bg-linear-to-br from-[#292524] to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#FFB7B2] text-xs font-bold uppercase tracking-wider mb-2">
            <span>💳</span>
            <span>Driver Payout Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Available Earnings Balance
          </h1>
          <div className="text-4xl sm:text-5xl font-black text-white mt-2">
            ${balance.toFixed(2)}
          </div>
          <span className="text-xs text-emerald-400 font-semibold mt-1 block">
            {balance >= 10
              ? "✓ Ready for instant withdrawal (Min $10.00)"
              : "Minimum balance of $10.00 required to withdraw"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
          disabled={balance < 10}
          className="h-14 px-8 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-base tracking-wide transition-all shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          Withdraw Earnings &rarr;
        </button>
      </div>

      {/* Commission Transparency Banner */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤝</span>
          <div>
            <div className="text-sm font-bold text-[#292524]">
              Flat 10% Platform Cut &bull; Keep 90% of Every Fare
            </div>
            <div className="text-xs text-stone-500">
              Zero hidden technology fees. Fares deposit immediately into your
              wallet after each completed ride.
            </div>
          </div>
        </div>
        <div className="text-xs font-bold text-emerald-800 bg-[#E8EFE8] border border-emerald-200 px-3 py-1.5 rounded-xl shrink-0">
          90% Net Take-Home
        </div>
      </div>

      {/* Withdrawal Transactions History */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h2 className="text-base font-bold text-[#292524] uppercase tracking-wider">
            Payout &amp; Withdrawal History
          </h2>
          <span className="text-xs text-stone-500">
            {withdrawals.length} Total Requests
          </span>
        </div>

        {isLoadingHistory ? (
          <div className="py-8 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading withdrawal history...</span>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-8 text-center space-y-2">
            <div className="text-3xl">💳</div>
            <div className="text-sm font-bold text-[#292524]">
              No payout requests yet
            </div>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Completed withdrawal transactions and settlements will be recorded
              here once you request your earnings payout.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-stone-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#292524] text-sm">
                      {w.method || "Payout"} {w.account ? `(${w.account})` : "Transfer"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        w.status === "COMPLETED"
                          ? "bg-[#E8EFE8] text-emerald-800 border border-emerald-200"
                          : w.status === "PENDING"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                  <div className="text-stone-500">
                    Transaction ID:{" "}
                    <span className="font-mono text-[#292524] font-medium">{w.id}</span>{" "}
                    &bull; {formatDate(w.createdAt)}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-lg font-black text-rose-600">
                    - ${Number(w.amount).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-stone-500">
                    0% Processing Fee
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-lg font-bold text-[#292524]">
                  Request Payout
                </h3>
                <p className="text-xs text-stone-500">
                  Transfer your earnings directly to your mobile wallet or bank
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-[#292524] flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Payout Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["bKash", "Nagad", "Bank"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        method === m
                          ? "bg-[#FFB7B2]/25 text-[#292524] border-[#FFB7B2] shadow-2xs font-bold"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Withdrawal Amount ($)
                </label>
                <input
                  type="number"
                  min={10}
                  max={balance}
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError("");
                  }}
                  placeholder={`Min $10.00, Max $${balance.toFixed(2)}`}
                  className="w-full h-11 px-3.5 bg-stone-50 text-[#292524] rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30"
                />

                {/* Quick Presets */}
                {balance >= 10 && (
                  <div className="flex gap-2 mt-2">
                    {[10, 25, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleQuickPreset(preset)}
                        disabled={balance < preset}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        ${preset}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleQuickPreset(balance)}
                      className="px-2.5 py-1 rounded-lg bg-[#FFB7B2]/30 hover:bg-[#FFB7B2]/50 text-[#292524] text-[11px] font-extrabold transition-colors"
                    >
                      Max (${balance.toFixed(2)})
                    </button>
                  </div>
                )}

                <span className="text-[11px] text-stone-500 mt-1 block">
                  Available: ${balance.toFixed(2)} (Min $10.00 threshold)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Recipient Account Details
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    setError("");
                  }}
                  placeholder={
                    method === "Bank"
                      ? "Account Number & Bank Name"
                      : `${method} Mobile Number (e.g. 01812-XXXXXX)`
                  }
                  className="w-full h-11 px-3.5 bg-stone-50 text-[#292524] rounded-xl border border-stone-200 text-sm focus:outline-none focus:bg-white focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/30"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold text-center animate-in fade-in">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs border border-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Confirm Withdrawal &rarr;</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverWalletView;
