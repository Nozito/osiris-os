export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 40%, black 0%, transparent 80%)",
        }}
      />
      <div className="glass-strong relative w-full max-w-sm rounded-3xl p-8 shadow-[0_24px_80px_-20px_rgba(0,102,255,0.25)]">
        {children}
      </div>
    </div>
  );
}
