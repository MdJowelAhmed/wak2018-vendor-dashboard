import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
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
import { useUpdateServiceProviderProfileMutation } from "@/services/profileApi";

const STORAGE_KEY = "service_onboarding_v1";

type ExperienceLevel = "beginner" | "intermediate" | "expert";
type Availability = "fullTime" | "partTime" | "weekends";

type OnboardingData = {
  // Step 2
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  serviceCategories: string[];
  serviceArea: string;

  // Step 3
  experienceLevel: ExperienceLevel | "";
  yearsExperience: string;
  skills: string[];
  portfolioLinks: string[];
  languages: string[];
  availability: Availability | "";

  // Step 4
  serviceTitle: string;
  serviceCategory: string;
  price: string;
  deliveryTime: string;
  description: string;
  features: string[];
};

const defaultData: OnboardingData = {
  businessName: "",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  serviceCategories: [],
  serviceArea: "",
  experienceLevel: "",
  yearsExperience: "",
  skills: [],
  portfolioLinks: [],
  languages: [],
  availability: "",

  serviceTitle: "",
  serviceCategory: "",
  price: "",
  deliveryTime: "",
  description: "",
  features: [],
};

const categoryOptions = [
  "Home Services",
  "Cleaning",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Appliance Repair",
  "Beauty & Wellness",
  "Fitness",
  "Tutoring",
  "IT Support",
  "Design",
];

const languageOptions = [
  "English",
  "Arabic",
  "French",
  "Spanish",
  "Hindi",
  "Bengali",
  "Urdu",
];

type StepId = 2 | 3 | 4 | 5 | 6;

function readStored(): Partial<OnboardingData> | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<OnboardingData>;
  } catch {
    return null;
  }
}

