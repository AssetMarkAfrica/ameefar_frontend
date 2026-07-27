import React, { useState } from "react";

interface PromptModalProps {
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function PromptModal({
  title,
  message,
  placeholder = "Enter your reason...",
  confirmText = "Submit",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isSubmitting = false,
}: PromptModalProps) {
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-surface-gray border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">edit_note</span>
            <h2 className="font-headline-md text-headline-md text-ameefar-navy">{title}</h2>
          </div>
          <button onClick={onCancel} disabled={isSubmitting} className="text-outline hover:text-ameefar-navy transition-colors disabled:opacity-50">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-body-md text-on-surface-variant">{message}</p>
          <textarea
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-gray text-ameefar-navy font-label-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
            autoFocus
          />
        </div>
        <div className="px-6 py-4 bg-surface-container-low border-t border-border-subtle flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 border border-border-subtle bg-white text-ameefar-navy font-bold rounded-lg hover:bg-surface-gray transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!value.trim() || isSubmitting}
            className="flex-1 py-2.5 px-4 bg-red-600 text-white font-bold rounded-lg shadow-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
