import type { Metadata } from "next";

import { LoginForm } from "../_components/LoginForm";

export const metadata: Metadata = {
  title: "Login | Ameefar Energy",
};

export default function LoginPage() {
  return <LoginForm />;
}
