"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAuthError, selectAuthStatus } from "@/store/auth/authSelectors";
import { requestPasswordResetThunk } from "@/store/auth/authThunks";

import { logoSrc } from "./auth-constants";
import { StatusMessage } from "./StatusMessage";

export function PasswordResetRequestForm() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) =>
    selectAuthStatus(state, "passwordResetRequest"),
  );
  const error = useAppSelector((state) =>
    selectAuthError(state, "passwordResetRequest"),
  );
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const isLoading = status === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await dispatch(requestPasswordResetThunk({ email })).unwrap();
      setSent(true);
    } catch {
      // The slice stores and renders the backend error message.
    }
  }

  return (
    <main className="auth-otp-page">
      <section className="auth-empty-state">
        <Image alt="Ameefar Energy Logo" height={72} src={logoSrc} width={72} />
        <h1>Reset your password</h1>
        <p>Enter your work email and Ameefar will send reset instructions.</p>
        <form className="auth-form auth-reset-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Work Email</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              required
              type="email"
              value={email}
            />
          </label>
          {sent ? (
            <StatusMessage tone="success">Password reset email sent.</StatusMessage>
          ) : null}
          {error ? <StatusMessage>{error}</StatusMessage> : null}
          <button className="auth-primary-button" disabled={isLoading} type="submit">
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <Link className="auth-text-link" href="/auth/login">
          Back to login
        </Link>
      </section>
    </main>
  );
}
