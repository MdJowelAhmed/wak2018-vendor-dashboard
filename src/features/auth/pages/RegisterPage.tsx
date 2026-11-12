import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRegisterMutation } from "@/services/authApi";
import { useGetCountriesQuery } from "@/services/profileApi";
import { AuthCard } from "../components/AuthCard";
import { AuthHeader } from "../components/AuthHeader";
import { InputField } from "../components/InputField";
import { PasswordInput } from "../components/PasswordInput";
import { RoleSelector } from "../components/RoleSelector";
import { SubmitButton } from "../components/SubmitButton";
import { SearchableSelect } from "@/features/shipping-addresses/components/SearchableSelect";
import type { UserRole } from "@/features/auth/types/authTypes";
import { isValidEmail, PASSWORD_MIN } from "@/utils/auth-validation";
import { fetchErrorMessage } from "@/utils/fetch-error";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/utils";
import {
  authInputFocusClass,
  authInputShakeTransition,
} from "@/features/auth/motion/auth-motion-variants";

export function RegisterPage() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole>("vendor");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isVendor = role === "vendor";
  const { data: countriesRes, isLoading: countriesLoading } =
    useGetCountriesQuery(undefined, { skip: !isVendor });

  const countryOptions = useMemo(
    () =>
      (countriesRes?.data ?? []).map((c) => ({
        value: c.countryCode,
        label: c.name,
        keywords: c.countryCode,
      })),
    [countriesRes?.data],
  );

  function validate() {
    const e2: Record<string, string> = {};
    if (!name.trim()) {
      e2.name = "Name is required";
    }
    if (!email) {
      e2.email = "Email is required";
    } else if (!isValidEmail(email)) {
      e2.email = "Enter a valid email";
    }
    if (!phone.trim()) {
      e2.phone = "Phone is required";
    }
    if (isVendor && !country.trim()) {
      e2.countryCode = "Country is required";
    }
    if (!password) {
      e2.password = "Password is required";
    } else if (password.length < PASSWORD_MIN) {
      e2.password = `At least ${PASSWORD_MIN} characters`;
    }
    if (password !== confirm) {
      e2.confirm = "Passwords do not match";
    }
    setErrors(e2);
    return Object.keys(e2).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      return;
    }
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: isVendor ? "vendor" : "service_provider",
        ...(isVendor ? { country } : {}),
      }).unwrap();
      toast.success("Account created! Please verify your email.");
      void navigate("/auth/verify-otp", {
        replace: true,
        state: {
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          name: name.trim(),
          role,
          mode: "register",
        },
      });
    } catch (err) {
      toast.error(fetchErrorMessage(err) ?? "Registration failed");
    }
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Create account"
        subtitle="Choose a role and complete your profile"
      />
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-1">
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-800">I am a</p>
          <RoleSelector
            value={role}
            onChange={(next) => {
              setRole(next);
              setErrors((prev) => {
                if (!prev.countryCode) return prev;
                const nextErrors = { ...prev };
                delete nextErrors.countryCode;
                return nextErrors;
              });
            }}
            disabled={isLoading}
          />
        </div>
        <InputField
          id="name"
          name="name"
          label="Full name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <InputField
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <InputField
          id="phone"
          name="phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
        />
        {isVendor ? (
        <motion.div
          className="flex w-full flex-col gap-1.5"
          animate={errors.countryCode ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
          transition={authInputShakeTransition}
        >
          <Label className="text-sm font-medium text-zinc-800" htmlFor="country">
            Country
          </Label>
          <SearchableSelect
            id="country"
            value={country}
            onChange={(code) => {
              setCountry(code);
              setErrors((prev) => {
                if (!prev.countryCode) return prev;
                const next = { ...prev };
                delete next.countryCode;
                return next;
              });
            }}
            options={countryOptions}
            placeholder={
              countriesLoading ? "Loading countries…" : "Select a country"
            }
            searchPlaceholder="Search country…"
            disabled={isLoading || countriesLoading}
            emptyText={
              countriesLoading
                ? "Loading countries…"
                : "No countries found. Try another search."
            }
            className={cn(
              "h-12 rounded-xl border border-gray-200 bg-white/80 text-zinc-900 shadow-sm",
              authInputFocusClass,
              errors.country && "border-destructive",
            )}
          />
          {errors.country ? (
            <p className="text-destructive text-xs" role="alert">
              {errors.country}
            </p>
          ) : null}
        </motion.div>
        ) : null}
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <PasswordInput
          id="confirm"
          name="confirm"
          label="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />
        <SubmitButton loading={isLoading}>Create account</SubmitButton>
        <p className="text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-semibold text-[#895129] transition-colors hover:text-[#6f3f1f]"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
