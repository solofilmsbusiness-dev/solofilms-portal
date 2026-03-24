import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign In | Solo Films",
};

export default function SignInPage() {
  return <AuthForm mode="sign-in" />;
}
