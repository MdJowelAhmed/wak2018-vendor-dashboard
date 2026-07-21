import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useVerifyOtpMutation } from "@/features/auth";
import { AuthCard } from "../components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { OtpInput } from "../components/OtpInput";
import { SubmitButton } from "../components/SubmitButton";
import { isValidOtp6 } from "@/utils/auth-validation";
import { fetchErrorMessage } from "@/utils/fetch-error";

type LocationState = { email?: string };

const OTP_EMAIL_KEY = "otp_email";

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState | null };
  const fromState = state?.email;
  const fromStore =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(OTP_EMAIL_KEY)
      : null;
  const [email, setEmail] = useState(fromState ?? fromStore ?? "");
  const [otp, setOtp] = useState("");
  const [verify, { isLoading }] = useVerifyOtpMutation();

  useEffect(() => {
    if (fromState) {
      sessionStorage.setItem(OTP_EMAIL_KEY, fromState);
      setEmail(fromState);
    }
  }, [fromState]);

  useEffect(() => {
    if (!email) {
      void navigate("/auth/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidOtp6(otp)) {
      toast.error("Enter the 6-digit code");
      return;
    }
    if (!email) {
      return;
    }
    try {
      await verify({ email, otp }).unwrap();
      toast.success("Code verified");
      sessionStorage.setItem("auth_reset", JSON.stringify({ email, otp }));
      void navigate("/auth/reset-password", {
        state: { email, otp },
        replace: true,
      });
    } catch (err) {
      toast.error(fetchErrorMessage(err) ?? "Verification failed");
    }
  }

  if (!email) {
    return null;
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Enter verification code"
        subtitle={`6-digit code sent to ${email}`}
      />
      <form
        onSubmit={onSubmit}
        className="mt-6 flex flex-col items-stretch gap-4"
      >
        <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
        <p className="text-center text-xs text-zinc-500">
          Paste or type — it auto-advances on each digit.
        </p>
        <SubmitButton loading={isLoading}>Verify</SubmitButton>
        <p className="text-center text-sm text-zinc-600">
          <Link
            to="/auth/forgot-password"
            className="font-semibold text-[#895129] transition-colors hover:text-[#6f3f1f]"
          >
            Change email
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
