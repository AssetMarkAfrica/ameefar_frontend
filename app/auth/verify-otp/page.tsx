import type { Metadata } from "next";

import { OtpVerificationForm } from "../_components/OtpVerificationForm";

export const metadata: Metadata = {
  title: "Verify Your Identity | Ameefar Energy",
};

export default function VerifyOtpPage() {
  return <OtpVerificationForm />;
}
