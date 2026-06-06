"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import { verifyReferenceThunk, getTradePaymentSummaryThunk } from "@/store/payment/paymentThunks";
import { fetchTradeThunk } from "@/store/bidding/biddingThunks";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";

type VerifyState = "idle" | "verifying" | "success" | "error";

export default function PaymentCallbackPage() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);

  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token || !reference) return;

    const verify = async () => {
      setVerifyState("verifying");
      try {
        const result = await dispatch(verifyReferenceThunk({ reference }));
        if (verifyReferenceThunk.fulfilled.match(result)) {
          // Refresh payment summary and trade state
          await Promise.all([
            dispatch(getTradePaymentSummaryThunk(id)),
            dispatch(fetchTradeThunk({ token, tradeId: id })),
          ]);
          setVerifyState("success");
        } else {
          setErrorMsg("Verification failed. Please try again from the trade page.");
          setVerifyState("error");
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Unexpected error during verification.");
        setVerifyState("error");
      }
    };

    verify();
  }, [token, reference]);

  const handleBack = () => router.replace(`/bidding/buyer/trade/${id}`);

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <BiddingSidebar role="buyer" />
      <main className="md:ml-64 pt-16 min-h-screen flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
          {verifyState === "verifying" && (
            <>
              <div className="w-16 h-16 border-4 border-ameefar-navy border-t-transparent rounded-full animate-spin mx-auto" />
              <h1 className="font-headline-md text-headline-md text-primary">
                Verifying Payment
              </h1>
              <p className="text-body-md text-on-surface-variant">
                Confirming your payment with Paystack. This will only take a moment…
              </p>
            </>
          )}

          {verifyState === "success" && (
            <>
              <div className="w-16 h-16 bg-trust-green-subtle rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-secondary text-[36px]">
                  check_circle
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md text-secondary">
                Payment Confirmed!
              </h1>
              <p className="text-body-md text-on-surface-variant">
                Your payment has been verified successfully. You can now proceed
                with the next step in your trade.
              </p>
              <button
                onClick={handleBack}
                className="w-full py-3 bg-ameefar-navy text-on-primary font-bold rounded-xl hover:opacity-90 transition-all active:scale-95"
              >
                Return to Trade
              </button>
            </>
          )}

          {verifyState === "error" && (
            <>
              <div className="w-16 h-16 bg-error-container/30 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-error text-[36px]">
                  error
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md text-error">
                Verification Failed
              </h1>
              <p className="text-body-md text-on-surface-variant">{errorMsg}</p>
              <button
                onClick={handleBack}
                className="w-full py-3 bg-ameefar-navy text-on-primary font-bold rounded-xl hover:opacity-90 transition-all active:scale-95"
              >
                Return to Trade
              </button>
            </>
          )}

          {verifyState === "idle" && !reference && (
            <>
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-outline text-[36px]">
                  info
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md text-primary">
                No Payment Reference
              </h1>
              <p className="text-body-md text-on-surface-variant">
                No payment reference was found. Please return to the trade page
                and try again.
              </p>
              <button
                onClick={handleBack}
                className="w-full py-3 bg-ameefar-navy text-on-primary font-bold rounded-xl hover:opacity-90 transition-all active:scale-95"
              >
                Return to Trade
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
