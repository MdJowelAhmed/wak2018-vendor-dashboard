import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronsUpDown, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/utils";
import {
  SERVICE_PROVIDER_PROFILE_LS_KEY,
  emptyServiceCountrySelection,
  normalizeServiceCountrySelection,
} from "@/utils/service-provider-profile-storage";
import {
  CountryMultiSelect,
  type ServiceCountrySelection,
} from "@/components/CountryMultiSelect";
import { DynamicListInput } from "@/features/services/components/DynamicListInput";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ExperienceLevel = "beginner" | "intermediate" | "expert" | "";
type Availability = "full_time" | "part_time" | "weekends" | "";

export type ServiceProviderProfileData = {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  category: string[]; // multi-select (service categories)
  serviceArea: string;
  /** Global availability; defaults new services in Add Service. */
  serviceLocation: ServiceCountrySelection;

  experienceLevel: ExperienceLevel;
  years: string;
  skills: string[];
  portfolio: string;
  languages: string[]; // multi-select
  availability: Availability;

  serviceTitle: string;
  serviceCategory: string;
  price: string;
  deliveryTime: string;
  description: string;
  features: string[];
  images: string[]; // preview urls
};

const ONBOARDING_KEY = "service_onboarding_v1";

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
] as const;

const languageOptions = [
  "English",
  "Arabic",
  "French",
  "Spanish",
  "Hindi",
  "Bengali",
  "Urdu",
] as const;

function normalizeTag(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

function safeLoad(): ServiceProviderProfileData | null {
  try {
    const raw = localStorage.getItem(SERVICE_PROVIDER_PROFILE_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ServiceProviderProfileData;
  } catch {
    return null;
  }
}

function safeLoadOnboarding(): Partial<Record<string, any>> | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<Record<string, any>>;
  } catch {
    return null;
  }
}

function safeSave(v: ServiceProviderProfileData) {
  try {
    localStorage.setItem(SERVICE_PROVIDER_PROFILE_LS_KEY, JSON.stringify(v));
  } catch {
    // ignore
  }
}

function MultiSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: readonly string[];
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
            className="h-10 w-full justify-between"
          >
            <span
              className={cn(
                "truncate text-left",
                value.length ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {value.length ? `${value.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="size-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[18rem]">
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
            <Badge key={v} variant="secondary" className="gap-1">
              {v}
              <button
                type="button"
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

export function ServiceProfileSettings({
  profile,
}: {
  profile:
    | {
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
      }
    | undefined;
}) {
  const imageRef = useRef<HTMLInputElement | null>(null);

  const initial = useMemo(() => {
    const stored = safeLoad();
    if (stored) {
      return {
        ...stored,
        serviceLocation: normalizeServiceCountrySelection(
          stored.serviceLocation,
        ),
      };
    }
    const onboarding = safeLoadOnboarding();
    const fullName =
      `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();
    return {
      businessName: String(onboarding?.businessName ?? ""),
      ownerName: String(onboarding?.ownerName ?? fullName),
      phone: String(onboarding?.phone ?? profile?.phone ?? ""),
      email: String(onboarding?.email ?? profile?.email ?? ""),
      address: String(onboarding?.address ?? ""),
      category: Array.isArray(onboarding?.serviceCategories)
        ? (onboarding?.serviceCategories as string[])
        : [],
      serviceArea: String(onboarding?.serviceArea ?? ""),
      serviceLocation: emptyServiceCountrySelection(),

      experienceLevel: (onboarding?.experienceLevel as ExperienceLevel) ?? "",
      years: String(onboarding?.yearsExperience ?? ""),
      skills: Array.isArray(onboarding?.skills)
        ? (onboarding?.skills as string[])
        : [],
      portfolio: Array.isArray(onboarding?.portfolioLinks)
        ? (onboarding?.portfolioLinks as string[]).join("\n")
        : String(onboarding?.portfolio ?? ""),
      languages: Array.isArray(onboarding?.languages)
        ? (onboarding?.languages as string[])
        : [],
      availability: (onboarding?.availability as Availability) ?? "",

      serviceTitle: String(onboarding?.serviceTitle ?? ""),
      serviceCategory: String(onboarding?.serviceCategory ?? ""),
      price: String(onboarding?.price ?? ""),
      deliveryTime: String(onboarding?.deliveryTime ?? ""),
      description: String(onboarding?.description ?? ""),
      features: Array.isArray(onboarding?.features)
        ? (onboarding?.features as string[])
        : [],
      images: [],
    } satisfies ServiceProviderProfileData;
  }, [profile?.email, profile?.firstName, profile?.lastName, profile?.phone]);

  const [v, setV] = useState<ServiceProviderProfileData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ServiceProviderProfileData, string>>
  >({});
  const [skillDraft, setSkillDraft] = useState("");

  const canSave = useMemo(() => {
    return (
      v.businessName.trim().length > 0 &&
      v.ownerName.trim().length > 0 &&
      v.phone.trim().length > 0 &&
      v.email.trim().length > 0 &&
      v.address.trim().length > 0 &&
      v.category.length > 0 &&
      v.serviceArea.trim().length > 0 &&
      v.experienceLevel !== "" &&
      v.years.trim().length > 0 &&
      v.skills.length > 0 &&
      v.languages.length > 0 &&
      v.availability !== "" &&
      v.serviceTitle.trim().length > 0 &&
      v.serviceCategory.trim().length > 0 &&
      v.price.trim().length > 0 &&
      v.deliveryTime.trim().length > 0 &&
      v.description.trim().length > 0
    );
  }, [v]);

  function validate() {
    const e: Partial<Record<keyof ServiceProviderProfileData, string>> = {};

    // Business
    if (!v.businessName.trim()) e.businessName = "Business name is required.";
    if (!v.ownerName.trim()) e.ownerName = "Owner name is required.";
    if (!v.phone.trim()) e.phone = "Phone is required.";
    if (!v.email.trim()) e.email = "Email is required.";
    if (!v.address.trim()) e.address = "Address is required.";
    if (!v.category.length) e.category = "Select at least one category.";
    if (!v.serviceArea.trim()) e.serviceArea = "Service area is required.";

    // Professional
    if (!v.experienceLevel) e.experienceLevel = "Select experience level.";
    if (!v.years.trim()) e.years = "Years of experience is required.";
    if (!v.skills.length) e.skills = "Add at least one skill.";
    if (!v.languages.length) e.languages = "Select at least one language.";
    if (!v.availability) e.availability = "Select availability.";

    // Service setup
    if (!v.serviceTitle.trim()) e.serviceTitle = "Service title is required.";
    if (!v.serviceCategory.trim()) e.serviceCategory = "Category is required.";
    if (
      !v.price.trim() ||
      Number.isNaN(Number(v.price)) ||
      Number(v.price) <= 0
    )
      e.price = "Enter a valid starting price.";
    if (
      !v.deliveryTime.trim() ||
      Number.isNaN(Number(v.deliveryTime)) ||
      Number(v.deliveryTime) <= 0
    )
      e.deliveryTime = "Enter a valid delivery time.";
    if (!v.description.trim()) e.description = "Description is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function addSkill() {
    const s = normalizeTag(skillDraft);
    if (!s) return;
    if (v.skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkillDraft("");
      return;
    }
    setV((p) => ({ ...p, skills: [...p.skills, s] }));
    setSkillDraft("");
  }

  function removeSkill(s: string) {
    setV((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));
  }

  function save() {
    if (!validate()) {
      toast.error("Please fill required fields.");
      return;
    }
    safeSave(v);
    toast.success("Profile updated");
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Update business and contact details shown to customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={v.businessName}
                onChange={(e) =>
                  setV((p) => ({ ...p, businessName: e.target.value }))
                }
              />
              {errors.businessName ? (
                <p className="text-sm text-red-500">{errors.businessName}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                value={v.ownerName}
                onChange={(e) =>
                  setV((p) => ({ ...p, ownerName: e.target.value }))
                }
              />
              {errors.ownerName ? (
                <p className="text-sm text-red-500">{errors.ownerName}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={v.phone}
                onChange={(e) => setV((p) => ({ ...p, phone: e.target.value }))}
              />
              {errors.phone ? (
                <p className="text-sm text-red-500">{errors.phone}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={v.email}
                readOnly
                className="bg-muted/30"
              />
              {errors.email ? (
                <p className="text-sm text-red-500">{errors.email}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={v.address}
              onChange={(e) => setV((p) => ({ ...p, address: e.target.value }))}
            />
            {errors.address ? (
              <p className="text-sm text-red-500">{errors.address}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Service Category (multi-select)</Label>
              <MultiSelect
                value={v.category}
                onChange={(next) => setV((p) => ({ ...p, category: next }))}
                options={categoryOptions}
                placeholder="Select one or more categories"
              />
              {errors.category ? (
                <p className="text-sm text-red-500">{errors.category}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serviceArea">Service Area</Label>
              <Input
                id="serviceArea"
                value={v.serviceArea}
                onChange={(e) =>
                  setV((p) => ({ ...p, serviceArea: e.target.value }))
                }
              />
              {errors.serviceArea ? (
                <p className="text-sm text-red-500">{errors.serviceArea}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="service-location">Service Location</Label>
            <CountryMultiSelect
              id="service-location"
              value={v.serviceLocation}
              onChange={(serviceLocation) =>
                setV((p) => ({ ...p, serviceLocation }))
              }
            />
            <p className="text-muted-foreground text-xs leading-relaxed">
              Optional but recommended. Saved for your account and used as the
              default country list when you{" "}
              <span className="font-medium text-[#895129]">
                add a new service
              </span>{" "}
              (you can change it per listing). Choose{" "}
              <span className="font-medium">All countries</span> for global
              availability.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>
            Experience, skills, languages and availability.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Experience Level</Label>
              <Select
                value={v.experienceLevel}
                onValueChange={(x) =>
                  setV((p) => ({ ...p, experienceLevel: x as ExperienceLevel }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              {errors.experienceLevel ? (
                <p className="text-sm text-red-500">{errors.experienceLevel}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="years">Years of Experience</Label>
              <Input
                id="years"
                inputMode="numeric"
                value={v.years}
                onChange={(e) =>
                  setV((p) => ({
                    ...p,
                    years: e.target.value.replace(/[^\d.]/g, ""),
                  }))
                }
                placeholder="e.g. 3"
              />
              {errors.years ? (
                <p className="text-sm text-red-500">{errors.years}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter…"
                />
                <Button type="button" variant="secondary" onClick={addSkill}>
                  Add
                </Button>
              </div>
              {errors.skills ? (
                <p className="text-sm text-red-500">{errors.skills}</p>
              ) : null}
              {v.skills.length ? (
                <div className="flex flex-wrap gap-2">
                  {v.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1">
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        aria-label={`Remove ${s}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label>Languages (multi-select)</Label>
              <MultiSelect
                value={v.languages}
                onChange={(next) => setV((p) => ({ ...p, languages: next }))}
                options={languageOptions}
                placeholder="Select languages"
              />
              {errors.languages ? (
                <p className="text-sm text-red-500">{errors.languages}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Availability</Label>
              <Select
                value={v.availability}
                onValueChange={(x) =>
                  setV((p) => ({ ...p, availability: x as Availability }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                </SelectContent>
              </Select>
              {errors.availability ? (
                <p className="text-sm text-red-500">{errors.availability}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="portfolio">Portfolio Links</Label>
              <Textarea
                id="portfolio"
                value={v.portfolio}
                onChange={(e) =>
                  setV((p) => ({ ...p, portfolio: e.target.value }))
                }
                placeholder="Paste links separated by new lines…"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Service Setup</CardTitle>
          <CardDescription>
            Service offering details, features and images.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="serviceTitle">Service Title</Label>
              <Input
                id="serviceTitle"
                value={v.serviceTitle}
                onChange={(e) =>
                  setV((p) => ({ ...p, serviceTitle: e.target.value }))
                }
                placeholder="e.g. AC Repair & Maintenance"
              />
              {errors.serviceTitle ? (
                <p className="text-sm text-red-500">{errors.serviceTitle}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serviceCategory">Category</Label>
              <Input
                id="serviceCategory"
                value={v.serviceCategory}
                onChange={(e) =>
                  setV((p) => ({ ...p, serviceCategory: e.target.value }))
                }
                placeholder="e.g. IT Support"
              />
              {errors.serviceCategory ? (
                <p className="text-sm text-red-500">{errors.serviceCategory}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="price">Starting Price</Label>
              <Input
                id="price"
                inputMode="numeric"
                value={v.price}
                onChange={(e) =>
                  setV((p) => ({
                    ...p,
                    price: e.target.value.replace(/[^\d.]/g, ""),
                  }))
                }
                placeholder="e.g. 150"
              />
              {errors.price ? (
                <p className="text-sm text-red-500">{errors.price}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deliveryTime">Delivery Time (days)</Label>
              <Input
                id="deliveryTime"
                inputMode="numeric"
                value={v.deliveryTime}
                onChange={(e) =>
                  setV((p) => ({
                    ...p,
                    deliveryTime: e.target.value.replace(/[^\d]/g, ""),
                  }))
                }
                placeholder="e.g. 2"
              />
              {errors.deliveryTime ? (
                <p className="text-sm text-red-500">{errors.deliveryTime}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={v.description}
              onChange={(e) =>
                setV((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe your service, what’s included, and what customers should expect…"
            />
            {errors.description ? (
              <p className="text-sm text-red-500">{errors.description}</p>
            ) : null}
          </div>

          <DynamicListInput
            title="Features"
            addLabel="Add Feature"
            value={v.features}
            onChange={(features) => setV((p) => ({ ...p, features }))}
            placeholder="e.g. Free inspection"
          />

          <div className="grid gap-2">
            <Label>Images upload</Label>
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-[#895129] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#6f3f1f]"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (!files.length) return;
                const nextUrls = files.map((f) => URL.createObjectURL(f));
                setV((p) => ({ ...p, images: [...p.images, ...nextUrls] }));
                e.currentTarget.value = "";
              }}
            />
            {v.images.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {v.images.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-md bg-background/80 p-1 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setV((p) => ({
                          ...p,
                          images: p.images.filter((_, i) => i !== idx),
                        }))
                      }
                      aria-label="Remove image"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Add multiple images. Previews appear here.
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              className="bg-[#895129] hover:bg-[#7b4723]"
              disabled={!canSave}
              onClick={save}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
