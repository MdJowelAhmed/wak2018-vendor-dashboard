import { useMemo, useState } from "react";
import { AlertCircle, ImagePlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/utils";
import { DynamicListInput } from "./DynamicListInput";
import { TechnologiesInput, type TechnologiesValue } from "./TechnologiesInput";

export type ServiceFormValues = {
  title: string;
  category: string;
  price: string;
  pricingType: "hourly" | "fixed";
  deliveryTimeDays: string;
  about: string;
  imageFile: File | null;
  imagePreviewUrl: string;
  services: string[];
  technologies: TechnologiesValue;
  benefits: string[];
};

const DEFAULT: ServiceFormValues = {
  title: "",
  category: "",
  price: "",
  pricingType: "fixed",
  deliveryTimeDays: "1",
  about: "",
  imageFile: null,
  imagePreviewUrl: "",
  services: [],
  technologies: { frontend: "", backend: "", database: "" },
  benefits: [],
};

export function ServiceForm({
  mode,
  initialValues,
  isBusy,
  onCancel,
  onSubmit,
  className,
}: {
  mode: "create" | "edit";
  initialValues?: Partial<ServiceFormValues>;
  isBusy?: boolean;
  onCancel: () => void;
  onSubmit: (values: { toFormData: () => FormData }) => Promise<void> | void;
  className?: string;
}) {
  const [v, setV] = useState<ServiceFormValues>({
    ...DEFAULT,
    ...initialValues,
  });
  const [errors, setErrors] = useState<string[]>([]);

  const preview = useMemo(() => {
    if (v.imagePreviewUrl) return v.imagePreviewUrl;
    if (v.imageFile) return URL.createObjectURL(v.imageFile);
    return "";
  }, [v.imagePreviewUrl, v.imageFile]);

  function validate(): string[] {
    const e: string[] = [];
    if (!v.title.trim()) e.push("Service title is required.");
    if (!String(v.price).trim()) e.push("Price is required.");
    if (!Number.isFinite(Number(v.price))) e.push("Price must be a number.");
    if (!v.about.trim()) e.push("About is required.");
    return e;
  }

  function toFormData() {
    const fd = new FormData();
    fd.set("title", v.title.trim());
    fd.set("category", v.category.trim());
    fd.set("price", String(Number(v.price)));
    fd.set("pricingType", v.pricingType);
    fd.set(
      "deliveryTimeDays",
      String(Math.max(0, Math.floor(Number(v.deliveryTimeDays || 1)))),
    );
    fd.set("about", v.about.trim());
    // keep compatibility with older displays
    fd.set("description", v.about.trim());
    // static demo stores imageUrl; for real API you’d send the file
    if (v.imageFile) {
      fd.append("image", v.imageFile);
    }
    if (preview) fd.set("imageUrl", preview);
    fd.set(
      "services",
      JSON.stringify((v.services ?? []).map((s) => s.trim()).filter(Boolean)),
    );
    fd.set("technologies", JSON.stringify(v.technologies));
    fd.set(
      "benefits",
      JSON.stringify((v.benefits ?? []).map((s) => s.trim()).filter(Boolean)),
    );
    return fd;
  }

  async function submit() {
    const e = validate();
    setErrors(e);
    if (e.length) return;
    await onSubmit({ toFormData });
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Create service" : "Edit service"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Service Provider listing with pricing, delivery time, and dynamic
            sections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#895129] hover:bg-[#7b4723]"
            onClick={() => void submit()}
            disabled={isBusy}
          >
            {isBusy ? "Saving…" : "Save service"}
          </Button>
        </div>
      </div>

      {errors.length ? (
        <Alert variant="destructive">
          <AlertDescription className="space-y-1">
            {errors.map((m) => (
              <div key={m} className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4" />
                <span>{m}</span>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="rounded-xl border-border/60 shadow-sm bg-[#1a1a1a] text-white">
            <CardHeader>
              <CardTitle className="text-white">Basic Info</CardTitle>
              <CardDescription className="text-white/70">
                Title, category, pricing type and delivery time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-white/90" htmlFor="title">
                  Service Title
                </Label>
                <Input
                  id="title"
                  value={v.title}
                  onChange={(e) =>
                    setV((s) => ({ ...s, title: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  placeholder="e.g. Full-stack development"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-white/90" htmlFor="category">
                  Category
                </Label>
                <Input
                  id="category"
                  value={v.category}
                  onChange={(e) =>
                    setV((s) => ({ ...s, category: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  placeholder="e.g. Software"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-white/90" htmlFor="price">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={v.price}
                    onChange={(e) =>
                      setV((s) => ({ ...s, price: e.target.value }))
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-white/90" htmlFor="delivery">
                    Delivery Time (days)
                  </Label>
                  <Input
                    id="delivery"
                    type="number"
                    min={0}
                    value={v.deliveryTimeDays}
                    onChange={(e) =>
                      setV((s) => ({ ...s, deliveryTimeDays: e.target.value }))
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-white/90">Pricing Type</Label>
                <Tabs
                  value={v.pricingType}
                  onValueChange={(x) =>
                    setV((s) => ({
                      ...s,
                      pricingType: x as "hourly" | "fixed",
                    }))
                  }
                >
                  <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="hourly">Hourly</TabsTrigger>
                    <TabsTrigger value="fixed">Fixed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>About Service</CardTitle>
              <CardDescription>
                Describe what you do and what the customer gets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="about">About this service</Label>
                <Textarea
                  id="about"
                  rows={6}
                  value={v.about}
                  onChange={(e) =>
                    setV((s) => ({ ...s, about: e.target.value }))
                  }
                  placeholder="Write a clear, customer-friendly description…"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Service Image</CardTitle>
              <CardDescription>
                Upload a main image and preview it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-border/60 bg-muted/20 aspect-video overflow-hidden rounded-xl border">
                {preview ? (
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <label className="inline-flex">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setV((s) => ({ ...s, imageFile: f }));
                  }}
                />
                <Button type="button" variant="secondary" size="sm">
                  <ImagePlus className="mr-2 size-4" />
                  Upload image
                </Button>
              </label>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <DynamicListInput
                title="Services We Offer"
                addLabel="Add Item"
                value={v.services}
                onChange={(services) => setV((s) => ({ ...s, services }))}
                placeholder="e.g. API Integration"
              />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">
                  Technologies We Specialize In
                </h3>
                <TechnologiesInput
                  value={v.technologies}
                  onChange={(technologies) =>
                    setV((s) => ({ ...s, technologies }))
                  }
                />
              </div>
              <DynamicListInput
                title="Why Choose Us"
                addLabel="Add Benefit"
                value={v.benefits}
                onChange={(benefits) => setV((s) => ({ ...s, benefits }))}
                placeholder="e.g. 24/7 Support"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
