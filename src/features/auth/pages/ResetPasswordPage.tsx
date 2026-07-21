import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthCard } from "../components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { PasswordInput } from "../components/PasswordInput";
import { SubmitButton } from "../components/SubmitButton";
import { isValidOtp6, PASSWORD_MIN } from "@/utils/auth-validation";
import { fetchErrorMessage } from "@/utils/fetch-error";

type St = { email: string; otp: string };

function readResetState(locationState: unknown): St | null {
  const s = locationState as Partial<St> | null;
  if (s?.email && s?.otp && isValidOtp6(s.otp)) {
    return { email: s.email, otp: s.otp };
  }
  try {
    const raw = sessionStorage.getItem("auth_reset");
    if (!raw) {
      return null;
    }
    const j = JSON.parse(raw) as St;
    if (j?.email && j?.otp && isValidOtp6(j.otp)) {
      return j;
    }
  } catch {
    return null;
  }
  return null;
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { state: locState } = useLocation() as { state: unknown };
  const [creds, setCreds] = useState<St | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );
  const [reset, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    const c = readResetState(locState);
    if (c) {
      setCreds(c);
    } else {
      void navigate("/auth/forgot-password", { replace: true });
    }
  }, [locState, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!creds) {
      return;
    }
    const e2: typeof errors = {};
    if (password.length < PASSWORD_MIN) {
      e2.password = `At least ${PASSWORD_MIN} characters`;
    }
    if (password !== confirm) {
      e2.confirm = "Passwords do not match";
    }
    setErrors(e2);
    if (Object.keys(e2).length) {
      return;
    }
    try {
      await reset({ email: creds.email, otp: creds.otp, password }).unwrap();
      sessionStorage.removeItem("auth_reset");
      toast.success("Password updated. Sign in with your new password.");
      void navigate("/auth/login", { replace: true });
    } catch (err) {
      toast.error(fetchErrorMessage(err) ?? "Reset failed");
    }
  }

  if (!creds) {
    return null;
  }

  return (
    <AuthCard>
      <AuthHeader title="Set new password" subtitle={`for ${creds.email}`} />
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <PasswordInput
          id="new-pw"
          name="new-password"
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <PasswordInput
          id="new-pw2"
          name="new-password-confirm"
          label="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
        />
        <SubmitButton loading={isLoading}>Reset password</SubmitButton>
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
