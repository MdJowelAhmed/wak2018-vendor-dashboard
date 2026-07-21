import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProductQuery } from "@/features/products";
import { ProductDetailsView } from "@/features/products/components/ProductDetailsView";

export function ProductDetailsPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetProductQuery(id ?? "", {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }
  if (isError || !data) {
    return <p className="text-destructive text-sm">Failed to load product.</p>;
  }

  return <ProductDetailsView product={data} />;
}
