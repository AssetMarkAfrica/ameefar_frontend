"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentCampaign,
  selectCampaignStats,
  selectNewsletterLoading,
  selectNewsletterError,
} from "@/store/newsletter/newsletterSelectors";
import { fetchCampaign, fetchCampaignStats } from "@/store/newsletter/newsletterThunks";

export default function CampaignPerformancePage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const dispatch = useAppDispatch();
  const campaign = useAppSelector(selectCurrentCampaign);
  const campaignStatsMap = useAppSelector(selectCampaignStats);
  const loading = useAppSelector(selectNewsletterLoading);
  const error = useAppSelector(selectNewsletterError);

  useEffect(() => {
    params.then(({ campaignId }) => {
      dispatch(fetchCampaign(campaignId));
      dispatch(fetchCampaignStats(campaignId));
    });
  }, [dispatch, params]);

  if (loading || !campaign) {
    return (
      <div className="py-12 text-center text-on-surface-variant font-body-md">
        {loading ? "Loading..." : "Campaign not found."}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-body-md">{error}</div>
    );
  }

  const stats = campaignStatsMap[campaign.id] ?? null;

  const sentDate = campaign.sent_at
    ? new Date(campaign.sent_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div>
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/blog/admin/campaigns"
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-body-sm text-body-sm"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Campaigns
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="font-headline-lg text-headline-lg text-primary">{campaign.subject}</h1>
            <span className="bg-trust-green-subtle text-on-tertiary-container border border-on-tertiary-container/20 px-3 py-1 rounded-full font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {campaign.status === "sent" && sentDate
              ? `Sent on ${sentDate} to ${campaign.recipient_count} subscribers.`
              : `Created ${new Date(campaign.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })} · ${campaign.recipient_count} recipients`}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-border-subtle text-ameefar-navy px-4 py-2 rounded-lg font-body-sm text-body-sm hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body-sm text-body-sm hover:bg-ameefar-navy transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
            Duplicate
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] border border-border-subtle hover:translate-y-[-2px] hover:shadow-[0_8px_32px_-4px_rgba(15,23,42,0.12)] transition-all duration-200 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Total Sent</span>
            <span className="material-symbols-outlined text-outline p-1 bg-surface-gray rounded-md">send</span>
          </div>
          <div>
            <span className="font-display-lg text-display-lg text-primary">{stats?.sent_count ?? campaign.sent_count}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] border border-border-subtle hover:translate-y-[-2px] hover:shadow-[0_8px_32px_-4px_rgba(15,23,42,0.12)] transition-all duration-200 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-surface-container-low rounded-full opacity-50 pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Unique Opens</span>
            <span className="material-symbols-outlined text-secondary p-1 bg-trust-green-subtle rounded-md">visibility</span>
          </div>
          <div className="relative z-10 flex items-end justify-between">
            <span className="font-display-lg text-display-lg text-primary">{campaign.open_count}</span>
            <span className="font-label-md text-label-md text-on-surface-variant pb-2">subscribers</span>
          </div>
        </div>

        <div className="bg-primary rounded-xl p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] hover:translate-y-[-2px] hover:shadow-[0_8px_32px_-4px_rgba(15,23,42,0.12)] transition-all duration-200 flex flex-col justify-between h-32 relative overflow-hidden">
          <div
            className="absolute right-0 bottom-0 w-32 h-20 opacity-20 pointer-events-none"
            style={{ background: "linear-gradient(135deg, transparent 49%, #ffffff 50%, transparent 51%) 0 0 / 8px 8px" }}
          />
          <div className="flex justify-between items-start relative z-10">
            <span className="font-body-sm text-body-sm text-inverse-on-surface opacity-80">Open Rate</span>
            <span className="material-symbols-outlined text-primary-fixed p-1 bg-white/10 rounded-md">monitoring</span>
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-white">{stats ? (stats.open_rate * 100).toFixed(1) : "—"}</span>
            <span className="font-headline-md text-headline-md text-primary-fixed">%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] border border-border-subtle hover:translate-y-[-2px] hover:shadow-[0_8px_32px_-4px_rgba(15,23,42,0.12)] transition-all duration-200 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Total Clicks</span>
            <span className="material-symbols-outlined text-surface-tint p-1 bg-surface-container-low rounded-md">touch_app</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-display-lg text-display-lg text-primary">{campaign.click_count}</span>
            {stats && (
              <span className="font-label-md text-label-md text-secondary bg-trust-green-subtle px-2 py-0.5 rounded-full flex items-center">
                <span className="material-symbols-outlined text-[12px] mr-1">trending_up</span>
                {(stats.click_rate * 100).toFixed(1)}% CTR
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 bg-white rounded-xl border border-border-subtle shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] flex flex-col overflow-hidden">
          <div className="bg-surface-gray border-b border-border-subtle p-4 flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-primary text-[18px]">Email Preview</h3>
            <div className="flex gap-2 bg-white rounded-lg border border-border-subtle p-1">
              <button
                className="p-1.5 bg-surface-container-low text-primary rounded-md hover:bg-surface-container transition-colors"
                title="Desktop View"
              >
                <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
              </button>
              <button
                className="p-1.5 text-on-surface-variant rounded-md hover:bg-surface-gray transition-colors"
                title="Mobile View"
              >
                <span className="material-symbols-outlined text-[18px]">smartphone</span>
              </button>
            </div>
          </div>
          <div className="p-8 bg-[#F3F4F6] flex-1 flex justify-center overflow-y-auto max-h-[600px]">
            <div className="bg-white max-w-[600px] w-full shadow-sm rounded border border-gray-200 p-8 flex flex-col gap-6">
              <div className="text-center pb-6 border-b border-gray-100">
                <h2 className="font-headline-md text-headline-md text-ameefar-navy tracking-tight mb-2">
                  Ameefar Energy Insights
                </h2>
                <p className="font-body-sm text-body-sm text-gray-500 uppercase tracking-widest">
                  {sentDate ?? "Newsletter Edition"}
                </p>
              </div>
              <div
                className="font-body-md text-body-md text-gray-600 leading-relaxed [&_h3]:font-headline-md [&_h3]:text-headline-md [&_h3]:text-gray-900 [&_h3]:mb-4 [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:inline-block [&_a]:bg-[#002627] [&_a]:text-white [&_a]:px-6 [&_a]:py-3 [&_a]:rounded [&_a]:text-sm [&_a]:font-medium [&_a]:tracking-wide"
                dangerouslySetInnerHTML={{ __html: campaign.body }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-white rounded-xl border border-border-subtle shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] p-6">
            <h3 className="font-headline-md text-headline-md text-primary text-[18px] mb-4">Engagement Breakdown</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-3 rounded-lg border border-border-subtle bg-surface-gray/50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline">mark_email_read</span>
                  <span className="font-body-sm text-body-sm text-on-surface">Delivered</span>
                </div>
                <span className="font-label-md text-label-md">
                  {stats && stats.sent_count > 0
                    ? `${((stats.sent_count / stats.recipient_count) * 100).toFixed(1)}%`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-border-subtle bg-surface-gray/50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-error">report</span>
                  <span className="font-body-sm text-body-sm text-on-surface">Bounced</span>
                </div>
                <span className="font-label-md text-label-md">
                  {stats ? `${stats.recipient_count - stats.sent_count} (${((1 - stats.sent_count / stats.recipient_count) * 100).toFixed(1)}%)` : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-border-subtle bg-surface-gray/50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline">unsubscribe</span>
                  <span className="font-body-sm text-body-sm text-on-surface">Unsubscribed</span>
                </div>
                <span className="font-label-md text-label-md">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