function store(data: OnboardingData) {
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
    { id: 3, title: "Professional" },
    { id: 4, title: "Service Setup" },
    { id: 5, title: "Payment" },
    { id: 6, title: "Done" },
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
              {s.id !== 6 ? (
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

function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const next = raw
      .split(/[,\n]/g)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!next.length) return;
    const set = new Set(value);
    for (const t of next) set.add(t);
    onChange(Array.from(set));
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-[#895129]">
        {value.map((t) => (
          <Badge
            key={t}
            variant="secondary"
            className="gap-1 border border-gray-200 bg-gray-50 text-gray-700"
          >
            {t}
            <button
              type="button"
              className="rounded-sm p-0.5 text-gray-400 hover:text-gray-700"
              onClick={() => onChange(value.filter((x) => x !== t))}
              aria-label={`Remove ${t}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="min-w-[12ch] flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
        />
      </div>
      <p className="text-xs text-gray-500">
        Press Enter or comma to add. Backspace removes the last tag.
      </p>
    </div>
  );
}

function isEmail(v: string) {
  return /^\S+@\S+\.\S+$/.test(v);
}

function Step2Business({
  data,
  setData,
  errors,
}: {
  data: OnboardingData;
  setData: (patch: Partial<OnboardingData>) => void;
  errors: Partial<Record<keyof OnboardingData, string>>;
}) {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business details</h1>
        <p className="mt-1 text-sm text-gray-500">
          Help customers trust you and find you faster.
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

      <Field label="Service category (multi-select)">
        <MultiSelect
          value={data.serviceCategories}
          onChange={(v) => setData({ serviceCategories: v })}
          options={categoryOptions}
          placeholder="Select one or more categories"
        />
        {errors.serviceCategories ? (
          <p className="text-xs text-red-600">{errors.serviceCategories}</p>
        ) : null}
      </Field>

      <Field
        label="Service area"
        hint="Example: Dhaka + 10km, Gulshan/Banani, or “Remote/Online”"
      >
        <LightInput
          value={data.serviceArea}
          onChange={(e) => setData({ serviceArea: e.target.value })}
        />
        {errors.serviceArea ? (
          <p className="text-xs text-red-600">{errors.serviceArea}</p>
        ) : null}
      </Field>
    </div>
  );
}

function Step3Professional({
  data,
  setData,
  errors,
}: {
  data: OnboardingData;
  setData: (patch: Partial<OnboardingData>) => void;
  errors: Partial<Record<keyof OnboardingData, string>>;
}) {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Professional info</h1>
        <p className="mt-1 text-sm text-gray-500">
          Show your expertise with skills, experience, and availability.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Experience level">
          <Select
            value={data.experienceLevel}
            onValueChange={(v) =>
              setData({ experienceLevel: v as ExperienceLevel })
            }
          >
            <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white text-gray-900">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent className="border-gray-200 bg-white text-gray-900">
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          {errors.experienceLevel ? (
            <p className="text-xs text-red-600">{errors.experienceLevel}</p>
          ) : null}
        </Field>

        <Field label="Years of experience">
          <LightInput
            inputMode="numeric"
            value={data.yearsExperience}
            onChange={(e) =>
              setData({
                yearsExperience: e.target.value.replace(/[^\d.]/g, ""),
              })
            }
            placeholder="e.g. 3"
          />
          {errors.yearsExperience ? (
            <p className="text-xs text-red-600">{errors.yearsExperience}</p>
          ) : null}
        </Field>
      </div>

      <Field label="Skills" hint="Add your top skills (tags).">
        <TagsInput
          value={data.skills}
          onChange={(v) => setData({ skills: v })}
          placeholder="Type a skill and press Enter…"
        />
        {errors.skills ? (
          <p className="text-xs text-red-600">{errors.skills}</p>
        ) : null}
      </Field>

      <Field
        label="Portfolio links"
        hint="Paste links separated by commas or new lines."
      >
        <LightTextarea
          value={data.portfolioLinks.join("\n")}
          onChange={(e) =>
            setData({
              portfolioLinks: e.target.value
                .split(/[,\n]/g)
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="https://…"
        />
      </Field>

      <Field label="Languages (multi-select)">
        <MultiSelect
          value={data.languages}
          onChange={(v) => setData({ languages: v })}
          options={languageOptions}
          placeholder="Select languages"
        />
        {errors.languages ? (
          <p className="text-xs text-red-600">{errors.languages}</p>
        ) : null}
      </Field>

      <Field label="Availability">
        <Select
          value={data.availability}
          onValueChange={(v) => setData({ availability: v as Availability })}
        >
          <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white text-gray-900">
            <SelectValue placeholder="Select availability" />
          </SelectTrigger>
          <SelectContent className="border-gray-200 bg-white text-gray-900">
            <SelectItem value="fullTime">Full-time</SelectItem>
            <SelectItem value="partTime">Part-time</SelectItem>
            <SelectItem value="weekends">Weekends</SelectItem>
          </SelectContent>
        </Select>
        {errors.availability ? (
          <p className="text-xs text-red-600">{errors.availability}</p>
        ) : null}
      </Field>
    </div>
  );
}

function Step4ServiceSetup({
  data,
  setData,
  errors,
  images,
  setImages,
}: {
  data: OnboardingData;
  setData: (patch: Partial<OnboardingData>) => void;
  errors: Partial<Record<keyof OnboardingData, string>>;
  images: File[];
  setImages: (files: File[]) => void;
}) {
  const [featureDraft, setFeatureDraft] = useState("");

  function addFeature() {
    const v = featureDraft.trim();
    if (!v) return;
    setData({ features: [...data.features, v] });
    setFeatureDraft("");
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service setup</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a clear service offering with pricing, delivery time, and
          media.
        </p>
      </div>

      {/* Basic */}
      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div>
          <div className="text-sm font-semibold text-gray-900">Basic</div>
          <p className="mt-0.5 text-xs text-gray-500">
            A title and category help customers find the right provider.
          </p>
        </div>

        <Field label="Service title">
          <LightInput
            value={data.serviceTitle}
            onChange={(e) => setData({ serviceTitle: e.target.value })}
            placeholder="e.g. AC Repair & Maintenance"
          />
          {errors.serviceTitle ? (
            <p className="text-xs text-red-600">{errors.serviceTitle}</p>
          ) : null}
        </Field>

        <Field label="Category">
          <Select
            value={data.serviceCategory}
            onValueChange={(v) => setData({ serviceCategory: v })}
          >
            <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white text-gray-900">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="border-gray-200 bg-white text-gray-900">
              {categoryOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.serviceCategory ? (
            <p className="text-xs text-red-600">{errors.serviceCategory}</p>
          ) : null}
        </Field>
      </div>

      {/* Pricing */}
      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div>
          <div className="text-sm font-semibold text-gray-900">Pricing</div>
          <p className="mt-0.5 text-xs text-gray-500">
            Set a starting price and estimated delivery time.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Starting price">
            <LightInput
              inputMode="numeric"
              value={data.price}
              onChange={(e) =>
                setData({ price: e.target.value.replace(/[^\d.]/g, "") })
              }
              placeholder="e.g. 1500"
            />
            {errors.price ? (
              <p className="text-xs text-red-600">{errors.price}</p>
            ) : null}
          </Field>
          <Field label="Delivery time (days)">
            <LightInput
              inputMode="numeric"
              value={data.deliveryTime}
              onChange={(e) =>
                setData({ deliveryTime: e.target.value.replace(/[^\d]/g, "") })
              }
              placeholder="e.g. 2"
            />
            {errors.deliveryTime ? (
              <p className="text-xs text-red-600">{errors.deliveryTime}</p>
            ) : null}
          </Field>
        </div>
      </div>

      {/* Description */}
      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div>
          <div className="text-sm font-semibold text-gray-900">Description</div>
          <p className="mt-0.5 text-xs text-gray-500">
            Explain what’s included. Add feature bullets for clarity.
          </p>
        </div>

        <Field label="Description">
          <LightTextarea
            value={data.description}
            onChange={(e) => setData({ description: e.target.value })}
            placeholder="Describe your service, what’s included, and what customers should expect…"
          />
          {errors.description ? (
            <p className="text-xs text-red-600">{errors.description}</p>
          ) : null}
        </Field>

        <Field label="Features">
          <div className="grid gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <LightInput
                value={featureDraft}
                onChange={(e) => setFeatureDraft(e.target.value)}
                placeholder="e.g. Free inspection"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                onClick={addFeature}
              >
                + Add Feature
              </Button>
            </div>

            {data.features.length ? (
              <ul className="grid gap-2">
                {data.features.map((f, idx) => (
                  <li
                    key={`${f}-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2"
                  >
                    <span className="text-sm text-gray-800">{f}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() =>
                        setData({
                          features: data.features.filter((_, i) => i !== idx),
                        })
                      }
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">
                Add a few bullet points to make your offer easy to scan.
              </p>
            )}
          </div>
        </Field>
      </div>

      {/* Media */}
      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div>
          <div className="text-sm font-semibold text-gray-900">Media</div>
          <p className="mt-0.5 text-xs text-gray-500">
            Upload a few images to increase conversions.
          </p>
        </div>

        <Field label="Upload images">
          <div className="grid gap-3">
            <input
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#895129] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#6f3f1f]"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (!files.length) return;
                setImages([...images, ...files]);
                e.currentTarget.value = "";
              }}
            />

            {images.length ? (
              <div className="flex flex-wrap gap-2">
                {images.map((f, idx) => (
                  <Badge
                    key={`${f.name}-${idx}`}
                    variant="secondary"
                    className="gap-1 border border-gray-200 bg-white text-gray-700"
                  >
                    {f.name}
                    <button
                      type="button"
                      className="rounded-sm p-0.5 text-gray-400 hover:text-gray-700"
                      onClick={() =>
                        setImages(images.filter((_, i) => i !== idx))
                      }
                      aria-label={`Remove ${f.name}`}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                PNG/JPG recommended. You can add multiple images.
              </p>
            )}
          </div>
        </Field>
      </div>
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

function Step5StripePayment({
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

export function ServiceOnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { email?: string; phone?: string; name?: string } | null;
  };

  const [step, setStep] = useState<StepId>(2);
  const [images, setImages] = useState<File[]>([]);
  const [data, setDataState] = useState<OnboardingData>(() => {
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
    Partial<Record<keyof OnboardingData, string>>
  >({});

  const [updateServiceProviderProfile, { isLoading: isUpdating }] =
    useUpdateServiceProviderProfileMutation();

  useEffect(() => {
    store(data);
  }, [data]);

  function setData(patch: Partial<OnboardingData>) {
    setDataState((prev) => ({ ...prev, ...patch }));
  }

  function validateCurrent(): boolean {
    const e: Partial<Record<keyof OnboardingData, string>> = {};
    if (step === 2) {
      if (!data.businessName.trim())
        e.businessName = "Business name is required";
      if (!data.ownerName.trim()) e.ownerName = "Owner name is required";
      if (!data.phone.trim()) e.phone = "Phone is required";
      if (!data.email.trim()) e.email = "Email is required";
      else if (!isEmail(data.email.trim())) e.email = "Enter a valid email";
      if (!data.address.trim()) e.address = "Address is required";
      if (!data.serviceCategories.length)
        e.serviceCategories = "Select at least one category";
      if (!data.serviceArea.trim()) e.serviceArea = "Service area is required";
    }
    if (step === 3) {
      if (!data.experienceLevel) e.experienceLevel = "Select experience level";
      if (!data.yearsExperience.trim())
        e.yearsExperience = "Years of experience is required";
      if (!data.skills.length) e.skills = "Add at least one skill";
      if (!data.languages.length) e.languages = "Select at least one language";
      if (!data.availability) e.availability = "Select availability";
    }
    if (step === 4) {
      if (!data.serviceTitle.trim())
        e.serviceTitle = "Service title is required";
      if (!data.serviceCategory.trim()) e.serviceCategory = "Select a category";
      if (
        !data.price.trim() ||
        Number.isNaN(Number(data.price)) ||
        Number(data.price) <= 0
      )
        e.price = "Enter a valid price";
      if (
        !data.deliveryTime.trim() ||
        Number.isNaN(Number(data.deliveryTime)) ||
        Number(data.deliveryTime) <= 0
      )
        e.deliveryTime = "Enter a valid delivery time";
      if (!data.description.trim()) e.description = "Description is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function next() {
    if (!validateCurrent()) return;
    setErrors({});
    if (step === 6) return;

    if (step === 3) {
      try {
        await updateServiceProviderProfile({
          experienceLevel: data.experienceLevel,
          yearsOfExperience: Number(data.yearsExperience),
          portfolioLink: data.portfolioLinks.join(","),
          skills: data.skills,
          languages: data.languages,
          availability: data.availability,
        }).unwrap();
        toast.success("Professional info updated");
        setStep(4);
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to update profile");
      }
    } else {
      setStep((s) => (s === 2 ? 3 : s === 3 ? 4 : s === 4 ? 5 : 6));
    }
  }

  function back() {
    setErrors({});
    setStep((s) => (s === 6 ? 5 : s === 5 ? 4 : s === 4 ? 3 : 2));
  }

  function finish() {
    toast.success("Onboarding complete");
    localStorage.removeItem(STORAGE_KEY);
    void navigate("/vendor/dashboard", { replace: true });
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-gradient-to-br from-[#f9f7f5] via-white to-[#f3ede8]">
      {/* Match auth/signup background decoration */}
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
              Service Provider Onboarding
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
              <Step2Business data={data} setData={setData} errors={errors} />
            ) : null}
            {step === 3 ? (
              <Step3Professional
                data={data}
                setData={setData}
                errors={errors}
              />
            ) : null}
            {step === 4 ? (
              <Step4ServiceSetup
                data={data}
                setData={setData}
                errors={errors}
                images={images}
                setImages={setImages}
              />
            ) : null}
            {step === 5 ? (
              <Step5StripePayment
                onConnect={() => {
                  toast.message("Stripe connect UI placeholder", {
                    description: "Wire this to your Stripe Connect flow next.",
                  });
                  setStep(6);
                }}
                onSkip={() => setStep(6)}
              />
            ) : null}
            {step === 6 ? (
              <div className="grid gap-3 text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  You’re all set
                </h1>
                <p className="text-sm text-gray-500">
                  Your service provider profile is ready. You can edit
                  everything later.
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

            {step !== 6 ? (
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
                  disabled={isUpdating}
                  className="h-11 rounded-xl bg-[#895129] px-6 text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#6f3f1f] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isUpdating ? "Saving..." : "Next"}
                  {!isUpdating && <ChevronRight className="ml-2 size-4" />}
                </Button>
              </div>
            ) : null}
          </OnboardingCard>
        </div>
      </div>
    </div>
  );
}
