"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/auth/authSlice";
import { logoutThunk } from "@/store/auth/authThunks";
import {
  selectAuthStatus,
  selectIsAuthenticated,
} from "@/store/auth/authSelectors";

type LogoutButtonProps = {
  className?: string;
  iconClassName?: string;
  showIcon?: boolean;
  showLabel?: boolean;
};

export function LogoutButton({
  className = "",
  iconClassName = "material-symbols-outlined text-[18px]",
  showIcon = false,
  showLabel = true,
}: LogoutButtonProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const logoutStatus = useAppSelector((state) => selectAuthStatus(state, "logout"));
  const isLoggingOut = logoutStatus === "loading";

  const [showConfirm, setShowConfirm] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    if (refreshToken) {
      await dispatch(logoutThunk({ refresh: refreshToken }));
      return;
    }

    dispatch(logout());
  };

  return (
    <>
      <button
        aria-label="Logout"
        className={className}
        disabled={isLoggingOut}
        onClick={() => setShowConfirm(true)}
        type="button"
      >
        {showIcon ? <span className={iconClassName}>logout</span> : null}
        {showLabel ? <span>{isLoggingOut ? "Logging out..." : "Logout"}</span> : null}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <span className="material-symbols-outlined text-red-600 text-[24px]">logout</span>
              </div>
              <h3 className="text-center text-lg font-bold text-slate-900">Confirm Logout</h3>
              <p className="mt-2 text-center text-sm text-slate-500">
                Are you sure you want to log out? You will need to sign in again to access your account.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-4 sm:px-6">
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                onClick={() => setShowConfirm(false)}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition flex justify-center items-center gap-2"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
