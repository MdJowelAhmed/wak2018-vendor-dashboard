import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/utils";

export type ControllerPermissions =
  | "dashboard"
  | "products"
  | "services"
  | "orders"
  | "delivery"
  | "messages"
  | "analytics"
  | "settings";

export type ControllerRecord = {
  id: string;
  name: string;
  email: string;
  permissions: ControllerPermissions[];
};

const PERMS: Array<{ key: ControllerPermissions; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "Products" },
  { key: "services", label: "Services" },
  { key: "orders", label: "Orders" },
  { key: "delivery", label: "Delivery" },
  { key: "messages", label: "Messages" },
  { key: "analytics", label: "Analytics" },
  { key: "settings", label: "Settings" },
];

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[#895129]"
      />
    </label>
  );
}

export function AddControllerModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (c: Omit<ControllerRecord, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [permSet, setPermSet] = useState<
    Record<ControllerPermissions, boolean>
  >(() => ({
    dashboard: true,
    products: false,
    services: false,
    orders: false,
    delivery: false,
    messages: false,
    analytics: false,
    settings: false,
  }));

  const selected = useMemo(
    () => PERMS.filter((p) => permSet[p.key]).map((p) => p.key),
    [permSet],
  );

  const canCreate =
    name.trim().length > 0 && isEmail(email) && selected.length > 0;

  function reset() {
    setName("");
    setEmail("");
    setPermSet({
      dashboard: true,
      products: false,
      services: false,
      orders: false,
      delivery: false,
      messages: false,
      analytics: false,
      settings: false,
    });
  }

  function handleClose(v: boolean) {
    onOpenChange(v);
    if (!v) reset();
  }

  function submit() {
    if (!canCreate) {
      toast.error("Add name, valid email, and at least 1 permission.");
      return;
    }
    onCreate({ name: name.trim(), email: email.trim(), permissions: selected });
    toast.success("Controller created");
    handleClose(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Controller</DialogTitle>
          <DialogDescription>
            Create a controller with page access permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cName">Full name</Label>
              <Input
                id="cName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ayesha Khan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cEmail">Email</Label>
              <Input
                id="cEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Permissions</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PERMS.map((p) => (
                <CheckboxRow
                  key={p.key}
                  label={p.label}
                  checked={permSet[p.key]}
                  onChange={(v) => setPermSet((s) => ({ ...s, [p.key]: v }))}
                />
              ))}
            </div>
            <div
              className={cn(
                "text-xs",
                selected.length ? "text-muted-foreground" : "text-destructive",
              )}
            >
              {selected.length
                ? `${selected.length} permission(s) selected`
                : "Select at least one permission"}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#895129] hover:bg-[#7b4723]"
            disabled={!canCreate}
            onClick={submit}
          >
            Create Controller
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
