import { Link } from "react-router-dom";
import { Award, ExternalLink, Package, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/utils/utils";
import { formatCurrency, useCurrency } from "@/utils/format-currency";
import type { InventoryTopStockedProduct } from "@/types/api";

type Props = {
  data?: InventoryTopStockedProduct[];
  isLoading?: boolean;
};

export function TopStockedProductsCard({ data = [], isLoading }: Props) {
  useCurrency();

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/70 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">
              <Award className="size-4" />
            </span>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Top Stocked Products
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Catalog items representing your highest stock units & tied-up capital
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
            <Package className="size-10 text-muted-foreground/30 mb-2" />
            <p>No inventory products listed yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => {
              const totalHeldValue = (item.stock || 0) * (item.price || 0);
              const imgUrl = item.images?.[0] ? getImageUrl(item.images[0]) : null;

              return (
                <div
                  key={item._id}
                  className="group/item flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-all hover:border-gray-200 hover:bg-slate-50/70 hover:shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0
                          ? "bg-amber-100 text-amber-800"
                          : index === 1
                          ? "bg-slate-200 text-slate-700"
                          : index === 2
                          ? "bg-amber-700/10 text-amber-900"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.name}
                          className="size-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <Package className="size-5" />
                        </div>
                      )}
                    </div>

                    {/* Product Name & SKU */}
                    <div className="min-w-0">
                      <Link
                        to={`/vendor/products/${item._id}`}
                        className="font-semibold text-gray-900 hover:text-primary transition-colors truncate text-sm block"
                      >
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                          {item.sku}
                        </Badge>
                        <span>·</span>
                        <span>{formatCurrency(item.price)} / unit</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock count and total valuation */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pl-9 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-1.5 sm:justify-end text-sm font-bold text-gray-900">
                        <Package className="size-3.5 text-primary" />
                        <span>{item.stock} units</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total Value:{" "}
                        <span className="font-semibold text-emerald-700">
                          {formatCurrency(totalHeldValue)}
                        </span>
                      </p>
                    </div>

                    <Link
                      to={`/vendor/products/${item._id}`}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-white text-muted-foreground hover:text-gray-900 hover:bg-slate-50 transition-colors"
                      title="View product"
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
