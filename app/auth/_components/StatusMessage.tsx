export function StatusMessage({
  children,
  tone = "error",
}: {
  children: React.ReactNode;
  tone?: "error" | "success";
}) {
  return (
    <p className={tone === "error" ? "auth-alert-error" : "auth-alert-success"}>
      {children}
    </p>
  );
}
