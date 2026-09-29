import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Package,
  Tag,
  Truck,
  Layers,
  Calendar,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  Boxes,
  Ruler,
  Weight,
  Sparkles,
} from "lucide-react";
import type { Product } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/utils/utils";
import { formatCurrency as fmt } from "@/utils/format-currency";
import { useGetProductCategoriesQuery } from "../services/categoryApi";

export function ProductDetailsView({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { data: categories = [] } = useGetProductCategoriesQuery();
  const [copiedSku, setCopiedSku] = useState(false);

  // Look up category name if product.category is an ID
  const categoryName = useMemo(() => {
    if (!product.category) return "Uncategorized";
    const found = categories.find((c) => c._id === product.category);
    return found ? found.name : product.category;
  }, [product.category, categories]);

  // Combine main product images and variant images for an interactive gallery
  const allImages = useMemo(() => {
    const list: { url: string; label: string; isVariant?: boolean }[] = [];
    (product.imageUrls ?? []).forEach((url, i) => {
      list.push({
        url,
        label: i === 0 ? "Main Photo" : `Photo ${i + 1}`,
        isVariant: false,
      });
    });
    (product.variants ?? []).forEach((vr) => {
      if (vr.image && !list.some((img) => img.url === vr.image)) {
        list.push({
          url: vr.image,
          label: vr.color ? `Color: ${vr.color}` : "Variant Photo",
          isVariant: true,
        });
      }
    });
    return list;
  }, [product.imageUrls, product.variants]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activeImage = allImages[activeImageIndex]?.url || allImages[0]?.url;

  function copySku() {
    if (!product.sku) return;
    navigator.clipboard.writeText(product.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  }

  const isLowStock =
    product.lowStockThreshold != null &&
    product.stock <= product.lowStockThreshold;

  const totalVariantStock = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return product.stock;
    return product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }, [product.variants, product.stock]);

  return (
    <div className={cn("w-full space-y-6 pb-12", className)}>
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-gray-200 hover:bg-gray-100/80 text-gray-700"
          >
            <Link to="/vendor/products">
              <ArrowLeft className="mr-1.5 size-4" />
              Back to Products
            </Link>
          </Button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link
              to="/vendor/products"
              className="hover:text-foreground transition-colors"
            >
              Products
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground max-w-[200px] truncate">
              {product.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {product.active || product.status === "active" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Listing
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
              Inactive
            </span>
          )}

          <Button
            asChild
            size="sm"
            className="rounded-xl bg-[#895129] hover:bg-[#7b4723] text-white shadow-sm"
          >
            <Link to={`/vendor/products/edit/${product.id}`}>
              <Pencil className="mr-1.5 size-3.5" />
              Edit Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Product Overview Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Gallery / Images Showcase (5 cols) */}
        <div className="space-y-3 lg:col-span-5">
          <Card className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm p-0">
            <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="size-full object-contain p-2 transition-all duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Package className="size-12 mb-2 stroke-1" />
                  <p className="text-xs">No image available</p>
                </div>
              )}

              {allImages[activeImageIndex]?.label && (
                <span className="absolute bottom-3 left-3 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white">
                  {allImages[activeImageIndex].label}
                </span>
              )}
            </div>
          </Card>

          {/* Thumbnail list */}
          {allImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {allImages.map((img, idx) => {
                const isSelected = idx === activeImageIndex;
                return (
                  <button
                    key={`${img.url}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "relative size-16 shrink-0 rounded-xl overflow-hidden border-2 bg-gray-50 transition-all",
                      isSelected
                        ? "border-[#895129] ring-2 ring-[#895129]/20"
                        : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100",
                    )}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="size-full object-cover"
                    />
                    {img.isVariant && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#895129] text-[8px] text-white font-medium text-center py-0.5 truncate px-0.5">
                        Variant
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Details & Vital Stats (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              {/* Badges / Category / SKU */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-[#895129]">
                  <Tag className="size-3" />
                  {categoryName}
                </span>

                {product.sku && (
                  <button
                    type="button"
                    onClick={copySku}
                    className="inline-flex items-center gap-1 rounded-md bg-gray-100 hover:bg-gray-200/80 border border-gray-200 px-2.5 py-1 text-xs font-mono font-medium text-gray-700 transition-colors"
                    title="Click to copy SKU"
                  >
                    <span>SKU: {product.sku}</span>
                    {copiedSku ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3 text-gray-400" />
                    )}
                  </button>
                )}

                {product.createdAt && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                    <Calendar className="size-3" />
                    Added {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-snug">
                {product.name}
              </h1>

              {/* Price & Stock Metric Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                  <span className="text-xs font-medium text-gray-500">
                    Base Price
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {fmt(product.price)}
                    </span>
                    {product.discount != null && product.discount > 0 && (
                      <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Save {fmt(product.discount)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                  <span className="text-xs font-medium text-gray-500">
                    Total Inventory
                  </span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {totalVariantStock}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold",
                        isLowStock
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700",
                      )}
                    >
                      {isLowStock ? (
                        <>
                          <AlertCircle className="size-2.5 mr-0.5" /> Low Stock
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-2.5 mr-0.5" /> Healthy
                        </>
                      )}
                    </Badge>
                  </div>
                  {product.lowStockThreshold != null && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Threshold: {product.lowStockThreshold} units
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                  <span className="text-xs font-medium text-gray-500">
                    Local Delivery
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Truck className="size-4 text-gray-400" />
                    <span className="text-2xl font-bold text-gray-900">
                      {product.localDeliveryFee != null &&
                      product.localDeliveryFee > 0
                        ? fmt(product.localDeliveryFee)
                        : "Free"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logistics & Attributes Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-xs">
                <div className="p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Boxes className="size-3 text-gray-400" /> Variants
                  </span>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {product.variants?.length ?? 0} Options
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Weight className="size-3 text-gray-400" /> Weight
                  </span>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {product.weight ? `${product.weight} kg` : "0 kg"}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Ruler className="size-3 text-gray-400" /> Dimensions
                  </span>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {product.dimensions?.length ||
                    product.dimensions?.width ||
                    product.dimensions?.height
                      ? `${product.dimensions.length}×${product.dimensions.width}×${product.dimensions.height} cm`
                      : "0×0×0 cm"}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Layers className="size-3 text-gray-400" /> Target Market
                  </span>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {product.allCountries ? "Global" : "Specific Countries"}
                  </p>
                </div>
              </div>

              {/* Short HTML Description Excerpt */}
              {product.description && (
                <div className="pt-3 border-t border-gray-100">
                  <FormattedContent
                    content={product.description}
                    className="text-gray-600 text-sm leading-relaxed"
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Product Variants Breakdown Section */}
      {product.variants && product.variants.length > 0 && (
        <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Boxes className="size-5 text-[#895129]" />
                  Product Variants
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-0.5">
                  Available combinations of colors, sizes, stock allocation, and
                  photos.
                </CardDescription>
              </div>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-[#895129]">
                {product.variants.length} Variants ({totalVariantStock} Total Units)
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.variants.map((vr, idx) => {
                return (
                  <div
                    key={vr._id || vr.id || idx}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#895129]/10 text-xs font-semibold text-[#895129]">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {vr.color || `Variant #${idx + 1}`}
                        </span>
                      </div>
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {vr.stock} in stock
                      </span>
                    </div>

                    <div className="grid grid-cols-[100px_1fr] gap-3.5 items-start">
                      <div className="relative group size-24 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shrink-0">
                        {vr.image ? (
                          <img
                            src={vr.image}
                            alt={vr.color || ""}
                            className="size-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => {
                              const foundIdx = allImages.findIndex(
                                (img) => img.url === vr.image,
                              );
                              if (foundIdx >= 0) setActiveImageIndex(foundIdx);
                            }}
                            title="Click to view in main gallery"
                          />
                        ) : (
                          <div className="size-full flex flex-col items-center justify-center text-gray-300">
                            <Package className="size-6" />
                            <span className="text-[9px] mt-1 text-gray-400">
                              No image
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2.5 min-w-0">
                        <div>
                          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                            Color
                          </span>
                          <p className="text-sm font-medium text-gray-900">
                            {vr.color || "Standard"}
                          </p>
                        </div>

                        <div>
                          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                            Available Sizes
                          </span>
                          {vr.sizes && vr.sizes.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {vr.sizes.map((s) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center rounded-md bg-gray-100 border border-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-800"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 mt-0.5">
                              No sizes configured
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Highlights (if present) */}
      {product.highlights && product.highlights.length > 0 && (
        <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <CardHeader className="p-0 pb-3 mb-3 border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="size-4 text-[#895129]" />
              Top Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {product.highlights.map((h, i) => (
                <div
                  key={`${h.title}-${i}`}
                  className="rounded-xl border border-gray-100 bg-gray-50/60 p-3"
                >
                  <span className="text-xs text-gray-500">{h.title}</span>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {h.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deep-Dive Specifications & Rich Product Details */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="size-5 text-[#895129]" />
                  Product Specifications & Details
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-0.5">
                  Full product composition, sizing guides, and manufacturer
                  information.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {product.productDetails ? (
              <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-5">
                <FormattedContent
                  content={product.productDetails}
                  className="text-gray-800 text-sm leading-relaxed"
                />
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                No extra product details provided.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FormattedContent({
  content,
  className,
}: {
  content?: string;
  className?: string;
}) {
  if (!content) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  if (isHtml) {
    return (
      <div
        className={cn(
          "prose prose-sm max-w-none text-gray-700 leading-relaxed",
          "[&_p]:mb-2.5 [&_p:last-child]:mb-0",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2.5",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2.5",
          "[&_li]:mb-1",
          "[&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3:first-child]:mt-0",
          "[&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-4 [&_h2]:mb-2",
          "[&_strong]:font-semibold [&_strong]:text-gray-900",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-[#895129] [&_blockquote]:pl-3.5 [&_blockquote]:italic [&_blockquote]:my-2.5 [&_blockquote]:text-gray-600",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <p className={cn("whitespace-pre-wrap text-sm text-gray-700", className)}>
      {content}
    </p>
  );
}
