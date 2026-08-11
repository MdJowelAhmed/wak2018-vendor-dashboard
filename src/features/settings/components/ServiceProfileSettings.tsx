import { useEffect, useMemo, useState } from "react";
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
  useUpdateServiceProviderProfileMutation,
  useUpdateUserProfileMutation,
  useGetLanguagesQuery,
} from "@/services/profileApi";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getImageUrl } from "@/utils/utils";

type ExperienceLevel = "beginner" | "intermediate" | "expert" | "";
type Availability = "fullTime" | "partTime" | "weekends" | "";

export type ServiceProviderProfileData = {
  name: string;
  phone: string;
  email: string;
  address: string;

  experienceLevel: ExperienceLevel;
  years: string;
  skills: string[];
  portfolio: string;
  languages: string[];
  availability: Availability;
};

function normalizeTag(s: string) {
  return s.trim().replace(/\s+/g, " ");
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

export function ServiceProfileSettings({ profile }: { profile: any }) {
  const [updateServiceProviderProfile, { isLoading: isSpLoading }] =
    useUpdateServiceProviderProfileMutation();
  const [updateUserProfile, { isLoading: isUserLoading }] =
    useUpdateUserProfileMutation();

  const { data: languagesRes } = useGetLanguagesQuery();
  const dynamicLanguages = useMemo(
    () => languagesRes?.data || [],
    [languagesRes],
  );

  const initial = useMemo(() => {
    return {
      name: String(profile?.name ?? ""),
      phone: String(profile?.phone ?? ""),
      email: String(profile?.email ?? ""),
      address: String(profile?.address ?? ""),

      experienceLevel:
        (profile?.serviceProvider?.experienceLevel as ExperienceLevel) ?? "",
      years: String(profile?.serviceProvider?.yearsOfExperience ?? ""),
      skills: Array.isArray(profile?.serviceProvider?.skills)
        ? (profile.serviceProvider.skills as string[])
        : [],
      portfolio: String(profile?.serviceProvider?.portfolioLink ?? ""),
      languages: Array.isArray(profile?.serviceProvider?.languages)
        ? (profile.serviceProvider.languages as string[])
        : [],
      availability:
        (profile?.serviceProvider?.availability as Availability) ?? "",
    } satisfies ServiceProviderProfileData;
  }, [profile]);

  const [v, setV] = useState<ServiceProviderProfileData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ServiceProviderProfileData, string>>
  >({});
  const [skillDraft, setSkillDraft] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  useEffect(() => {
    setV(initial);
  }, [initial]);

  const isLoading = isSpLoading || isUserLoading;

  const canSave = useMemo(() => {
    return (
      v.name.trim().length > 0 &&
      v.phone.trim().length > 0 &&
      v.address.trim().length > 0 &&
      v.experienceLevel !== "" &&
      v.years.trim().length > 0 &&
      v.skills.length > 0 &&
      v.languages.length > 0 &&
      v.availability !== ""
    );
  }, [v]);

  function validate() {
    const e: Partial<Record<keyof ServiceProviderProfileData, string>> = {};

    if (!v.name.trim()) e.name = "Name is required.";
    if (!v.phone.trim()) e.phone = "Phone is required.";
    if (!v.address.trim()) e.address = "Address is required.";

    if (!v.experienceLevel) e.experienceLevel = "Select experience level.";
    if (!v.years.trim()) e.years = "Years of experience is required.";
    if (!v.skills.length) e.skills = "Add at least one skill.";
    if (!v.languages.length) e.languages = "Select at least one language.";
    if (!v.availability) e.availability = "Select availability.";

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

  async function save() {
    if (!validate()) {
      toast.error("Please fill required fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", v.name.trim());
      formData.append("phone", v.phone.trim());
      formData.append("address", v.address.trim());
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }
      await updateUserProfile(formData).unwrap();

      await updateServiceProviderProfile({
        experienceLevel: v.experienceLevel,
        yearsOfExperience: Number(v.years) || 0,
        portfolioLink: v.portfolio,
        skills: v.skills,
        languages: v.languages,
        availability: v.availability,
      }).unwrap();

      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your contact and location details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 sm:max-w-[250px]">
            <Label htmlFor="profileImage">Profile Image</Label>
            <div className="flex items-center gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                {profileImageFile ? (
                  <img
                    src={URL.createObjectURL(profileImageFile)}
                    alt="Preview"
                    className="size-full object-cover"
                  />
                ) : profile?.profileImage ? (
                  <img
                    src={getImageUrl(profile.profileImage)}
                    alt="Existing profile"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="w-full text-xs"
                  onChange={(e) =>
                    setProfileImageFile(e.target.files?.[0] || null)
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={v.name}
                onChange={(e) => setV((p) => ({ ...p, name: e.target.value }))}
              />
              {errors.name ? (
                <p className="text-sm text-red-500">{errors.name}</p>
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
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={v.address}
                onChange={(e) =>
                  setV((p) => ({ ...p, address: e.target.value }))
                }
              />
              {errors.address ? (
                <p className="text-sm text-red-500">{errors.address}</p>
              ) : null}
            </div>
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
                options={dynamicLanguages}
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
                  <SelectItem value="fullTime">Full-time</SelectItem>
                  <SelectItem value="partTime">Part-time</SelectItem>
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

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              className="bg-[#895129] hover:bg-[#7b4723]"
              disabled={!canSave || isLoading}
              onClick={() => void save()}
            >
              {isLoading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
