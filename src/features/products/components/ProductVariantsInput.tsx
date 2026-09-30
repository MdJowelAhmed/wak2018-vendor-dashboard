import { useRef } from "react";
import { Plus, Trash2, Upload, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagListInput } from "./TagListInput";
import { cn } from "@/utils/utils";

export type VariantFormItem = {
  id: string;
  _id?: string;
  color: string;
  stock: string;
  sizes: string[];
  image?: string;
  newFile?: File;
  previewUrl?: string;
};

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export function ProductVariantsInput({
  variants,
  onChange,
  className,
}: {
  variants: VariantFormItem[];
  onChange: (next: VariantFormItem[]) => void;
  className?: string;
}) {
  function addVariant() {
    const newVariant: VariantFormItem = {
      id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      color: "",
      stock: "0",
      sizes: [],
    };
    onChange([...variants, newVariant]);
  }

  function removeVariant(index: number) {
    const item = variants[index];
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    onChange(variants.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, patch: Partial<VariantFormItem>) {
    onChange(
      variants.map((v, i) => {
        if (i !== index) return v;
        return { ...v, ...patch };
      }),
    );
  }

  function handleFileSelect(index: number, file?: File) {
    if (!file) return;
    const current = variants[index];
    if (current?.previewUrl) {
      URL.revokeObjectURL(current.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    updateVariant(index, {
      newFile: file,
      previewUrl,
    });
  }

  function removeVariantImage(index: number) {
    const current = variants[index];
    if (current?.previewUrl) {
      URL.revokeObjectURL(current.previewUrl);
    }
    updateVariant(index, {
      image: undefined,
      newFile: undefined,
      previewUrl: undefined,
    });
  }

  function toggleCommonSize(index: number, size: string) {
    const currentSizes = variants[index].sizes ?? [];
    if (currentSizes.includes(size)) {
      updateVariant(index, {
        sizes: currentSizes.filter((s) => s !== size),
      });
    } else {
      updateVariant(index, {
        sizes: [...currentSizes, size],
      });
    }
  }

  const totalStock = variants.reduce(
    (sum, v) => sum + (Math.max(0, Math.floor(Number(v.stock))) || 0),
    0,
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Product Variants
          </h3>
          <p className="text-xs text-gray-500">
            Manage combinations of color, sizes, stock, and variant-specific
            photos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {variants.length > 0 && (
            <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-medium text-amber-900">
              Total Variant Stock: {totalStock}
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={addVariant}
            className="bg-[#895129] hover:bg-[#7b4723] text-white"
          >
            <Plus className="mr-1.5 size-4" />
            Add Variant
          </Button>
        </div>
      </div>

      {variants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-50 text-[#895129] mb-3">
            <ImageIcon className="size-6" />
          </div>
          <h4 className="text-sm font-medium text-gray-900">
            No variants created
          </h4>
          <p className="mt-1 max-w-sm text-xs text-gray-500">
            This product will use the single global stock in Basic Info. Add
            variants if this product has multiple colors, sizes, or stock
            levels.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
            className="mt-4 border-[#895129]/30 text-[#895129] hover:bg-amber-50"
          >
            <Plus className="mr-1.5 size-4" />
            Add Variant
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {variants.map((variant, idx) => {
            const displayImage = variant.previewUrl || variant.image;
            return (
              <VariantCard
                key={variant.id}
                index={idx}
                variant={variant}
                displayImage={displayImage}
                onUpdate={(patch) => updateVariant(idx, patch)}
                onRemove={() => removeVariant(idx)}
                onFileSelect={(file) => handleFileSelect(idx, file)}
                onRemoveImage={() => removeVariantImage(idx)}
                onToggleCommonSize={(sz) => toggleCommonSize(idx, sz)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function VariantCard({
  index,
  variant,
  displayImage,
  onUpdate,
  onRemove,
  onFileSelect,
  onRemoveImage,
  onToggleCommonSize,
}: {
  index: number;
  variant: VariantFormItem;
  displayImage?: string;
  onUpdate: (patch: Partial<VariantFormItem>) => void;
  onRemove: () => void;
  onFileSelect: (file?: File) => void;
  onRemoveImage: () => void;
  onToggleCommonSize: (size: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#895129]/10 text-xs font-semibold text-[#895129]">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {variant.color.trim() ? variant.color : `Variant #${index + 1}`}
          </span>
          {Number(variant.stock) > 0 && (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {variant.stock} in stock
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-gray-400 hover:text-destructive hover:bg-destructive/10 h-8 px-2"
          aria-label="Remove variant"
        >
          <Trash2 className="size-4 mr-1" />
          <span className="text-xs">Remove</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[115px_1fr]">
        {/* Variant Image */}
        <div className="flex flex-col items-center justify-start gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileSelect(file);
              }
              // Reset so selecting the same file triggers change
              e.target.value = "";
            }}
          />

          <div className="relative group flex size-28 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            {displayImage ? (
              <>
                <img
                  src={displayImage}
                  alt={variant.color || `Variant ${index + 1}`}
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="size-7 rounded-full bg-white/90 text-gray-800 hover:bg-white shadow"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change image"
                  >
                    <Upload className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="size-7 rounded-full bg-red-600 text-white hover:bg-red-700 shadow"
                    onClick={onRemoveImage}
                    title="Remove image"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex size-full flex-col items-center justify-center p-2 text-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Upload className="size-5 mb-1 text-gray-400" />
                <span className="text-[10px] font-medium leading-tight">
                  Upload Photo
                </span>
                <span className="text-[9px] text-gray-400 mt-0.5">
                  Variant image
                </span>
              </button>
            )}
          </div>
          {displayImage && (
            <p className="text-[10px] text-gray-500 truncate max-w-[110px]">
              {variant.newFile ? variant.newFile.name : "Saved image"}
            </p>
          )}
        </div>

        {/* Variant Fields */}
        <div className="space-y-3 min-w-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">
                Color Name
              </Label>
              <Input
                placeholder="e.g. Red, Matte Black"
                value={variant.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-[#895129]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">
                Stock Count
              </Label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={variant.stock}
                onChange={(e) => onUpdate({ stock: e.target.value })}
                className="rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-[#895129]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-gray-700">
                Available Sizes
              </Label>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[11px] text-gray-400 mr-1">Quick:</span>
                {COMMON_SIZES.map((sz) => {
                  const isSelected = variant.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => onToggleCommonSize(sz)}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors border",
                        isSelected
                          ? "bg-[#895129] text-white border-[#895129]"
                          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
                      )}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            <TagListInput
              id={`sizes-${variant.id}`}
              label=""
              value={variant.sizes}
              onChange={(sizes) => onUpdate({ sizes })}
              placeholder="Type size (e.g. XL, 42, Free Size) & press Add"
              className="[&>label]:hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
