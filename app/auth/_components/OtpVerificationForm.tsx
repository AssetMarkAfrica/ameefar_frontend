"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAuthError,
  selectAuthStatus,
  selectOtpDelivery,
  selectPendingEmail,
  selectPendingToken,
} from "@/store/auth/authSelectors";
import { verifyOtpThunk } from "@/store/auth/authThunks";

import { logoSrc } from "./auth-constants";
import { StatusMessage } from "./StatusMessage";

const OTP_LENGTH = 6;

export function OtpVerificationForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pendingEmail = useAppSelector(selectPendingEmail);
  const pendingToken = useAppSelector(selectPendingToken);
  const delivery = useAppSelector(selectOtpDelivery);
  const status = useAppSelector((state) => selectAuthStatus(state, "verifyOtp"));
  const error = useAppSelector((state) => selectAuthError(state, "verifyOtp"));
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(59);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const isLoading = status === "loading";
  const code = digits.join("");
  const maskedEmail = useMemo(() => maskEmail(pendingEmail), [pendingEmail]);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [seconds]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pendingEmail || !pendingToken || code.length !== OTP_LENGTH) {
      return;
    }

    try {
      await dispatch(
        verifyOtpThunk({
          code,
          email: pendingEmail,
          pending_token: pendingToken,
        }),
      ).unwrap();

      router.push("/");
    } catch {
      // The slice stores and renders the backend error message.
    }
  }

  function handleDigitChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.replace(/\D/g, "").slice(-1);

    setDigits((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  if (!pendingEmail || !pendingToken) {
    return (
      <main className="auth-otp-page">
        <section className="auth-empty-state">
          <Image alt="Ameefar Energy Logo" height={72} src={logoSrc} width={72} />
          <h1>Verification session expired</h1>
          <p>Start registration again so Ameefar can issue a fresh pending token.</p>
          <Link className="auth-primary-link" href="/auth/register">
            Create account
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-otp-page">
      <header className="auth-otp-header">
        <Image alt="Ameefar Energy Logo" height={80} src={logoSrc} width={80} />
        <h1>Two-Step Verification</h1>
        <p>
          Enter the 6-digit code we sent to <strong>{maskedEmail}</strong>
          {delivery?.sms ? " and your registered mobile number" : ""}.
        </p>
      </header>

      <form className="auth-otp-form" onSubmit={handleSubmit}>
        <div className="auth-otp-grid">
          {digits.map((digit, index) => (
            <input
              key={index}
              aria-label={`Digit ${index + 1}`}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              inputMode="numeric"
              maxLength={1}
              onChange={(event) => handleDigitChange(index, event)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              ref={(node) => {
                inputsRef.current[index] = node;
              }}
              required
              type="text"
              value={digit}
            />
          ))}
        </div>

        {error ? <StatusMessage>{error}</StatusMessage> : null}

        <button
          className="auth-primary-button"
          disabled={isLoading || code.length !== OTP_LENGTH}
          type="submit"
        >
          {isLoading ? "Verifying..." : "Verify Account"}
        </button>

        <div className="auth-otp-actions">
          <button
            disabled={seconds > 0}
            onClick={() => setSeconds(59)}
            type="button"
          >
            Resend code {seconds > 0 ? `(${seconds}s)` : ""}
          </button>
          <Link href="/auth/register">Change email</Link>
        </div>
      </form>

      <footer className="auth-security-footer">
        <div>SECURE ENTERPRISE PORTAL</div>
        <p>Ameefar Energy uses encrypted channels to protect your transactions.</p>
      </footer>
    </main>
  );
}

function maskEmail(email: string | null) {
  if (!email) {
    return "your email";
  }

  const [name, domain] = email.split("@");
  if (!domain) {
    return email;
  }

  return `${name.slice(0, 2)}***@${domain}`;
}
