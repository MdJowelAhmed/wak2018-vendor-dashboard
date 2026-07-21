import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "@/features/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
function ProductThumb({ urls }: { urls: string[] }) {
  const first = urls[0];
  if (first) {
    return (
      <img src={first} alt="" className="size-10 rounded-md object-cover" />
    );
  }
  return <div className="bg-muted size-10 rounded-md" />;
}

export function ProductsListPage() {
  const { data, isLoading, isError, refetch } = useGetProductsQuery();
  const [remove, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function onDelete(id: string) {
    if (!window.confirm("Delete this product?")) {
      return;
    }
    setDeletingId(id);
    try {
      await remove(id).unwrap();
      toast.success("Product deleted");
      void refetch();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground">
            Manage your catalog, pricing, and availability.
          </p>
        </div>
        <Button asChild>
          <Link
            to="/vendor/products/create"
            className="inline-flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            Add product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All products</CardTitle>
        </CardHeader>
        <CardContent>
          {isError && (
            <p className="text-destructive mb-2 text-sm">
              Failed to load products. Check the API and auth.
            </p>
          )}
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[1%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <ProductThumb urls={p.imageUrls} />
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-medium">
                      <Link
                        to={`/vendor/products/${p.id}`}
                        className="hover:underline"
                      >
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "USD",
                      }).format(p.price)}
                    </TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>
                      {p.active ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to={`/vendor/products/edit/${p.id}`}
                            aria-label="Edit product"
                          >
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          disabled={isDeleting && deletingId === p.id}
                          onClick={() => onDelete(p.id)}
                          aria-label="Delete product"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.length && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-6 text-center"
                    >
                      No products yet. Create your first one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
