import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useGetCustomersQuery } from "@/features/customers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CustomerTag } from "@/types/api";

function fmtMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function tagLabel(t: CustomerTag) {
  if (t === "premium") return "Premium";
  if (t === "vip") return "VIP";
  return "Repeat Buyer";
}

export function CustomersManagementPage() {
  const q = useGetCustomersQuery();
  const rows = useMemo(() => (q.data ?? []).slice(), [q.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Customer Management</h1>
          <p className="text-muted-foreground text-sm">
            Identify high-value customers, repeat buyers, and their lifetime
            value.
          </p>
        </div>
      </div>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-[#895129]" />
            Customers
          </CardTitle>
          <CardDescription>
            Click a customer to view full insights and purchase behavior.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {q.isError ? (
            <p className="text-destructive text-sm mb-3">
              Failed to load customers.
            </p>
          ) : null}
          {q.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Total spend</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead>Last order</TableHead>
                  <TableHead className="w-[1%] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.country ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {(c.tags ?? []).map((t) => (
                          <Badge key={t} variant="secondary">
                            {tagLabel(t)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmtMoney(c.totalSpend)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.totalOrders}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.lastOrderAt
                        ? new Date(c.lastOrderAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/vendor/customers/${c.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!rows.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No customers yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
