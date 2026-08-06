import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ServiceControllerModal,
  type ServiceControllerPermission,
  type ServiceControllerRecord,
} from "@/features/controllers";
import {
  useGetStaffsQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} from "@/features/controllers/services/staffApi";

function permLabel(p: string) {
  return p === "earnings" ? "Earnings" : p[0]!.toUpperCase() + p.slice(1);
}

export function ControllerManagementPage() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ServiceControllerRecord | null>(null);
  
  const { data: staffs = [], isLoading } = useGetStaffsQuery();
  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();

  async function handleCreate(c: {
    name: string;
    email: string;
    permissions: ServiceControllerPermission[];
  }) {
    try {
      await createStaff({
        name: c.name,
        email: c.email,
        permissions: c.permissions,
      }).unwrap();
      toast.success("Controller created");
      setOpen(false);
    } catch {
      toast.error("Failed to create controller");
    }
  }

  async function handleUpdate(
    id: string,
    patch: {
      name: string;
      email: string;
      permissions: ServiceControllerPermission[];
    },
  ) {
    try {
      await updateStaff({
        id,
        data: {
          staffName: patch.name,
          permissions: patch.permissions,
        },
      }).unwrap();
      toast.success("Controller updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update controller");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteStaff(id).unwrap();
      toast.success("Controller deleted");
    } catch {
      toast.error("Failed to delete controller");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Controller Management</h1>
          <p className="text-muted-foreground text-sm">
            Create controllers and assign page access permissions.
          </p>
        </div>
        <Button
          type="button"
          className="bg-[#895129] hover:bg-[#7b4723]"
          onClick={() => {
            setMode("create");
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Add Controller
        </Button>
      </div>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Controllers</CardTitle>
          <CardDescription>Manage access for delegated staff.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[1%]">SL</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Page Access</TableHead>
                  <TableHead className="w-[1%] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffs.map((c, idx) => (
                  <TableRow key={c._id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{c.staffName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.staffEmail}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {c.permissions.map((p) => (
                          <Badge
                            key={p}
                            variant="secondary"
                            className="capitalize"
                          >
                            {permLabel(p)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setMode("edit");
                            setEditing({
                              id: c._id,
                              name: c.staffName,
                              email: c.staffEmail,
                              permissions: c.permissions as ServiceControllerPermission[],
                            });
                            setOpen(true);
                          }}
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => handleDelete(c._id)}
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!staffs.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No controllers yet. Click “Add Controller” to create one.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ServiceControllerModal
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        initial={editing}
        onSubmit={(payload) => {
          if (mode === "edit" && editing) {
            handleUpdate(editing.id, payload);
          } else {
            handleCreate(payload);
          }
        }}
      />
    </div>
  );
}
