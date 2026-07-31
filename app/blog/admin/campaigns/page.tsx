"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCampaigns,
  selectNewsletterLoading,
  selectNewsletterError,
} from "@/store/newsletter/newsletterSelectors";
import { fetchCampaigns } from "@/store/newsletter/newsletterThunks";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-surface-gray text-on-surface-variant border-border-subtle",
  sending: "bg-surface-container-low text-surface-tint border-surface-tint/30",
  sent: "bg-trust-green-subtle text-on-tertiary-container border-on-tertiary-container/20",
};

export default function CampaignsPage() {
  const dispatch = useAppDispatch();
  const campaigns = useAppSelector(selectCampaigns);
  const loading = useAppSelector(selectNewsletterLoading);
  const error = useAppSelector(selectNewsletterError);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Campaigns</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage and review newsletter campaigns.</p>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center text-on-surface-variant font-body-md">Loading...</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-body-md mb-8">{error}</div>
      )}

      {!loading && !error && campaigns.length === 0 && (
        <div className="py-12 text-center text-on-surface-variant font-body-md">No campaigns yet.</div>
      )}

      {!loading && campaigns.length > 0 && (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/blog/admin/campaigns/${campaign.id}`}
              className="bg-white rounded-xl border border-border-subtle p-6 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="font-headline-md text-headline-md text-ameefar-navy mb-1">{campaign.subject}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {campaign.status === "sent" && campaign.sent_at
                    ? `Sent on ${new Date(campaign.sent_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : `Created ${new Date(campaign.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`}
                  {" · "}
                  {campaign.recipient_count} recipients
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full font-label-md text-label-md flex items-center gap-1 border ${
                  STATUS_COLORS[campaign.status] ?? "bg-surface-gray text-on-surface-variant border-border-subtle"
                }`}
              >
                {campaign.status === "sent" && (
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                )}
                {campaign.status === "sending" && (
                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                )}
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
