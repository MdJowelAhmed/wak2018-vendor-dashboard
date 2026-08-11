import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { useGetMyServicesQuery } from "@/features/services";
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
import type { RootState } from "@/app/store";
import { useGetProfileQuery } from "@/services/userApi";
import type { UserRole } from "@/features/auth/types/authTypes";

export function ServicesListPage() {
  const { data: res, isLoading, isError } = useGetMyServicesQuery();
  const authRole: UserRole | undefined = useSelector(
    (s: RootState) => s.auth.user?.role,
  );
  const { data: profile } = useGetProfileQuery();
  const role: UserRole | null = authRole ?? profile?.role ?? null;
  const data = res?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Services</h1>
          <p className="text-muted-foreground">
            {role === "service"
              ? "Manage your service provider listings."
              : "Listings with Basic, Standard, and Premium packages."}
          </p>
        </div>
        <Button asChild>
          <Link
            to="/vendor/services/create"
            className="inline-flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            Create service
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service offerings</CardTitle>
        </CardHeader>
        <CardContent>
          {isError && (
            <p className="text-destructive mb-2 text-sm">
              Failed to load services.
            </p>
          )}
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Delivery Time</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="max-w-sm">
                      <div className="font-medium">
                        {role === "service" ? (
                          <Link
                            to={`/vendor/services/${s._id}`}
                            className="hover:underline"
                          >
                            {s.name}
                          </Link>
                        ) : (
                          s.name
                        )}
                      </div>
                      <div className="text-muted-foreground line-clamp-1 text-sm">
                        {s.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      {s.deliveryTime} Days
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "USD",
                      }).format(s.price)}
                    </TableCell>
                  </TableRow>
                ))}
                {!data.length && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground py-6 text-center"
                    >
                      No services yet. Create a listing to sell packages to
                      customers.
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
