import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthCard } from "../components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { InputField } from "../components/InputField";
import { SubmitButton } from "../components/SubmitButton";
import { isValidEmail } from "@/utils/auth-validation";
import { fetchErrorMessage } from "@/utils/fetch-error";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [sendOtp, { isLoading }] = useSendOtpMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email");
      return;
    }
    setError(undefined);
    try {
      const em = email.trim().toLowerCase();
      await sendOtp({ email: em }).unwrap();
      sessionStorage.setItem("otp_email", em);
      toast.success("We sent a 6-digit code to your email");
      void navigate("/auth/verify-otp", { state: { email: em } });
    } catch (err) {
      toast.error(fetchErrorMessage(err) ?? "Could not send code");
    }
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Forgot password"
        subtitle="We’ll email a 6-digit code — no links."
      />
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <InputField
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />
        <SubmitButton loading={isLoading}>Send OTP</SubmitButton>
        <p className="text-center text-sm text-zinc-600">
          <Link
            to="/auth/login"
            className="font-semibold text-[#895129] transition-colors hover:text-[#6f3f1f]"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
