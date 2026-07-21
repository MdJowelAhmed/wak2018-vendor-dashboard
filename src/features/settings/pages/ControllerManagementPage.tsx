import { useEffect, useMemo, useState } from "react";
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
import {
  ServiceControllerModal,
  type ServiceControllerPermission,
  type ServiceControllerRecord,
} from "@/features/controllers";

const LS_KEY = "service_controller_management:list:v1";

const INITIAL_CONTROLLERS: ServiceControllerRecord[] = [
  {
    id: "ctrl-1",
    name: "Ayesha Khan",
    email: "ayesha@test.com",
    permissions: ["dashboard", "services", "bookings"],
  },
];

function loadControllers(): ServiceControllerRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return INITIAL_CONTROLLERS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return INITIAL_CONTROLLERS;
    const cleaned = parsed.filter(Boolean) as ServiceControllerRecord[];
    return cleaned.length ? cleaned : INITIAL_CONTROLLERS;
  } catch {
    return INITIAL_CONTROLLERS;
  }
}

function saveControllers(list: ServiceControllerRecord[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function permLabel(p: ServiceControllerPermission) {
  return p === "earnings" ? "Earnings" : p[0]!.toUpperCase() + p.slice(1);
}

export function ControllerManagementPage() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ServiceControllerRecord | null>(null);
  const [controllers, setControllers] = useState<ServiceControllerRecord[]>([]);

  useEffect(() => {
    setControllers(loadControllers());
  }, []);

  useEffect(() => {
    saveControllers(controllers);
  }, [controllers]);

  const rows = useMemo(() => controllers.slice(), [controllers]);

  function createController(c: {
    name: string;
    email: string;
    permissions: ServiceControllerPermission[];
  }) {
    setControllers((prev) => [
      {
        id: `ctrl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...c,
      },
      ...prev,
    ]);
  }

  function updateController(
    id: string,
    patch: {
      name: string;
      email: string;
      permissions: ServiceControllerPermission[];
    },
  ) {
    setControllers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  function deleteController(id: string) {
    setControllers((prev) => prev.filter((c) => c.id !== id));
    toast.success("Deleted");
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
              {rows.map((c, idx) => (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell className="text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.email}
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
                          setEditing(c);
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
                        onClick={() => deleteController(c.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length ? (
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
        </CardContent>
      </Card>

      <ServiceControllerModal
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        initial={editing}
        onSubmit={(payload) => {
          if (mode === "edit" && editing) {
            updateController(editing.id, payload);
          } else {
            createController(payload);
          }
        }}
      />
    </div>
  );
}
