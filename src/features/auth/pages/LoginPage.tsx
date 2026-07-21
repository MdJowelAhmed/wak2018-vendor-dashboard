import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authButtonMotionProps } from "@/features/auth/motion/auth-motion-variants";
import { setCredentials } from "@/features/auth";
import { useAppDispatch } from "@/app/hooks";
import { AuthCard } from "../components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { InputField } from "../components/InputField";
import { PasswordInput } from "../components/PasswordInput";
import { SubmitButton } from "../components/SubmitButton";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/features/auth";

function GoogleIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={props.className}>
      <path
        fill="currentColor"
        d="M12 10.2v3.6h5.05c-.2 1.15-1.37 3.37-5.05 3.37A5.8 5.8 0 0 1 6.2 12a5.8 5.8 0 0 1 5.8-5.8c1.5 0 2.5.64 3.07 1.2l2.1-2.02C15.9 4.16 14.2 3.3 12 3.3A8.7 8.7 0 1 0 12 20.7c5.02 0 8.35-3.52 8.35-8.47 0-.57-.06-1-.14-1.43H12z"
      />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const dispatch = useAppDispatch();
  const [role, setRole] = useState<UserRole>("vendor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selectedRole = role;
    dispatch(
      setCredentials({
        token: "ui-role",
        user: {
          id: "ui-user",
          email: email.trim().toLowerCase(),
          role: selectedRole,
          roles: [selectedRole],
        },
      }),
    );
    toast.success("Welcome back");
    if (selectedRole === "vendor") {
      void navigate(
        from && from.startsWith("/vendor") ? from : "/vendor/dashboard",
        { replace: true },
      );
      return;
    }
    void navigate("/service/dashboard", { replace: true });
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
        <div className="grid gap-2">
          <div className="text-sm font-medium text-zinc-700">I am a</div>
          <div className="grid grid-cols-2 rounded-xl border border-gray-200 bg-white/70 p-1">
            <button
              type="button"
              onClick={() => setRole("vendor")}
              className={[
                "h-10 rounded-lg text-sm font-semibold transition-colors",
                role === "vendor"
                  ? "bg-[#895129] text-white"
                  : "bg-transparent text-zinc-700 hover:bg-white",
              ].join(" ")}
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={() => setRole("service")}
              className={[
                "h-10 rounded-lg text-sm font-semibold transition-colors",
                role === "service"
                  ? "bg-[#895129] text-white"
                  : "bg-transparent text-zinc-700 hover:bg-white",
              ].join(" ")}
            >
              Service Provider
            </button>
          </div>
        </div>
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
        <SubmitButton loading={false}>Sign in</SubmitButton>
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
