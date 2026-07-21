import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetServiceQuery } from "@/features/services";
import { ServiceDetailsView } from "@/features/services/components/ServiceDetailsView";

export function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetServiceQuery(id ?? "", {
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
    return <p className="text-destructive text-sm">Failed to load service.</p>;
  }

  return (
    <ServiceDetailsView
      service={data}
      onEdit={() => navigate(`/vendor/services/edit/${data.id}`)}
    />
  );
}
