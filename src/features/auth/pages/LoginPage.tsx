import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authButtonMotionProps } from "@/features/auth/motion/auth-motion-variants";
import { setCredentials } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/app/hooks";
import { AuthCard } from "../components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { InputField } from "../components/InputField";
import { PasswordInput } from "../components/PasswordInput";
import { SubmitButton } from "../components/SubmitButton";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/features/auth/types/authTypes";
import { useLoginMutation } from "@/services/authApi";

function GoogleIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login({ email: email.trim(), password }).unwrap();
      console.log("Login API response:", res);

      if (res.success && res.data) {
        const { accessToken, role: apiRole } = res.data;

        // Map backend role to frontend app role
        let appRole = "vendor";
        if (apiRole === "service_provider") {
          appRole = "service";
        } else if (apiRole === "staff") {
          const resDataAny = res.data as any;
          const actualStaffType = resDataAny.staffType || resDataAny.staff?.staffType;
          if (actualStaffType === "service_provider") {
            appRole = "service";
          }
        }

        let userId = "unknown";
        let userEmail = email.trim().toLowerCase();

        try {
          const payload = JSON.parse(atob(accessToken.split(".")[1]));
          if (payload.id) userId = payload.id;
          if (payload.email) userEmail = payload.email;
        } catch (err) {
          console.warn("Failed to decode token payload", err);
        }

        dispatch(
          setCredentials({
            token: accessToken,
            user: {
              id: userId,
              email: userEmail,
              role: appRole as UserRole,
              roles: [appRole as UserRole],
            },
          }),
        );

        toast.success(res.message || "User logged in successfully.");

        if (appRole === "vendor") {
          void navigate(
            from && from.startsWith("/vendor") ? from : "/vendor/dashboard",
            { replace: true },
          );
        } else {
          void navigate("/service/dashboard", { replace: true });
        }
      } else {
        toast.error(res.message || "Login failed (success: false)");
      }
    } catch (error: any) {
      console.error("Login catch block error:", error);
      const errorMsg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Failed to log in";
      toast.error(
        typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg),
      );
    }
  }

  return (
    <AuthCard>
      <AuthHeader title="Welcome back" subtitle="Sign in to your dashboard" />

      <div className="grid gap-3">
        <motion.div {...authButtonMotionProps}>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-gray-200 bg-white/70"
          >
            <GoogleIcon className="mr-2 size-4 text-zinc-700" />
            Continue with Google
          </Button>
        </motion.div>
      </div>

      <div className="my-6 flex items-center">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="px-4 text-sm font-medium text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <InputField
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={undefined}
        />
        <PasswordInput
          name="password"
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={undefined}
        />
        <div className="-mt-2 text-right">
          <Link
            to="/auth/forgot-password"
            className="text-xs font-semibold text-[#895129] transition-colors hover:text-[#6f3f1f] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <SubmitButton loading={isLoading}>Sign in</SubmitButton>
        <p className="text-center text-sm text-zinc-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/register"
            className="font-semibold text-[#895129] transition-colors hover:text-[#6f3f1f]"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
