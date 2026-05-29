import type { Metadata } from "next";

import { PasswordResetRequestForm } from "../_components/PasswordResetRequestForm";

export const metadata: Metadata = {
  title: "Reset Password | Ameefar Energy",
};

export default function PasswordResetPage() {
  return <PasswordResetRequestForm />;
}
