"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectSubscribers,
  selectNewsletterLoading,
  selectNewsletterError,
} from "@/store/newsletter/newsletterSelectors";
import { fetchSubscribers } from "@/store/newsletter/newsletterThunks";

export default function SubscribersPage() {
  const dispatch = useAppDispatch();
  const subscribers = useAppSelector(selectSubscribers);
  const loading = useAppSelector(selectNewsletterLoading);
  const error = useAppSelector(selectNewsletterError);

  useEffect(() => {
    dispatch(fetchSubscribers());
  }, [dispatch]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Subscribers</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage newsletter subscribers ({subscribers.length} total).
          </p>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center text-on-surface-variant font-body-md">Loading...</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-body-md mb-8">{error}</div>
      )}

      {!loading && !error && subscribers.length === 0 && (
        <div className="py-12 text-center text-on-surface-variant font-body-md">No subscribers yet.</div>
      )}

      {!loading && subscribers.length > 0 && (
        <div className="bg-white rounded-xl border border-border-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-gray border-b border-border-subtle">
                <th className="text-left px-5 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-surface-gray/50 transition-colors">
                  <td className="px-5 py-4 font-body-md text-body-md text-on-surface">{sub.email}</td>
                  <td className="px-5 py-4 font-body-md text-body-md text-on-surface">{sub.name || "—"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-md text-label-md ${
                        sub.is_active
                          ? "bg-trust-green-subtle text-secondary"
                          : "bg-surface-gray text-on-surface-variant"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sub.is_active ? "bg-secondary" : "bg-outline"}`} />
                      {sub.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-body-sm text-body-sm text-on-surface-variant">
                    {new Date(sub.subscribed_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
