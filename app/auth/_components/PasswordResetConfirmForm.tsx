"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAuthError, selectAuthStatus } from "@/store/auth/authSelectors";
import { confirmPasswordResetThunk } from "@/store/auth/authThunks";

import { logoSrc } from "./auth-constants";
import { StatusMessage } from "./StatusMessage";

export function PasswordResetConfirmForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useAppSelector((state) =>
    selectAuthStatus(state, "passwordResetConfirm"),
  );
  const error = useAppSelector((state) =>
    selectAuthError(state, "passwordResetConfirm"),
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const isLoading = status === "loading";
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!uid || !token) {
      setLocalError("The reset link is missing required credentials.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords must match.");
      return;
    }

    try {
      await dispatch(
        confirmPasswordResetThunk({
          new_password: newPassword,
          token,
          uid,
        }),
      ).unwrap();

      router.push("/auth/login");
    } catch {
      // The slice stores and renders the backend error message.
    }
  }

  return (
    <main className="auth-otp-page">
      <section className="auth-empty-state">
        <Image alt="Ameefar Energy Logo" height={72} src={logoSrc} width={72} />
        <h1>Set a new password</h1>
        <p>Choose a new password for your Ameefar Energy account.</p>
        <form className="auth-form auth-reset-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>New Password</span>
            <input
              autoComplete="new-password"
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="********"
              required
              type="password"
              value={newPassword}
            />
          </label>
          <label className="auth-field">
            <span>Confirm Password</span>
            <input
              autoComplete="new-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="********"
              required
              type="password"
              value={confirmPassword}
            />
          </label>
          {localError ? <StatusMessage>{localError}</StatusMessage> : null}
          {error ? <StatusMessage>{error}</StatusMessage> : null}
          <button className="auth-primary-button" disabled={isLoading} type="submit">
            {isLoading ? "Saving..." : "Update Password"}
          </button>
        </form>
        <Link className="auth-text-link" href="/auth/login">
          Back to login
        </Link>
      </section>
    </main>
  );
}
