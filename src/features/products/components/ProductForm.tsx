import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/utils/utils";
import {
  CountryMultiSelect,
  isCountrySelectionValid,
  type ServiceCountrySelection,
} from "@/components/CountryMultiSelect";
import { ImageUploader, type ImageUploaderValue } from "./ImageUploader";
import { HighlightsInput, type HighlightRow } from "./HighlightsInput";

export type ProductFormValues = {
  name: string;
  category: string;
  countrySelection: ServiceCountrySelection;
  price: string;
  discount: string;
  description: string;
  descriptionPointsText: string;
  stock: string;
  active: boolean;
  existingImageUrls: string[];
  newFiles: File[];
  mainImageIndex: number;
  highlights: HighlightRow[];
};

const DEFAULT_VALUES: ProductFormValues = {
  name: "",
  category: "",
  countrySelection: { mode: "multi", allCountries: false, countryCodes: [] },
  price: "",
  discount: "",
  description: "",
  descriptionPointsText: "",
  stock: "0",
  active: true,
  existingImageUrls: [],
  newFiles: [],
  mainImageIndex: 0,
  highlights: [],
};

function normalizePointsText(raw: string) {
  return raw
    .split("\n")
    .map((s) => s.replace(/^[•\-\*\s]+/, "").trim())
    .filter(Boolean)
    .join("\n");
}

export function ProductForm({
  mode,
  initialValues,
  isBusy,
  onCancel,
  onSubmit,
  className,
}: {
  mode: "create" | "edit";
  initialValues?: Partial<ProductFormValues>;
  isBusy?: boolean;
  onCancel: () => void;
  onSubmit: (values: { toFormData: () => FormData }) => Promise<void> | void;
  className?: string;
}) {
  const [v, setV] = useState<ProductFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<string[]>([]);

  const uploaderValue: ImageUploaderValue = useMemo(
    () => ({
      existingUrls: v.existingImageUrls,
      files: v.newFiles,
      mainIndex: v.mainImageIndex,
    }),
    [v.existingImageUrls, v.newFiles, v.mainImageIndex],
  );

  const totalImages = v.existingImageUrls.length + v.newFiles.length;

  function validate(): string[] {
    const e: string[] = [];
    if (!v.name.trim()) e.push("Product name is required.");
    if (!isCountrySelectionValid(v.countrySelection)) {
      e.push("Select at least one country or all countries.");
    }
    if (!String(v.price).trim()) e.push("Price is required.");
    if (!Number.isFinite(Number(v.price))) e.push("Price must be a number.");
    if (totalImages < 1) e.push("At least 1 image is required.");
    return e;
  }

  function toFormData() {
    const fd = new FormData();
    fd.set("name", v.name.trim());
    fd.set("category", v.category.trim());
    fd.set("allCountries", String(Boolean(v.countrySelection.allCountries)));
    fd.set(
      "countries",
      JSON.stringify(
        v.countrySelection.allCountries ? [] : v.countrySelection.countryCodes,
      ),
    );
    fd.set("price", String(Number(v.price)));
    fd.set("discount", v.discount ? String(Number(v.discount)) : "0");
    fd.set("description", v.description);
    fd.set("descriptionPoints", normalizePointsText(v.descriptionPointsText));
    fd.set("stock", String(Math.max(0, Math.floor(Number(v.stock || 0)))));
    fd.set("active", String(Boolean(v.active)));
    fd.set(
      "mainImageIndex",
      String(Math.max(0, Math.floor(Number(v.mainImageIndex || 0)))),
    );
    fd.set(
      "highlights",
      JSON.stringify(
        (v.highlights ?? []).filter((h) => h.title.trim() || h.value.trim()),
      ),
    );
    for (const f of v.newFiles) fd.append("images", f);
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
            {mode === "create" ? "Add product" : "Edit product"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Create a modern product listing with images, highlights, and clean
            details.
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
          <Button type="button" onClick={() => void submit()} disabled={isBusy}>
            {isBusy ? "Saving…" : "Save product"}
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
          <Card className="rounded-2xl border border-gray-200 bg-white py-0 shadow-sm">
            <CardHeader className="pt-6">
              <CardTitle className="text-gray-900">Basic Info</CardTitle>
              <CardDescription className="text-gray-500">
                Core details used across your store.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="grid gap-2">
                <Label className="text-gray-700" htmlFor="name">
                  Product Name
                </Label>
                <Input
                  id="name"
                  value={v.name}
                  onChange={(e) =>
                    setV((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="e.g. Leather wallet"
                  className="rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#895129]"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-700" htmlFor="category">
                  Category
                </Label>
                <Input
                  id="category"
                  value={v.category}
                  onChange={(e) =>
                    setV((s) => ({ ...s, category: e.target.value }))
                  }
                  placeholder="e.g. Accessories"
                  className="rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#895129]"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-700" htmlFor="product-country">
                  Product Country
                </Label>
                <CountryMultiSelect
                  id="product-country"
                  value={v.countrySelection}
                  onChange={(countrySelection) => {
                    setV((s) => ({ ...s, countrySelection }));
                    setErrors((prev) =>
                      prev.filter((m) => !m.toLowerCase().includes("country")),
                    );
                  }}
                  error={
                    errors.some((m) => m.toLowerCase().includes("country"))
                      ? "Select at least one country or all countries."
                      : undefined
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-gray-700" htmlFor="price">
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
                    placeholder="0.00"
                    className="rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#895129]"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700" htmlFor="discount">
                    Discount (optional)
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={v.discount}
                    onChange={(e) =>
                      setV((s) => ({ ...s, discount: e.target.value }))
                    }
                    placeholder="0"
                    className="rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#895129]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-gray-700" htmlFor="stock">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={(e) =>
                      setV((s) => ({ ...s, stock: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#895129]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    id="active"
                    checked={v.active}
                    onCheckedChange={(x) => setV((s) => ({ ...s, active: x }))}
                  />
                  <Label className="text-gray-700" htmlFor="active">
                    Active
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>
                Write a short overview and optional bullet points.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={v.description}
                  onChange={(e) =>
                    setV((s) => ({ ...s, description: e.target.value }))
                  }
                  placeholder="Short description for your product…"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="points">Product Details (bullets)</Label>
                <Textarea
                  id="points"
                  rows={4}
                  value={v.descriptionPointsText}
                  onChange={(e) =>
                    setV((s) => ({
                      ...s,
                      descriptionPointsText: e.target.value,
                    }))
                  }
                  placeholder={
                    "• Genuine leather\n• RFID blocking\n• Slim profile"
                  }
                />
                <p className="text-muted-foreground text-xs">
                  One bullet per line. You can include “•” or “-”.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardContent className="p-6">
              <ImageUploader
                value={uploaderValue}
                onChange={(next) =>
                  setV((s) => ({
                    ...s,
                    existingImageUrls: next.existingUrls,
                    newFiles: next.files,
                    mainImageIndex: next.mainIndex,
                  }))
                }
              />
              <p
                className={cn(
                  "mt-3 text-xs",
                  totalImages < 1
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {totalImages < 1
                  ? "At least 1 image is required."
                  : `${totalImages} image(s) selected.`}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardContent className="p-6">
              <HighlightsInput
                value={v.highlights}
                onChange={(h) => setV((s) => ({ ...s, highlights: h }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
