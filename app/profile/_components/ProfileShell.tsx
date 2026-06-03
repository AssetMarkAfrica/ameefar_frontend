"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAccessToken,
  selectHasAuthSession,
  selectUser,
} from "@/store/auth/authSelectors";
import {
  selectProfile,
  selectProfileError,
  selectProfileOpStatus,
} from "@/store/profile/profileSelectors";
import { fetchProfileThunk } from "@/store/profile/profileThunks";

import { profileLogoSrc } from "./profile-options";

export function ProfileShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const hasAuthSession = useAppSelector(selectHasAuthSession);
  const token = useAppSelector(selectAccessToken);
  const user = useAppSelector(selectUser);
  const profile = useAppSelector(selectProfile);
  const fetchStatus = useAppSelector((state) =>
    selectProfileOpStatus(state, "fetchProfile"),
  );
  const fetchError = useAppSelector((state) =>
    selectProfileError(state, "fetchProfile"),
  );

  useEffect(() => {
    if (!hasAuthSession || !token) {
      router.replace("/auth/login");
      return;
    }

    if (fetchStatus === "idle") {
      void dispatch(fetchProfileThunk({ token }));
    }
  }, [dispatch, fetchStatus, hasAuthSession, router, token]);

  useEffect(() => {
    if (!profile || pathname === "/profile") {
      return;
    }

    const earliestStep = getEarliestAllowedPath(profile);
    if (!canVisitPath(pathname, profile)) {
      router.replace(earliestStep);
    }
  }, [pathname, profile, router]);

  if (!hasAuthSession || !token) {
    return null;
  }

  return (
    <div className="profile-app">
      <header className="profile-topbar">
        <Link className="profile-brand" href="/profile">
          <Image alt="Ameefar Energy Logo" height={36} src={profileLogoSrc} width={36} />
          <span>Ameefar Energy</span>
        </Link>
        <nav className="profile-topnav" aria-label="Primary">
          <Link href="/product">Marketplace</Link>
          <Link href="#">My Trades</Link>
          <Link className="active" href="/profile">
            Profile
          </Link>
        </nav>
        <div className="profile-user-chip">
          {user?.first_name?.[0] ?? user?.email?.[0] ?? "A"}
          {user?.last_name?.[0] ?? ""}
        </div>
      </header>
      {fetchStatus === "loading" && !profile ? (
        <main className="profile-main">
          <div className="profile-skeleton profile-skeleton-hero" />
          <div className="profile-skeleton-grid">
            <div className="profile-skeleton" />
            <div className="profile-skeleton" />
            <div className="profile-skeleton" />
          </div>
        </main>
      ) : fetchStatus === "failed" && !profile ? (
        <main className="profile-main">
          <section className="profile-fetch-error">
            <p className="profile-eyebrow">Profile unavailable</p>
            <h1>We could not load your verification profile.</h1>
            <p>{fetchError ?? "Please refresh and try again."}</p>
            <button
              className="profile-primary-button"
              onClick={() => void dispatch(fetchProfileThunk({ token }))}
              type="button"
            >
              Retry
            </button>
          </section>
        </main>
      ) : (
        children
      )}
    </div>
  );
}

export function getEarliestAllowedPath(profile: {
  step1_complete: boolean;
  step2_complete: boolean;
}) {
  if (!profile.step1_complete) {
    return "/profile/company";
  }

  if (!profile.step2_complete) {
    return "/profile/sites";
  }

  return "/profile/documents";
}

function canVisitPath(
  pathname: string,
  profile: { step1_complete: boolean; step2_complete: boolean },
) {
  if (pathname.startsWith("/profile/sites")) {
    return profile.step1_complete;
  }

  if (pathname.startsWith("/profile/documents")) {
    return profile.step1_complete && profile.step2_complete;
  }

  return true;
}
