"use client";

import { useState, useEffect } from "react";
import MaterialIcon from "./MaterialIcon";

interface PromoteButtonProps {
  companyId: string;
  companyName: string;
}

interface PricingOption {
  id: string;
  name: string;
  placement: string;
  duration: number;
  price: number;
  currency: string;
  discount: number;
}

export default function PromoteButton({ companyId, companyName }: PromoteButtonProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("HOME_TOP");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"success" | "error" | "conflict" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pricing, setPricing] = useState<PricingOption[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/promotion-pricing")
      .then((r) => r.json())
      .then((data) => setPricing(data))
      .catch(() => {});
  }, [open]);

  const filteredPricing = pricing.filter(
    (p) => p.placement === placement || p.placement === "BOTH"
  );

  const selectedPlan = pricing.find((p) => p.id === selectedPricing);
  const finalPrice = selectedPlan
    ? selectedPlan.price * (1 - selectedPlan.discount / 100)
    : null;

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, placement, message }),
      });
      if (res.ok) {
        setResult("success");
        setMessage("");
        setTimeout(() => { setOpen(false); setResult(null); }, 2000);
      } else if (res.status === 409) {
        setResult("conflict");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to submit");
        setResult("error");
      }
    } catch {
      setErrorMsg("Network error");
      setResult("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-xl flex items-center gap-2 font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
      >
        <MaterialIcon icon="campaign" className="text-lg" />
        Promote
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Request Promotion</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{companyName}</p>
              </div>
              <button
                onClick={() => { setOpen(false); setResult(null); }}
                className="size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              >
                <MaterialIcon icon="close" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Placement */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Where to promote?
                </label>
                <div className="space-y-2">
                  {[
                    { value: "HOME_TOP", label: "Home Page", desc: "Featured at the top of the home feed", icon: "home" },
                    { value: "EXPLORE_TOP", label: "Explore Page", desc: "Banner at the top of explore gallery", icon: "explore" },
                    { value: "BOTH", label: "Both Pages", desc: "Maximum visibility on home + explore", icon: "star" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setPlacement(opt.value); setSelectedPricing(null); }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        placement === opt.value
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <div className={`size-10 rounded-lg flex items-center justify-center ${
                        placement === opt.value ? "bg-amber-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                      }`}>
                        <MaterialIcon icon={opt.icon} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{opt.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                      </div>
                      {placement === opt.value && (
                        <MaterialIcon icon="check_circle" filled className="text-amber-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Plans */}
              {filteredPricing.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Select a package
                  </label>
                  <div className="space-y-2">
                    {filteredPricing.map((p) => {
                      const final = p.price * (1 - p.discount / 100);
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPricing(p.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                            selectedPricing === p.id
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{p.duration} days</p>
                          </div>
                          <div className="text-right">
                            {p.discount > 0 ? (
                              <>
                                <p className="text-xs text-gray-400 line-through">${p.price.toFixed(2)}</p>
                                <p className="font-bold text-amber-600 dark:text-amber-400">${final.toFixed(2)}</p>
                                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-1.5 py-0.5 rounded-full font-bold">
                                  -{p.discount}% OFF
                                </span>
                              </>
                            ) : (
                              <p className="font-bold text-gray-900 dark:text-white">${p.price.toFixed(2)}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Message to admin (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your promotion goals..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Price Summary */}
              {selectedPlan && finalPrice !== null && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedPlan.name}</p>
                      <p className="text-xs text-gray-500">{selectedPlan.duration} days promotion</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">${finalPrice.toFixed(2)}</p>
                      {selectedPlan.discount > 0 && (
                        <p className="text-xs text-green-600">You save ${(selectedPlan.price - finalPrice).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <MaterialIcon icon="info" className="text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="text-xs text-amber-700 dark:text-amber-400">
                    <p className="font-bold mb-1">How it works</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Your request will be reviewed by the admin</li>
                      <li>Once approved, your brand will appear in the promoted section</li>
                      <li>Payment will be arranged after approval</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Result Messages */}
              {result === "success" && (
                <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-sm font-medium">
                  <MaterialIcon icon="check_circle" filled className="text-green-500" />
                  Request submitted! The admin will review it shortly.
                </div>
              )}
              {result === "conflict" && (
                <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                  <MaterialIcon icon="warning" className="text-yellow-500" />
                  You already have a pending promotion request.
                </div>
              )}
              {result === "error" && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium">
                  <MaterialIcon icon="error" className="text-red-500" />
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting || result === "success"}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MaterialIcon icon="send" className="text-lg" />
                    Submit Promotion Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
