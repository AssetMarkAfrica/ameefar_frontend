"use client";

import { Toaster, toast } from "sonner";
import Image from "next/image";

export function GlobalToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#0b1c30] group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg rounded-xl overflow-hidden",
          description: "group-[.toast]:text-slate-500",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
        },
      }}
    />
  );
}

/**
 * Helper to show an Ameefar-branded toast with the logo.
 */
export const ameefarToast = (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
  return toast.custom((t) => (
    <div className="flex w-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg transition-all animate-in slide-in-from-right sm:w-[356px]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-gray">
        <Image
          src="/ameefarLogo.png"
          alt="Ameefar Logo"
          width={24}
          height={24}
          className="object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-semibold text-[#002627]">{title}</p>
        {description && <p className="text-xs text-slate-500 line-clamp-2">{description}</p>}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              toast.dismiss(t);
            }}
            className="mt-2 w-max rounded-md bg-[#006d40] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => toast.dismiss(t)}
        className="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  ));
};
