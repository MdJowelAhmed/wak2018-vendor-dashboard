import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { Product } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/utils";
import { ProductGallery } from "./ProductGallery";

import { formatCurrency as fmt, useCurrency } from "@/utils/format-currency";

export function ProductDetailsView({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  useCurrency();
  const images = product.imageUrls ?? [];
  const [mainIndex, setMainIndex] = useState(product.mainImageIndex ?? 0);
  const [qty, setQty] = useState(1);

  const price = useMemo(() => {
    const base = product.price ?? 0;
    const discount = product.discount ?? 0;
    const next = Math.max(0, base - discount);
    return { base, discount, next };
  }, [product.price, product.discount]);

  return (
    <div className={cn("w-full space-y-6", className)}>
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <ProductGallery
          imageUrls={images}
          mainIndex={mainIndex}
          onSelect={setMainIndex}
        />

        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {product.name}
              </h1>
              {product.category ? (
                <p className="text-muted-foreground text-sm">
                  {product.category}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-primary flex items-center gap-1">
                <Star className="size-4 fill-current" />
                <span className="text-sm font-medium">
                  {(product.rating ?? 4.5).toFixed(1)}
                </span>
              </div>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {product.stock} in stock
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-semibold">{fmt(price.next)}</div>
                {price.discount ? (
                  <>
                    <div className="text-muted-foreground text-sm line-through">
                      {fmt(price.base)}
                    </div>
                    <div className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium">
                      Save {fmt(price.discount)}
                    </div>
                  </>
                ) : null}
              </div>
              {product.description ? (
                <FormattedContent
                  content={product.description}
                  className="text-muted-foreground text-sm"
                />
              ) : null}
              {product.localDeliveryFee != null &&
              Number(product.localDeliveryFee) > 0 ? (
                <p className="text-muted-foreground text-sm">
                  Local delivery fee: {fmt(product.localDeliveryFee)}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Qty</span>
                <Input
                  type="number"
                  min={1}
                  max={Math.max(1, product.stock)}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Math.floor(Number(e.target.value || 1))))
                  }
                  className="h-9 w-24"
                />
              </div>
              <div className="flex flex-1 items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Add to Cart
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-auto bg-[#895129] hover:bg-[#7b4723]"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {product.variants?.length ? (
              <div className="border-border/60 space-y-3 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Product Variants
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {product.variants.length} variant{product.variants.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {product.variants.map((vr, idx) => (
                    <div
                      key={vr._id || vr.id || idx}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/60 p-2.5"
                    >
                      <div className="flex items-center gap-3">
                        {vr.image ? (
                          <img
                            src={vr.image}
                            alt={vr.color || `Variant ${idx + 1}`}
                            className="size-11 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="flex size-11 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-500">
                            #{idx + 1}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-900">
                              {vr.color || `Variant #${idx + 1}`}
                            </span>
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                              {vr.stock} in stock
                            </span>
                          </div>
                          {vr.sizes?.length ? (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Sizes: {vr.sizes.join(", ")}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : product.colors?.length || product.sizes?.length ? (
              <div className="border-border/60 space-y-3 rounded-xl border p-4">
                {product.colors?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold">Colors</h3>
                    <p className="mt-1 text-sm">{product.colors.join(", ")}</p>
                  </div>
                ) : null}
                {product.sizes?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold">Sizes</h3>
                    <p className="mt-1 text-sm">{product.sizes.join(", ")}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {product.highlights?.length ? (
              <div className="border-border/60 rounded-xl border p-4">
                <h3 className="text-sm font-semibold">Top Highlights</h3>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {product.highlights.map((h, i) => (
                    <div key={`${h.title}-${i}`} className="text-sm">
                      <span className="text-muted-foreground">{h.title}:</span>{" "}
                      <span className="font-medium">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            {product.productDetails ? (
              <FormattedContent
                content={product.productDetails}
                className="text-foreground text-sm"
              />
            ) : (
              <p className="text-muted-foreground text-sm">
                No product details provided.
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
          "prose prose-sm max-w-none text-muted-foreground leading-relaxed",
          "[&_p]:mb-1.5 [&_p:last-child]:mb-0",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5",
          "[&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-2 [&_h2]:mb-1",
          "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-2 [&_h3]:mb-1",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-[#895129]/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-1.5",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <p className={cn("whitespace-pre-wrap text-sm", className)}>{content}</p>
  );
}
