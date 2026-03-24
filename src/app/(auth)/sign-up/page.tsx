import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign Up | Solo Films",
};

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />;
}
