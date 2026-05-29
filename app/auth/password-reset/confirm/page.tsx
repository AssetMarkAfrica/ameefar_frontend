import type { Metadata } from "next";
import { Suspense } from "react";

import { PasswordResetConfirmForm } from "../../_components/PasswordResetConfirmForm";

export const metadata: Metadata = {
  title: "Confirm Password Reset | Ameefar Energy",
};

export default function PasswordResetConfirmPage() {
  return (
    <Suspense>
      <PasswordResetConfirmForm />
    </Suspense>
  );
}
