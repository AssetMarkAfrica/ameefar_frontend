"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { createCampaign } from "@/store/newsletter/newsletterThunks";

export default function CreateCampaignPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setError("Subject and body are required.");
      return;
    }
    setSaving(true);
    setError("");

    const result = await dispatch(
      createCampaign({
        subject: subject.trim(),
        body,
      }),
    );

    setSaving(false);

    if (createCampaign.fulfilled.match(result)) {
      router.push("/blog/admin/campaigns");
    } else {
      setError(result.error?.message ?? "Failed to create campaign.");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary">Create Campaign</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Create a new newsletter campaign.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-body-md mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border-subtle p-6 space-y-6 max-w-3xl">
        <div className="space-y-2">
          <label htmlFor="subject" className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Subject *</label>
          <input
            id="subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. March Newsletter"
            className="w-full bg-surface-gray border border-border-subtle rounded-lg font-body-md text-body-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="body" className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Body (HTML) *</label>
          <textarea
            id="body"
            required
            rows={20}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="<h1>Full HTML email content</h1>"
            className="w-full bg-surface-gray border border-border-subtle rounded-lg font-body-md text-body-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline resize-y font-mono"
          />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border-subtle">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-on-primary px-6 py-3 rounded-lg font-body-sm text-body-sm hover:bg-ameefar-navy transition-colors disabled:opacity-65"
          >
            {saving ? "Creating..." : "Create Campaign"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white border border-border-subtle text-on-surface-variant px-6 py-3 rounded-lg font-body-sm text-body-sm hover:bg-surface-gray transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
