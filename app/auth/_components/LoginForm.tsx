"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAuthError,
  selectAuthStatus,
  selectIsVerified,
  selectIsActive,
} from "@/store/auth/authSelectors";
import { store } from "@/store";
import { loginThunk } from "@/store/auth/authThunks";

import { logoSrc, tradeVisualSrc } from "./auth-constants";
import { StatusMessage } from "./StatusMessage";

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector((state) => selectAuthStatus(state, "login"));
  const error = useAppSelector((state) => selectAuthError(state, "login"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLoading = status === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await dispatch(loginThunk({ email, password })).unwrap();

      const state = store.getState();
      const isVerified = selectIsVerified(state);
      const isActive = selectIsActive(state);

      if (!isVerified && !isActive) {
        router.push("/profile");
      } else {
        router.push("/product");
      }
    } catch {
      // The slice stores and renders the backend error message.
    }
  }

  return (
    <main className="auth-login-page">
      <section className="auth-login-shell">
        <div className="auth-login-visual">
          <Image
            alt="Industrial energy facility at dusk"
            className="auth-login-image"
            fill
            priority
            sizes="50vw"
            src={tradeVisualSrc}
          />
          <div className="auth-login-overlay" />
          <div className="auth-login-visual-content">
            <Link className="auth-brand auth-brand-light" href="/">
              <Image alt="Ameefar Energy Logo" height={40} src={logoSrc} width={40} />
              <span>Ameefar Energy</span>
            </Link>
            <div>
              <h1>Empowering Global Energy Logistics.</h1>
              <p>
                The definitive marketplace for industrial recycling and energy
                trade. Secure, transparent, and built for enterprise scale.
              </p>
            </div>

          </div>
        </div>

        <div className="auth-login-panel">
          <div className="auth-mobile-brand">
            <Image alt="Ameefar Energy Logo" height={48} src={logoSrc} width={48} />
            <span>Ameefar Energy</span>
          </div>

          <div className="auth-form-heading">
            <h2>Welcome back</h2>
            <p>Enter your credentials to access the trading floor.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Work Email</span>
              <input
                autoComplete="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                required
                type="email"
                value={email}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label-row">
                <span>Password</span>
                <Link href="/auth/password-reset">Forgot password?</Link>
              </span>
              <input
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                required
                type="password"
                value={password}
              />
            </label>

            <label className="auth-checkbox-row">
              <input type="checkbox" />
              <span>Keep me signed in for 30 days</span>
            </label>

            {error ? <StatusMessage>{error}</StatusMessage> : null}

            <button className="auth-primary-button" disabled={isLoading} type="submit">
              {isLoading ? "Authenticating..." : "Sign in to Portal"}
            </button>
          </form>

          <div className="auth-secondary-action">
            <p>New partner looking for access?</p>
            <Link href="/auth/register">Request Enterprise Account</Link>
          </div>

          <div className="auth-login-links">
            <Link href="#">Privacy Policy</Link>
            <span />
            <Link href="#">Terms of Trade</Link>
            <span />
            <Link href="#">Support</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
