import type { Metadata } from "next";

import { RegisterForm } from "../_components/RegisterForm";

export const metadata: Metadata = {
  title: "Register | Ameefar Energy",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
