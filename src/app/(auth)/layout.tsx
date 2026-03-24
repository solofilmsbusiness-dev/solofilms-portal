import { AnimatedBackground } from "@/components/shared/AnimatedBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AnimatedBackground />
      {children}
    </div>
  );
}
