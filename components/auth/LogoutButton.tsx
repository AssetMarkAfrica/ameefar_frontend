"use client";

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
    <button
      aria-label="Logout"
      className={className}
      disabled={isLoggingOut}
      onClick={handleLogout}
      type="button"
    >
      {showIcon ? <span className={iconClassName}>logout</span> : null}
      {showLabel ? <span>{isLoggingOut ? "Logging out..." : "Logout"}</span> : null}
    </button>
  );
}
