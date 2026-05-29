import Link from "next/link";

export function AuthFooter() {
  return (
    <footer className="auth-footer">
      <div className="auth-footer-inner">
        <div>
          <p className="auth-footer-brand">Ameefar Energy</p>
          <p className="auth-muted">(c) 2026 Ameefar Energy. Professional Recycling Marketplace.</p>
        </div>
        <div className="auth-footer-links">
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
          <Link href="#">Compliance</Link>
          <Link href="#">Support</Link>
        </div>
      </div>
    </footer>
  );
}
