import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SERVICE_DEMO, type ServiceRow } from "@/features/services";

export function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceRow[]>(() =>
    SERVICE_DEMO.map((s) => ({ ...s })),
  );

  const rows = useMemo(() => services, [services]);

  const fmtPrice = (price: number, type: ServiceRow["type"]) =>
    `$${price} / ${type}`;

  function remove(id: number) {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  function toggle(id: number, next: boolean) {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: next } : s)),
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">My Services</h1>
          <p className="text-muted-foreground text-sm">
            Manage your service listings and pricing.
          </p>
        </div>
        <Button asChild className="bg-[#895129] hover:bg-[#7b4723]">
          <Link to="/service/add-service">Add New Service</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Service Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Delivery Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Toggle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((s) => {
                const statusBadge =
                  s.isActive && s.status === "Active"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : s.status === "Draft"
                      ? "border-zinc-200 bg-zinc-50 text-zinc-700"
                      : "border-red-200 bg-red-50 text-red-700";

                const statusLabel = s.isActive ? s.status : "Disabled";

                return (
                  <TableRow key={s.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{s.title}</TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {fmtPrice(s.price, s.type)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.type}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.delivery}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadge}>
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={s.isActive}
                          onCheckedChange={(next) =>
                            toggle(s.id, Boolean(next))
                          }
                          className="data-[state=checked]:bg-[#895129]"
                          aria-label={`Toggle ${s.title}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-[#895129]/40 text-[#895129] hover:bg-[#895129]/10"
                        >
                          <button
                            type="button"
                            onClick={() => void navigate(`/service/${s.id}`)}
                          >
                            View
                          </button>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/service/add-service">Edit</Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => remove(s.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  No services.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
