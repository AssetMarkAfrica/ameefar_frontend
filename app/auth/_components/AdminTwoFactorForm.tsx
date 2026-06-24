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
  selectAdmin2faDelivery,
  selectAdminChallengeEmail,
  selectAdminChallengeToken,
  selectAuthError,
  selectAuthStatus,
} from "@/store/auth/authSelectors";
import { clearPendingAuth } from "@/store/auth/authSlice";
import { verifyAdmin2faThunk } from "@/store/auth/authThunks";

import { logoSrc } from "./auth-constants";
import { StatusMessage } from "./StatusMessage";

const OTP_LENGTH = 6;

export function AdminTwoFactorForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const adminChallengeToken = useAppSelector(selectAdminChallengeToken);
  const adminChallengeEmail = useAppSelector(selectAdminChallengeEmail);
  const delivery = useAppSelector(selectAdmin2faDelivery);
  const status = useAppSelector((state) =>
    selectAuthStatus(state, "verifyAdmin2fa"),
  );
  const error = useAppSelector((state) =>
    selectAuthError(state, "verifyAdmin2fa"),
  );
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(59);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const isLoading = status === "loading";
  const code = digits.join("");
  const maskedEmail = useMemo(
    () => maskEmail(adminChallengeEmail),
    [adminChallengeEmail],
  );

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [seconds]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!adminChallengeToken || code.length !== OTP_LENGTH) {
      return;
    }

    try {
      await dispatch(
        verifyAdmin2faThunk({
          admin_challenge_token: adminChallengeToken,
          code,
        }),
      ).unwrap();

      router.push("/bidding/dashboard");
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

  if (!adminChallengeToken) {
    return (
      <main className="auth-otp-page">
        <section className="auth-empty-state">
          <Image alt="Ameefar Energy Logo" height={72} src={logoSrc} width={72} />
          <h1>Admin verification expired</h1>
          <p>Sign in again so Ameefar can issue a fresh admin challenge.</p>
          <Link className="auth-primary-link" href="/auth/login">
            Back to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-otp-page">
      <header className="auth-otp-header">
        <Image alt="Ameefar Energy Logo" height={80} src={logoSrc} width={80} />
        <h1>Admin Verification</h1>
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
          {isLoading ? "Verifying..." : "Verify Admin Login"}
        </button>

        <div className="auth-otp-actions">
          <button
            disabled={seconds > 0}
            onClick={() => setSeconds(59)}
            type="button"
          >
            Resend code {seconds > 0 ? `(${seconds}s)` : ""}
          </button>
          <button onClick={() => dispatch(clearPendingAuth())} type="button">
            Change account
          </button>
        </div>
      </form>

      <footer className="auth-security-footer">
        <div>SECURE ADMIN PORTAL</div>
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
