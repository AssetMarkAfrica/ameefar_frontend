import Image from "next/image";
import Link from "next/link";

import { logoSrc } from "./auth-constants";

export function AuthHeader() {
  return (
    <header className="auth-header">
      <Link className="auth-brand" href="/">
        <Image alt="Ameefar Energy Logo" height={32} src={logoSrc} width={32} />
        <span>Ameefar Energy</span>
      </Link>
      <nav className="auth-nav" aria-label="Auth navigation">
        <Link href="/auth/login">LOGIN</Link>
        <Link className="auth-icon-link" href="/auth/register" aria-label="Create account">
          ?
        </Link>
      </nav>
    </header>
  );
}
