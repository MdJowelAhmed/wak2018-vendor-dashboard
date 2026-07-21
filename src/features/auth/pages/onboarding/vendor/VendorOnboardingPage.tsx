import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STORAGE_KEY = "vendor_onboarding_v1";

type StepId = 2 | 3 | 4;
type DeliveryType = "own" | "platform" | "";

type VendorData = {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  category: string[];
  shopType: string;
  productCount: string;
  description: string;
  deliveryType: DeliveryType;
};

const defaultData: VendorData = {
  businessName: "",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  category: [],
  shopType: "",
  productCount: "",
  description: "",
  deliveryType: "",
};

const vendorCategoryOptions = [
  "Grocery",
  "Restaurant",
  "Fashion",
  "Electronics",
  "Beauty",
  "Home & Kitchen",
  "Kids",
  "Health",
  "Books",
  "Sports",
];

function readStored(): Partial<VendorData> | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<VendorData>;
  } catch {
    return null;
  }
}

function store(data: VendorData) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function OnboardingCard(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-2xl rounded-2xl bg-white p-8 text-gray-900 shadow-lg",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

function StepIndicator({ current }: { current: StepId }) {
  const steps = [
    { id: 1, title: "Account" },
    { id: 2, title: "Business" },
    { id: 3, title: "Payment" },
    { id: 4, title: "Done" },
  ] as const;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {steps.map((s) => {
          const active = s.id === current;
          const completed = s.id < current;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-sm font-semibold",
                  completed &&
                    "border-[#895129] bg-[#895129]/10 text-[#895129]",
                  active && "border-[#895129] bg-[#895129] text-white",
                  !completed &&
                    !active &&
                    "border-gray-200 bg-white text-gray-500",
                )}
              >
                {s.id}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  active ? "text-gray-900" : "text-gray-400",
                )}
              >
                {s.title}
              </span>
              {s.id !== 4 ? (
                <div className="mx-1 hidden h-px w-10 bg-gray-200 sm:block" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm text-gray-700">{props.label}</Label>
      {props.children}
      {props.hint ? (
        <p className="text-xs text-gray-500">{props.hint}</p>
      ) : null}
    </div>
  );
}

function LightInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className={cn(
        "h-11 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400",
        "transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#895129] focus-visible:ring-offset-0",
        props.className,
      )}
    />
  );
}

function LightTextarea(props: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      {...props}
      className={cn(
        "min-h-24 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400",
        "transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#895129] focus-visible:ring-offset-0",
        props.className,
      )}
    />
  );
}

function MultiSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: string[];
  placeholder: string;
}) {
  const selectedSet = useMemo(() => new Set(value), [value]);
  return (
    <div className="grid gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 w-full justify-between rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
              "transition-all duration-200",
            )}
          >
            <span
              className={cn(
                "truncate text-left",
                value.length ? "text-gray-900" : "text-gray-400",
              )}
            >
              {value.length ? `${value.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="size-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[18rem] border-gray-200 bg-white text-gray-900">
          {options.map((o) => {
            const checked = selectedSet.has(o);
            return (
              <DropdownMenuCheckboxItem
                key={o}
                checked={checked}
                onCheckedChange={(next) => {
                  if (next) onChange([...value, o]);
                  else onChange(value.filter((x) => x !== o));
                }}
                className="focus:bg-gray-100"
              >
                {o}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {value.length ? (
        <div className="flex flex-wrap gap-2">
          {value.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className="gap-1 border border-gray-200 bg-gray-50 text-gray-700"
            >
              {v}
              <button
                type="button"
                className="rounded-sm p-0.5 text-gray-400 hover:text-gray-700"
                onClick={() => onChange(value.filter((x) => x !== v))}
                aria-label={`Remove ${v}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StripeIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={props.className}>
      <path
        fill="currentColor"
        d="M10.18 9.2c0-.61.5-.85 1.32-.85 1.17 0 2.65.36 3.82.99V5.76c-1.29-.51-2.56-.71-3.82-.71-3.13 0-5.21 1.64-5.21 4.39 0 4.28 5.9 3.6 5.9 5.44 0 .73-.63 1.0-1.52 1.0-1.3 0-2.97-.53-4.29-1.24v3.62c1.46.63 2.93.89 4.29.89 3.2 0 5.4-1.58 5.4-4.37 0-4.62-5.89-3.79-5.89-5.58Z"
      />
    </svg>
  );
}

