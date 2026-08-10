import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
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
import { DynamicListInput } from "@/features/services/components/DynamicListInput";
import {
  useCreateServiceMutation,
  useGetCategoriesQuery,
} from "@/features/services";
import {
  CountryMultiSelect,
  isCountrySelectionValid,
  type ServiceCountrySelection,
} from "@/components/CountryMultiSelect";
import { readServiceLocationFromLocalStorage } from "@/utils/service-provider-profile-storage";
import { cn, getImageUrl } from "@/utils/utils";
import { fetchErrorMessage } from "@/utils/fetch-error";

type FormState = {
  title: string;
  category: string;
  countrySelection: ServiceCountrySelection;
  description: string;
  servicesIncluded: string[];
  technologies: string[];
  imageFile: File | null;
  imagePreviewUrl: string;
  price: string;
  packageDetails: string[];
  deliveryTime: string;
};

const DELIVERY_TIME = [
  { value: "1", label: "Within 1 day" },
  { value: "2", label: "Within 2 days" },
  { value: "3", label: "Within 3 days" },
  { value: "5", label: "Within 5 days" },
  { value: "7", label: "Within 7 days" },
] as const;

function normalizeTag(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export function AddServicePage() {
  const navigate = useNavigate();
  const [createService, { isLoading }] = useCreateServiceMutation();
  const { data: categoriesData } = useGetCategoriesQuery();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const categories = useMemo(() => {
    if (categoriesData?.data && Array.isArray(categoriesData.data)) {
      return categoriesData.data.map((c: any) => ({
        label: c.name,
        value: c._id,
      }));
    }
    return [
      { label: "Cleaning", value: "6875d8f6c2a9d2b8c1f23456" },
      { label: "Repair", value: "6875d8f6c2a9d2b8c1f23457" },
      { label: "Consulting", value: "6875d8f6c2a9d2b8c1f23458" },
      { label: "Design", value: "6875d8f6c2a9d2b8c1f23459" },
      { label: "Marketing", value: "6875d8f6c2a9d2b8c1f2345a" },
      { label: "IT Services", value: "6875d8f6c2a9d2b8c1f2345b" },
    ];
  }, [categoriesData]);

  const [v, setV] = useState<FormState>(() => ({
    title: "",
    category: "",
    countrySelection: readServiceLocationFromLocalStorage(),
    description: "",
    servicesIncluded: [],
    technologies: [],
    imageFile: null,
    imagePreviewUrl: "",
    price: "",
    packageDetails: [],
    deliveryTime: "3",
  }));

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>> & { countries?: string }
  >({});
  const [techDraft, setTechDraft] = useState("");

  const previewUrl = useMemo(() => {
    if (v.imagePreviewUrl) return getImageUrl(v.imagePreviewUrl);
    if (v.imageFile) return URL.createObjectURL(v.imageFile);
    return "";
  }, [v.imageFile, v.imagePreviewUrl]);

  const canSubmit = useMemo(() => {
    if (!v.title.trim()) return false;
    if (!v.category.trim()) return false;
    if (!isCountrySelectionValid(v.countrySelection)) return false;
    if (!v.description.trim()) return false;
    if (
      !v.price.trim() ||
      !Number.isFinite(Number(v.price)) ||
      Number(v.price) <= 0
    )
      return false;
    if (!v.deliveryTime) return false;
    return true;
  }, [v]);

  function validate(): Partial<Record<keyof FormState, string>> & {
    countries?: string;
  } {
    const e: Partial<Record<keyof FormState, string>> & { countries?: string } =
      {};
    if (!v.title.trim()) e.title = "Service title is required.";
    if (!v.category.trim()) e.category = "Category is required.";
    if (!isCountrySelectionValid(v.countrySelection))
      e.countries = "Select at least one country or all countries.";
    if (!v.description.trim()) e.description = "Description is required.";
    if (!v.price.trim()) e.price = "Base price is required.";
    else if (!Number.isFinite(Number(v.price)) || Number(v.price) <= 0)
      e.price = "Enter a valid base price.";
    if (!v.deliveryTime) e.deliveryTime = "Delivery time is required.";
    return e;
  }

  function addTechFromDraft() {
    const raw = normalizeTag(techDraft);
    if (!raw) return;
    if (v.technologies.some((t) => t.toLowerCase() === raw.toLowerCase())) {
      setTechDraft("");
      return;
    }
    setV((s) => ({ ...s, technologies: [...s.technologies, raw] }));
    setTechDraft("");
  }

  function removeTech(tag: string) {
    setV((s) => ({
      ...s,
      technologies: s.technologies.filter((t) => t !== tag),
    }));
  }

  async function onSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      const formData = new FormData();
      formData.append("name", v.title.trim());
      formData.append("category", v.category.trim());
      formData.append("price", v.price);
      formData.append("description", v.description.trim());

      const techArr = (v.technologies ?? [])
        .map((s) => s.trim())
        .filter(Boolean);
      formData.append("technologies", JSON.stringify(techArr));

      const includesArr = (v.servicesIncluded ?? [])
        .map((s) => s.trim())
        .filter(Boolean);
      formData.append("serviceIncludes", JSON.stringify(includesArr));

      const pkgArr = (v.packageDetails ?? [])
        .map((s) => s.trim())
        .filter(Boolean);
      formData.append("packageDetails", JSON.stringify(pkgArr));

      formData.append("deliveryTime", v.deliveryTime);

      if (v.imageFile) {
        formData.append("image", v.imageFile);
      }

      await createService(formData).unwrap();

      toast.success("Service published");
      void navigate("/service/services", { replace: true });
    } catch (err) {
      toast.error(fetchErrorMessage(err) ?? "Could not publish service");
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Add new service
        </h1>
        <p className="text-muted-foreground text-sm">
          Create a service listing with a base price, delivery time, and
          details.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: form */}
        <div className="min-w-0 space-y-6">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Service information</CardTitle>
              <CardDescription>
                Basic information customers see first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Service title</Label>
                <Input
                  id="title"
                  value={v.title}
                  onChange={(e) => {
                    const next = e.target.value;
                    setV((s) => ({ ...s, title: next }));
                    setErrors((p) => ({ ...p, title: undefined }));
                  }}
                  placeholder="e.g. AC servicing & maintenance"
                />
                {errors.title ? (
                  <p className="text-sm text-red-500">{errors.title}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={v.category}
                  onValueChange={(val) => {
                    setV((s) => ({ ...s, category: val }));
                    setErrors((p) => ({ ...p, category: undefined }));
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      errors.category && "border-red-500",
                    )}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category ? (
                  <p className="text-sm text-red-500">{errors.category}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service-country">Service Country</Label>
                <CountryMultiSelect
                  id="service-country"
                  value={v.countrySelection}
                  onChange={(countrySelection) => {
                    setV((s) => ({ ...s, countrySelection }));
                    setErrors((p) => ({ ...p, countries: undefined }));
                  }}
                  error={errors.countries}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  rows={6}
                  value={v.description}
                  onChange={(e) => {
                    const next = e.target.value;
                    setV((s) => ({ ...s, description: next }));
                    setErrors((p) => ({ ...p, description: undefined }));
                  }}
                  placeholder="Explain what’s included, what you need from the client, and what they get."
                />
                {errors.description ? (
                  <p className="text-sm text-red-500">{errors.description}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>What’s included</CardTitle>
              <CardDescription>
                Bullet-style items to show on your service page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicListInput
                title="Services included"
                addLabel="Add item"
                value={v.servicesIncluded}
                onChange={(servicesIncluded) =>
                  setV((s) => ({ ...s, servicesIncluded }))
                }
                placeholder="e.g. Inspection + cleaning + testing"
              />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Technologies</CardTitle>
              <CardDescription>Add tags (press Enter to add).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={techDraft}
                  onChange={(e) => setTechDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTechFromDraft();
                    }
                  }}
                  placeholder="e.g. React, Node.js, Stripe"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTechFromDraft}
                >
                  Add
                </Button>
              </div>

              {v.technologies.length ? (
                <div className="flex flex-wrap gap-2">
                  {v.technologies.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTech(t)}
                        aria-label={`Remove ${t}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No tags yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Image</CardTitle>
              <CardDescription>
                Upload an image and preview before publishing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (!f) return;
                  const url = URL.createObjectURL(f);
                  setV((s) => ({ ...s, imageFile: f, imagePreviewUrl: url }));
                }}
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "border-border/60 bg-muted/20 group relative flex h-[240px] w-full items-center justify-center overflow-hidden rounded-xl border",
                  "transition-colors",
                  "hover:border-[#895129]/60 hover:bg-[#895129]/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#895129]",
                )}
                aria-label="Upload image"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 px-6 text-center">
                    <div className="bg-background/60 border-border/60 text-foreground flex size-10 items-center justify-center rounded-xl border shadow-sm">
                      <UploadCloud className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold">
                        Click to upload image
                      </p>
                      <p className="text-muted-foreground text-xs">
                        PNG, JPG up to a few MB
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                  <span className="bg-background/70 text-muted-foreground hidden items-center gap-1 rounded-lg border border-border/60 px-2 py-1 text-xs shadow-sm backdrop-blur sm:inline-flex">
                    <ImagePlus className="size-3.5" />
                    {previewUrl ? "Change image" : "Upload"}
                  </span>
                  {previewUrl ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setV((s) => ({
                          ...s,
                          imageFile: null,
                          imagePreviewUrl: "",
                        }));
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <span />
                  )}
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Right: pricing (sticky) */}
        <div className="lg:sticky lg:top-6">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Base listing price and delivery. Negotiate final amounts with
                custom offers in chat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Starting from
                  </span>
                  <Label htmlFor="price" className="text-base font-semibold">
                    Base price
                  </Label>
                </div>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={v.price}
                  onChange={(e) => {
                    const next = e.target.value;
                    setV((s) => ({ ...s, price: next }));
                    setErrors((p) => ({ ...p, price: undefined }));
                  }}
                  placeholder="0.00"
                  className={errors.price ? "border-red-500" : undefined}
                />
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Final price can be adjusted via custom offers.
                </p>
                {errors.price ? (
                  <p className="text-sm text-red-500">{errors.price}</p>
                ) : null}
              </div>

              <DynamicListInput
                title="Package details"
                addLabel="Add detail"
                value={v.packageDetails}
                onChange={(packageDetails) =>
                  setV((s) => ({ ...s, packageDetails }))
                }
                placeholder="e.g. On-site visit included"
              />

              <div className="grid gap-2">
                <Label>Delivery time</Label>
                <Select
                  value={v.deliveryTime}
                  onValueChange={(val) => {
                    setV((s) => ({ ...s, deliveryTime: val }));
                    setErrors((p) => ({ ...p, deliveryTime: undefined }));
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      errors.deliveryTime && "border-red-500",
                    )}
                  >
                    <SelectValue placeholder="Select delivery time" />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_TIME.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.deliveryTime ? (
                  <p className="text-sm text-red-500">{errors.deliveryTime}</p>
                ) : null}
              </div>

              <Button
                type="button"
                className="w-full bg-[#895129] hover:bg-[#7b4723]"
                disabled={!canSubmit || isLoading}
                onClick={() => void onSubmit()}
              >
                {isLoading ? "Publishing…" : "Publish service"}
              </Button>

              <p className="text-muted-foreground text-xs">
                Publishing will create this service under your service provider
                role.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
