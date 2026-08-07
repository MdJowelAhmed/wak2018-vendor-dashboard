import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../authSlice";
import { toast } from "sonner";
import { AuthCard } from "../components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { OtpInput } from "../components/OtpInput";
import { SubmitButton } from "../components/SubmitButton";
import { isValidOtp6 } from "@/utils/auth-validation";
import { fetchErrorMessage } from "@/utils/fetch-error";

import {
  useVerifyEmailMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
} from "@/services/authApi";

type LocationState = {
  email?: string;
  mode?: "register" | "forgot";
  role?: string;
  name?: string;
  phone?: string;
};

const OTP_EMAIL_KEY = "otp_email";
const OTP_MODE_KEY = "otp_mode";
const OTP_ROLE_KEY = "otp_role";

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation() as { state: LocationState | null };
  const fromState = state?.email;
  const mode = state?.mode ?? sessionStorage.getItem(OTP_MODE_KEY) ?? "forgot";
  const role = state?.role ?? sessionStorage.getItem(OTP_ROLE_KEY);

  const fromStore =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(OTP_EMAIL_KEY)
      : null;
  const [email, setEmail] = useState(fromState ?? fromStore ?? "");
  const [otp, setOtp] = useState("");

  const [verifyForgot, { isLoading: forgotLoading }] = useVerifyOtpMutation();
  const [verifyEmailMutation, { isLoading: emailLoading }] =
    useVerifyEmailMutation();
  const [resendOtp, { isLoading: resendLoading }] = useResendOtpMutation();
  const isLoading = forgotLoading || emailLoading || resendLoading;

  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [countdown]);

  async function handleResend() {
    if (!email) return;
    try {
      await resendOtp({ email }).unwrap();
      setCountdown(60);
      toast.success("Verification code resent to your email");
    } catch (err) {
      toast.error(fetchErrorMessage(err) ?? "Failed to resend code");
    }
  }
  useEffect(() => {
    if (fromState) {
      sessionStorage.setItem(OTP_EMAIL_KEY, fromState);
      if (state.mode) sessionStorage.setItem(OTP_MODE_KEY, state.mode);
      if (state.role) sessionStorage.setItem(OTP_ROLE_KEY, state.role);
      setEmail(fromState);
    }
  }, [fromState, state]);

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
      if (mode === "register") {
        const res = await verifyEmailMutation({
          email,
          oneTimeCode: Number(otp),
        }).unwrap();
        if (res.data?.token) {
          dispatch(setToken(res.data.token));
        }
        toast.success("Email verified successfully!");
        sessionStorage.removeItem(OTP_EMAIL_KEY);
        sessionStorage.removeItem(OTP_MODE_KEY);
        sessionStorage.removeItem(OTP_ROLE_KEY);

        const onboardingPath =
          role === "service" ? "/onboarding/service" : "/onboarding/vendor";
        void navigate(onboardingPath, {
          state: { email, phone: state?.phone, name: state?.name },
          replace: true,
        });
      } else {
        const res = await verifyForgot({ email, otp }).unwrap();
        const token = res.data?.token;
        toast.success("Code verified");
        sessionStorage.setItem(
          "auth_reset",
          JSON.stringify({ email, otp, token }),
        );
        void navigate("/auth/reset-password", {
          state: { email, otp, token },
          replace: true,
        });
      }
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
        <div className="flex items-center justify-center gap-4 text-sm text-zinc-600">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || countdown > 0}
            className="font-semibold text-[#895129] transition-colors hover:text-[#6f3f1f] disabled:opacity-50"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
          </button>
          <span>•</span>
          <Link
            to="/auth/forgot-password"
            className="font-semibold text-[#895129] transition-colors hover:text-[#6f3f1f]"
          >
            Change email
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