function Step3StripePayment({
  onConnect,
  onSkip,
}: {
  onConnect: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect Stripe to receive payouts securely.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#895129]/10 text-[#895129]">
            <StripeIcon className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-gray-900">
              Connect with Stripe
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Link your Stripe account to start receiving payments. You can
              finish setup now or skip and connect later.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                className="h-11 rounded-xl bg-[#895129] px-6 text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#6f3f1f]"
                onClick={onConnect}
              >
                Connect with Stripe
              </Button>
              <button
                type="button"
                onClick={onSkip}
                className="text-left text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2VendorBusiness({
  data,
  setData,
  errors,
  logo,
  setLogo,
  cover,
  setCover,
}: {
  data: VendorData;
  setData: (patch: Partial<VendorData>) => void;
  errors: Partial<Record<keyof VendorData, string>>;
  logo: File | null;
  setLogo: (f: File | null) => void;
  cover: File | null;
  setCover: (f: File | null) => void;
}) {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business details</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up your shop profile so customers can recognize your brand.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Business name">
          <LightInput
            value={data.businessName}
            onChange={(e) => setData({ businessName: e.target.value })}
          />
          {errors.businessName ? (
            <p className="text-xs text-red-600">{errors.businessName}</p>
          ) : null}
        </Field>
        <Field label="Owner name">
          <LightInput
            value={data.ownerName}
            onChange={(e) => setData({ ownerName: e.target.value })}
          />
          {errors.ownerName ? (
            <p className="text-xs text-red-600">{errors.ownerName}</p>
          ) : null}
        </Field>
        <Field label="Phone">
          <LightInput
            value={data.phone}
            onChange={(e) => setData({ phone: e.target.value })}
          />
          {errors.phone ? (
            <p className="text-xs text-red-600">{errors.phone}</p>
          ) : null}
        </Field>
        <Field label="Email">
          <LightInput
            value={data.email}
            onChange={(e) => setData({ email: e.target.value })}
          />
          {errors.email ? (
            <p className="text-xs text-red-600">{errors.email}</p>
          ) : null}
        </Field>
      </div>

      <Field label="Address">
        <LightInput
          value={data.address}
          onChange={(e) => setData({ address: e.target.value })}
        />
        {errors.address ? (
          <p className="text-xs text-red-600">{errors.address}</p>
        ) : null}
      </Field>

      <Field label="Category">
        <MultiSelect
          value={data.category}
          onChange={(v) => setData({ category: v })}
          options={vendorCategoryOptions}
          placeholder="Select categories"
        />
        {errors.category ? (
          <p className="text-xs text-red-600">{errors.category}</p>
        ) : null}
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Shop type"
          hint="Example: Retail, Online-only, Restaurant, Grocery"
        >
          <LightInput
            value={data.shopType}
            onChange={(e) => setData({ shopType: e.target.value })}
            placeholder="e.g. Retail"
          />
          {errors.shopType ? (
            <p className="text-xs text-red-600">{errors.shopType}</p>
          ) : null}
        </Field>
        <Field
          label="Product count"
          hint="Approximate number of products you’ll list"
        >
          <LightInput
            inputMode="numeric"
            value={data.productCount}
            onChange={(e) =>
              setData({ productCount: e.target.value.replace(/[^\d]/g, "") })
            }
            placeholder="e.g. 50"
          />
          {errors.productCount ? (
            <p className="text-xs text-red-600">{errors.productCount}</p>
          ) : null}
        </Field>
      </div>

      <Field label="Delivery type">
        <Select
          value={data.deliveryType}
          onValueChange={(v) => setData({ deliveryType: v as DeliveryType })}
        >
          <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white text-gray-900">
            <SelectValue placeholder="Select delivery type" />
          </SelectTrigger>
          <SelectContent className="border-gray-200 bg-white text-gray-900">
            <SelectItem value="own">Own delivery</SelectItem>
            <SelectItem value="platform">Platform delivery</SelectItem>
          </SelectContent>
        </Select>
        {errors.deliveryType ? (
          <p className="text-xs text-red-600">{errors.deliveryType}</p>
        ) : null}
      </Field>

      <Field label="Description">
        <LightTextarea
          value={data.description}
          onChange={(e) => setData({ description: e.target.value })}
          placeholder="Tell customers what you sell and what makes your shop unique…"
        />
        {errors.description ? (
          <p className="text-xs text-red-600">{errors.description}</p>
        ) : null}
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Logo upload">
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#895129] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#6f3f1f]"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setLogo(f);
              e.currentTarget.value = "";
            }}
          />
          {logo ? (
            <Badge
              variant="secondary"
              className="mt-2 inline-flex items-center gap-1 border border-gray-200 bg-white text-gray-700"
            >
              {logo.name}
              <button
                type="button"
                className="rounded-sm p-0.5 text-gray-400 hover:text-gray-700"
                onClick={() => setLogo(null)}
                aria-label="Remove logo"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ) : null}
          {errors.businessName && !logo ? null : null}
        </Field>

        <Field label="Cover image (optional)">
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#895129] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#6f3f1f]"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setCover(f);
              e.currentTarget.value = "";
            }}
          />
          {cover ? (
            <Badge
              variant="secondary"
              className="mt-2 inline-flex items-center gap-1 border border-gray-200 bg-white text-gray-700"
            >
              {cover.name}
              <button
                type="button"
                className="rounded-sm p-0.5 text-gray-400 hover:text-gray-700"
                onClick={() => setCover(null)}
                aria-label="Remove cover image"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ) : null}
        </Field>
      </div>
    </div>
  );
}

