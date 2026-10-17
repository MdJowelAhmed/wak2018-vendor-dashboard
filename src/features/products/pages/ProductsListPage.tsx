import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Pencil,
  Plus,
  Trash2,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Package,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
  useGetProductCategoriesQuery,
  type GetProductsParams,
} from "@/features/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, useCurrency } from "@/utils/format-currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/types/api";

function ProductThumb({ urls, name }: { urls: string[]; name?: string }) {
  const first = urls?.[0];
  if (first) {
    return (
      <img
        src={first}
        alt={name || "Product"}
        className="size-10 rounded-lg object-cover ring-1 ring-border/50 shadow-xs"
        onError={(e) => {
          (e.target as HTMLElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground/50">
      <Package className="size-5" />
    </div>
  );
}

function SortHeaderIcon({
  field,
  currentSort,
  currentOrder,
}: {
  field: string;
  currentSort: string;
  currentOrder: string;
}) {
  if (currentSort !== field) {
    return <ArrowUpDown className="ml-1 size-3 text-muted-foreground/60 group-hover:text-foreground" />;
  }
  return currentOrder === "asc" ? (
    <ArrowUp className="ml-1 size-3.5 text-primary" />
  ) : (
    <ArrowDown className="ml-1 size-3.5 text-primary" />
  );
}

export function ProductsListPage() {
  useCurrency();

  // Search & Filter State
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  // Sorting State
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Debounce search input to avoid spamming requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Construct query parameters
  const queryParams = useMemo(() => {
    const p: GetProductsParams = {
      page,
      limit,
    };
    if (searchTerm) p.searchTerm = searchTerm;
    if (category && category !== "all") p.category = category;
    if (status && status !== "all") p.status = status;
    if (sortBy) {
      p.sortBy = sortBy;
      p.sortOrder = sortOrder;
    }
    return p;
  }, [page, limit, searchTerm, category, status, sortBy, sortOrder]);

  // API Queries
  const { data: res, isLoading, isFetching, isError, refetch } = useGetProductsQuery(queryParams);
  const { data: categories = [] } = useGetProductCategoriesQuery();

  // Delete Mutation
  const [remove, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Parse response products & pagination
  const products: Product[] = Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res)
    ? res
    : [];

  const pagination = res?.pagination;
  const total = pagination?.total ?? products.length;
  const totalPages = pagination?.totalPage ?? Math.max(1, Math.ceil(total / limit));

  // Reset Filters handler
  const isFiltered = Boolean(
    searchInput ||
      (category && category !== "all") ||
      (status && status !== "all") ||
      sortBy !== "createdAt" ||
      sortOrder !== "desc" ||
      page !== 1
  );

  function handleResetFilters() {
    setSearchInput("");
    setSearchTerm("");
    setCategory("all");
    setStatus("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  }

  // Handle Column Header Sort (only Stock)
  function handleColumnSort(field: "stock") {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  }

  // Handle Preset Sorting (e.g. Stock Low to High for restocking)
  function handleSortSelect(val: string) {
    const [field, order] = val.split(":") as [string, "asc" | "desc"];
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  }

  async function onDelete(id: string) {
    setProductToDelete(null);
    setDeletingId(id);
    try {
      await remove(id).unwrap();
      toast.success("Product deleted successfully");
      void refetch();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Products
            </h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {total} {total === 1 ? "Item" : "Items"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage, filter, search, and update stock across your product inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
          </Button>

          <Button asChild size="sm" className="h-9 gap-1.5 text-xs font-medium">
            <Link to="/vendor/products/create">
              <Plus className="size-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Table & Filter Container */}
      <Card className="rounded-2xl border border-border/80 shadow-xs">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold">Inventory Catalog</CardTitle>
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
                Reset Filters
              </Button>
            )}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
            {/* Search Input */}
            <div className="relative lg:col-span-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-9 pl-9 pr-8 text-xs rounded-xl"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="lg:col-span-3">
              <Select
                value={category}
                onValueChange={(val) => {
                  setCategory(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full text-xs rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Dropdown */}
            <div className="lg:col-span-2">
              <Select
                value={status}
                onValueChange={(val) => {
                  setStatus(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full text-xs rounded-xl">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-3">
              <Select
                value={`${sortBy}:${sortOrder}`}
                onValueChange={handleSortSelect}
              >
                <SelectTrigger className="h-9 w-full text-xs rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">Newest Added</SelectItem>
                  <SelectItem value="createdAt:asc">Oldest Added</SelectItem>
                  <SelectItem value="stock:asc">Stock: Low to High</SelectItem>
                  <SelectItem value="stock:desc">Stock: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isError && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>Failed to load products. Check your connection or retry.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                Retry
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Local Delivery</TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => handleColumnSort("stock")}
                        className="group inline-flex items-center font-semibold text-gray-700 hover:text-gray-900 cursor-pointer"
                      >
                        <span>Stock</span>
                        <SortHeaderIcon
                          field="stock"
                          currentSort={sortBy}
                          currentOrder={sortOrder}
                        />
                      </button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[1%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const isOutOfStock = p.stock === 0;
                    const isLowStock = p.stock > 0 && p.stock < (p.lowStockThreshold ?? 5);

                    return (
                      <TableRow key={p.id} className="transition-colors hover:bg-slate-50/70">
                        {/* Thumbnail */}
                        <TableCell>
                          <ProductThumb urls={p.imageUrls} name={p.name} />
                        </TableCell>

                        {/* Name & SKU */}
                        <TableCell className="max-w-xs font-medium">
                          <Link
                            to={`/vendor/products/${p.id}`}
                            className="font-semibold text-gray-900 hover:text-primary transition-colors block truncate"
                          >
                            {p.name}
                          </Link>
                          {p.sku && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              SKU: {p.sku}
                            </span>
                          )}
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                            {p.category || "Unassigned"}
                          </span>
                        </TableCell>

                        {/* Price */}
                        <TableCell>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(p.discountPrice ?? p.price)}
                          </div>
                          {p.discountPrice && (
                            <div className="text-[11px] text-muted-foreground line-through">
                              {formatCurrency(p.price)}
                            </div>
                          )}
                        </TableCell>

                        {/* Delivery fee */}
                        <TableCell className="text-xs text-muted-foreground">
                          {formatCurrency(p.localDeliveryFee ?? 0)}
                        </TableCell>

                        {/* Stock Units with alert indicator */}
                        <TableCell>
                          {isOutOfStock ? (
                            <Badge variant="destructive" className="gap-1 text-[11px] font-semibold">
                              <AlertTriangle className="size-3" />
                              Out of Stock
                            </Badge>
                          ) : isLowStock ? (
                            <Badge
                              variant="outline"
                              className="border-amber-300 bg-amber-50 text-amber-700 gap-1 text-[11px] font-semibold"
                            >
                              <AlertTriangle className="size-3 text-amber-600" />
                              {p.stock} (Low Stock)
                            </Badge>
                          ) : (
                            <span className="font-semibold text-gray-900 text-xs">
                              {p.stock} units
                            </span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {p.active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/80">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                              <span className="size-1.5 rounded-full bg-gray-400" />
                              Inactive
                            </span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button variant="ghost" size="icon" asChild className="size-8">
                              <Link
                                to={`/vendor/products/${p.id}`}
                                aria-label="View product details"
                                title="View details"
                              >
                                <Eye className="size-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild className="size-8">
                              <Link
                                to={`/vendor/products/edit/${p.id}`}
                                aria-label="Edit product"
                                title="Edit product"
                              >
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isDeleting && deletingId === p.id}
                              onClick={() => setProductToDelete(p.id)}
                              aria-label="Delete product"
                              title="Delete product"
                              className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="size-10 text-muted-foreground/30 mb-2" />
                          <p className="font-semibold text-gray-900">No products found</p>
                          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                            {isFiltered
                              ? "Try adjusting your search keywords, category, or status filter."
                              : "You haven't added any products yet. Click 'Add Product' to list your first item."}
                          </p>
                          {isFiltered && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleResetFilters}
                              className="mt-3 h-8 text-xs"
                            >
                              Reset All Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-4 px-1 mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Show:</span>
                <Select
                  value={String(limit)}
                  onValueChange={(val) => {
                    setLimit(Number(val));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-18 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                  </SelectContent>
                </Select>
                <span className="hidden sm:inline ml-2">
                  Showing {total === 0 ? 0 : (page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} products
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="h-8 text-xs rounded-lg px-3"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1 text-xs font-semibold px-1">
                  <span>Page {page} of {totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                  className="h-8 text-xs rounded-lg px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <DialogContent className="sm:max-w-[400px] text-center">
          <DialogHeader>
            <DialogTitle className="text-center">Delete Product</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex w-full items-center justify-center gap-2 sm:justify-center mt-4">
            <Button
              variant="outline"
              className="w-24"
              onClick={() => setProductToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="w-24"
              onClick={() => {
                if (productToDelete) onDelete(productToDelete);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
