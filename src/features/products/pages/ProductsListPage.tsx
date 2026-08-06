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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function onDelete(id: string) {
    setProductToDelete(null);
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
                          disabled={isDeleting && deletingId === p.id}
                          onClick={() => setProductToDelete(p.id)}
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

      <Dialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <DialogContent className="sm:max-w-[400px] text-center">
          <DialogHeader>
            <DialogTitle className="text-center">Delete Product</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex w-full items-center justify-center gap-2 sm:justify-center mt-4">
            <Button
              variant="outline"
              className="w-24"
              onClick={() => setProductToDelete(null)}
            >
              No
            </Button>
            <Button
              variant="destructive"
              className="w-24"
              onClick={() => {
                if (productToDelete) onDelete(productToDelete);
              }}
              disabled={isDeleting}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