function isEmail(v: string) {
  return /^\S+@\S+\.\S+$/.test(v);
}

export function VendorOnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { email?: string; phone?: string; name?: string } | null;
  };

  const [step, setStep] = useState<StepId>(2);
  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [data, setDataState] = useState<VendorData>(() => {
    const stored = readStored();
    const seed = (location.state ?? {}) as {
      email?: string;
      phone?: string;
      name?: string;
    };
    return {
      ...defaultData,
      ...stored,
      email: stored?.email ?? seed.email ?? defaultData.email,
      phone: stored?.phone ?? seed.phone ?? defaultData.phone,
      ownerName: stored?.ownerName ?? seed.name ?? defaultData.ownerName,
    };
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof VendorData, string>>
  >({});

  useEffect(() => {
    store(data);
  }, [data]);

  function setData(patch: Partial<VendorData>) {
    setDataState((prev) => ({ ...prev, ...patch }));
  }

  function validateCurrent(): boolean {
    const e: Partial<Record<keyof VendorData, string>> = {};
    if (step === 2) {
      if (!data.businessName.trim())
        e.businessName = "Business name is required";
      if (!data.ownerName.trim()) e.ownerName = "Owner name is required";
      if (!data.phone.trim()) e.phone = "Phone is required";
      if (!data.email.trim()) e.email = "Email is required";
      else if (!isEmail(data.email.trim())) e.email = "Enter a valid email";
      if (!data.address.trim()) e.address = "Address is required";
      if (!data.category.length) e.category = "Select at least one category";
      if (!data.shopType.trim()) e.shopType = "Shop type is required";
      if (!data.productCount.trim())
        e.productCount = "Product count is required";
      if (!data.description.trim()) e.description = "Description is required";
      if (!data.deliveryType) e.deliveryType = "Select a delivery type";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateCurrent()) return;
    setErrors({});
    setStep((s) => (s === 2 ? 3 : 4));
  }

  function back() {
    setErrors({});
    setStep((s) => (s === 4 ? 3 : 2));
  }

  function finish() {
    toast.success("Onboarding complete");
    localStorage.removeItem(STORAGE_KEY);
    void navigate("/vendor/dashboard", { replace: true });
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-gradient-to-br from-[#f9f7f5] via-white to-[#f3ede8]">
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-[#895129] blur-3xl opacity-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 h-[30rem] w-[30rem] rounded-full bg-[#c09a7a] blur-3xl opacity-20"
        aria-hidden
      />

      <div className="relative flex min-h-svh items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">
              Vendor Onboarding
            </div>
            <Link
              to="/vendor/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Skip for now
            </Link>
          </div>

          <OnboardingCard>
            <StepIndicator current={step} />

            {step === 2 ? (
              <Step2VendorBusiness
                data={data}
                setData={setData}
                errors={errors}
                logo={logo}
                setLogo={setLogo}
                cover={cover}
                setCover={setCover}
              />
            ) : null}

            {step === 3 ? (
              <Step3StripePayment
                onConnect={() => {
                  toast.message("Stripe connect UI placeholder", {
                    description:
                      "Wire this to your vendor Stripe Connect flow next.",
                  });
                  setStep(4);
                }}
                onSkip={() => setStep(4)}
              />
            ) : null}

            {step === 4 ? (
              <div className="grid gap-3 text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  You’re all set
                </h1>
                <p className="text-sm text-gray-500">
                  Your vendor profile is ready. You can edit everything later.
                </p>
                <div className="mt-4">
                  <Button
                    type="button"
                    className="h-11 rounded-xl bg-[#895129] px-6 text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#6f3f1f]"
                    onClick={finish}
                  >
                    Go to dashboard
                  </Button>
                </div>
              </div>
            ) : null}

            {step !== 4 ? (
              <div className="mt-8 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={back}
                  disabled={step === 2}
                  className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="mr-2 size-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={next}
                  className="h-11 rounded-xl bg-[#895129] px-6 text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#6f3f1f]"
                >
                  Next
                  <ChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            ) : null}
          </OnboardingCard>
        </div>
      </div>
    </div>
  );
}
