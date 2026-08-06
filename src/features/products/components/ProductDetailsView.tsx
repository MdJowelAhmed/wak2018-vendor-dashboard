import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { Product } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/utils";
import { ProductGallery } from "./ProductGallery";

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);

export function ProductDetailsView({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
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
              <p className="text-muted-foreground text-sm">
                {product.description}
              </p>
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
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {product.productDetails}
              </p>
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
