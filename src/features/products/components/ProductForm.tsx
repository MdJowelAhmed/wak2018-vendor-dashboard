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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/utils/utils";
import { type ServiceCountrySelection } from "@/components/CountryMultiSelect";
import { ImageUploader, type ImageUploaderValue } from "./ImageUploader";
import { HighlightsInput, type HighlightRow } from "./HighlightsInput";
import {
  ProductVariantsInput,
  type VariantFormItem,
} from "./ProductVariantsInput";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
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
  localDeliveryFee: string;
  variants: VariantFormItem[];
  colors?: string[];
  sizes?: string[];
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
  localDeliveryFee: "0",
  variants: [],
  colors: [],
  sizes: [],
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

  const hasVariants = (v.variants ?? []).length > 0;
  const totalVariantStock = useMemo(
    () =>
      (v.variants ?? []).reduce(
        (sum, item) => sum + (Math.max(0, Math.floor(Number(item.stock))) || 0),
        0,
      ),
    [v.variants],
  );

  function validate(): string[] {
    const e: string[] = [];
    if (!v.name.trim()) e.push("Product name is required.");
    if (!String(v.price).trim()) e.push("Price is required.");
    if (!Number.isFinite(Number(v.price))) e.push("Price must be a number.");
    if (
      String(v.localDeliveryFee).trim() &&
      !Number.isFinite(Number(v.localDeliveryFee))
    ) {
      e.push("Local delivery fee must be a number.");
    }
    if (Number(v.localDeliveryFee) < 0) {
      e.push("Local delivery fee cannot be negative.");
    }
    if (totalImages < 1) e.push("At least 1 main product image is required.");

    if (!hasVariants) {
      if (!String(v.stock).trim()) {
        e.push("Stock is required when no variants are provided.");
      } else if (!Number.isFinite(Number(v.stock)) || Number(v.stock) < 0) {
        e.push("Stock must be a non-negative number.");
      }
    } else {
      v.variants.forEach((vr, idx) => {
        const numStock = Number(vr.stock);
        if (vr.stock === "" || !Number.isFinite(numStock) || numStock < 0) {
          e.push(
            `Variant #${idx + 1} (${vr.color.trim() || "Unnamed"}) stock must be a non-negative number.`,
          );
        }
      });
    }

    return e;
  }

  function toFormData() {
    const fd = new FormData();

    // 1. Basic Product Info
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
    fd.set("status", v.active ? "active" : "inactive");
    if (v.brand) fd.set("brand", v.brand.trim());
    fd.set("weight", String(Number(v.weight)));
    fd.set("localDeliveryFee", String(Number(v.localDeliveryFee || 0)));
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

    // 2. Variants (JSON Stringified) & Variant Images
    // Old fields colors[] and sizes[] are NO LONGER SUPPORTED. Do NOT send them.
    if (hasVariants) {
      const variantsArray = v.variants.map((vr) => {
        const item: {
          color?: string;
          stock: number;
          sizes: string[];
          image?: string;
        } = {
          stock: Math.max(0, Math.floor(Number(vr.stock) || 0)),
          sizes: (vr.sizes ?? []).map((s) => s.trim()).filter(Boolean),
        };

        if (vr.color?.trim()) {
          item.color = vr.color.trim();
        }

        // For existing variants where you are NOT changing the image, just keep the existing image URL in the variant's image property.
        // For new variants or variants where you are replacing the image, omit "image" property because it's a new upload.
        if (vr.image && !vr.newFile) {
          item.image = vr.image;
        }

        return item;
      });

      fd.append("variants", JSON.stringify(variantsArray));

      // 3. Variant Images & Indexes
      const variantImageIndexes: number[] = [];
      v.variants.forEach((vr, index) => {
        if (vr.newFile) {
          fd.append("variantImages", vr.newFile);
          variantImageIndexes.push(index);
        }
      });

      if (variantImageIndexes.length > 0) {
        fd.append("variantImageIndexes", JSON.stringify(variantImageIndexes));
      }

      // Global stock: optional when variants exist (backend auto-calculates sum of variants)
      fd.set("stock", String(totalVariantStock));
    } else {
      // If product does NOT have variants, MUST provide global stock
      fd.append("variants", JSON.stringify([]));
      fd.set("stock", String(Math.max(0, Math.floor(Number(v.stock || 0)))));
    }

    // 4. Main Product Images
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
                    Stock{" "}
                    {hasVariants && (
                      <span className="text-xs font-normal text-muted-foreground">
                        (Auto: {totalVariantStock})
                      </span>
                    )}
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    value={hasVariants ? totalVariantStock : v.stock}
                    disabled={hasVariants}
                    onChange={(e) =>
                      setV((s) => ({ ...s, stock: e.target.value }))
                    }
                    className={cn(
                      "rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#895129]",
                      hasVariants && "bg-gray-100 text-gray-500 cursor-not-allowed",
                    )}
                  />
                  {hasVariants ? (
                    <p className="text-[11px] text-muted-foreground">
                      Calculated from sum of all {v.variants.length} variant(s).
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-700" htmlFor="localDeliveryFee">
                    Local delivery fee
                  </Label>
                  <Input
                    id="localDeliveryFee"
                    type="number"
                    min={0}
                    step="0.01"
                    value={v.localDeliveryFee}
                    onChange={(e) =>
                      setV((s) => ({
                        ...s,
                        localDeliveryFee: e.target.value,
                      }))
                    }
                    placeholder="0.00"
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

        {/* Product Variants Section */}
          <Card className="rounded-2xl border border-gray-200 bg-white py-0 shadow-sm">
            <CardContent className="p-6">
              <ProductVariantsInput
                variants={v.variants}
                onChange={(variants) => setV((s) => ({ ...s, variants }))}
              />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>
                Write a rich formatted overview, bullet points, and key details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Product Description</Label>
                <RichTextEditor
                  id="description"
                  value={v.description}
                  onChange={(description) =>
                    setV((s) => ({ ...s, description }))
                  }
                  placeholder="Write a rich description for your product, features, bullet points…"
                  minHeight="140px"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="details">Product Details</Label>
                <RichTextEditor
                  id="details"
                  value={v.productDetails}
                  onChange={(productDetails) =>
                    setV((s) => ({ ...s, productDetails }))
                  }
                  placeholder="Additional specifications, materials, warranty, care instructions…"
                  minHeight="120px"
                />
              </div>
            </CardContent>
          </Card>


    </div>
  );
}
