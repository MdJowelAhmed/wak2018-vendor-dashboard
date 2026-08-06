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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/utils/utils";
import {
  CountryMultiSelect,
  isCountrySelectionValid,
  type ServiceCountrySelection,
} from "@/components/CountryMultiSelect";
import { ImageUploader, type ImageUploaderValue } from "./ImageUploader";
import { HighlightsInput, type HighlightRow } from "./HighlightsInput";
import { useGetProductCategoriesQuery } from "../services/categoryApi";

export type ProductFormValues = {
  name: string;
  category: string;
  countrySelection: ServiceCountrySelection;
  price: string;
  discount: string;
  description: string;
  productDetails: string;
  stock: string;
  active: boolean;
  existingImageUrls: string[];
  newFiles: File[];
  mainImageIndex: number;
  highlights: HighlightRow[];
  brand: string;
  weight: string;
  dimensions: { length: string; width: string; height: string };
};

const DEFAULT_VALUES: ProductFormValues = {
  name: "",
  category: "",
  countrySelection: { mode: "multi", allCountries: false, countryCodes: [] },
  price: "",
  discount: "",
  description: "",
  productDetails: "",
  stock: "0",
  active: true,
  existingImageUrls: [],
  newFiles: [],
  mainImageIndex: 0,
  highlights: [],
  brand: "",
  weight: "0",
  dimensions: { length: "0", width: "0", height: "0" },
};

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
  const { data: categories = [] } = useGetProductCategoriesQuery();
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
    fd.set("discountPrice", v.discount ? String(Number(v.discount)) : "0");
    fd.set("description", v.description);
    fd.set("productDetails", v.productDetails);
    fd.set("stock", String(Math.max(0, Math.floor(Number(v.stock || 0)))));
    fd.set("status", v.active ? "active" : "inactive");
    if (v.brand) fd.set("brand", v.brand.trim());
    fd.set("weight", String(Number(v.weight)));
    fd.set(
      "dimensions",
      JSON.stringify({
        length: String(v.dimensions.length),
        width: String(v.dimensions.width),
        height: String(v.dimensions.height),
      }),
    );
    fd.set(
      "mainImageIndex",
      String(Math.max(0, Math.floor(Number(v.mainImageIndex || 0)))),
    );
    fd.set(
      "topHighlights",
      JSON.stringify(
        (v.highlights ?? [])
          .filter((h) => h.title.trim() || h.value.trim())
          .map((h) => ({ name: h.title, value: h.value })),
      ),
    );
    for (const f of v.newFiles) fd.append("image", f);
    const paths = v.existingImageUrls.map((u) =>
      u.replace(
        import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v\d+$/, "") ??
          "http://localhost:4060",
        "",
      ),
    );
    fd.append("existingImages", JSON.stringify(paths));
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
                <Select
                  value={v.category}
                  onValueChange={(val) =>
                    setV((s) => ({ ...s, category: val }))
                  }
                >
                  <SelectTrigger
                    id="category"
                    className="rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#895129]"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="grid gap-2">
                <Label className="text-gray-700" htmlFor="brand">
                  Brand (ID)
                </Label>
                <Input
                  id="brand"
                  value={v.brand}
                  onChange={(e) =>
                    setV((s) => ({ ...s, brand: e.target.value }))
                  }
                  placeholder="e.g. 6875f6a2b4b8f12345678901"
                  className="rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#895129]"
                />
              </div> */}
              {/* <div className="grid gap-2">
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
              </div> */}
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
                {/* <div className="flex items-center gap-2 pt-6">
                  <Switch
                    id="active"
                    checked={v.active}
                    onCheckedChange={(x) => setV((s) => ({ ...s, active: x }))}
                  />
                  <Label className="text-gray-700" htmlFor="active">
                    Active
                  </Label>
                </div> */}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-gray-700" htmlFor="weight">
                    Weight (g/kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    min={0}
                    value={v.weight}
                    onChange={(e) =>
                      setV((s) => ({ ...s, weight: e.target.value }))
                    }
                    className="rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#895129]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700">
                    Dimensions (L x W x H)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="L"
                      min={0}
                      value={v.dimensions.length}
                      onChange={(e) =>
                        setV((s) => ({
                          ...s,
                          dimensions: {
                            ...s.dimensions,
                            length: e.target.value,
                          },
                        }))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="W"
                      min={0}
                      value={v.dimensions.width}
                      onChange={(e) =>
                        setV((s) => ({
                          ...s,
                          dimensions: {
                            ...s.dimensions,
                            width: e.target.value,
                          },
                        }))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="H"
                      min={0}
                      value={v.dimensions.height}
                      onChange={(e) =>
                        setV((s) => ({
                          ...s,
                          dimensions: {
                            ...s.dimensions,
                            height: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
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
                <Label htmlFor="details">Product Details</Label>
                <Textarea
                  id="details"
                  rows={4}
                  value={v.productDetails}
                  onChange={(e) =>
                    setV((s) => ({
                      ...s,
                      productDetails: e.target.value,
                    }))
                  }
                  placeholder="The iPhone 16 Pro Max comes with..."
                />
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
