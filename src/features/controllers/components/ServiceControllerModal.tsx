import { useEffect, useMemo, useState } from "react";
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

export type ServiceControllerPermission =
  | "dashboard"
  | "services"
  | "bookings"
  | "customers"
  | "earnings"
  | "analytics"
  | "messages"
  | "settings";

export type ServiceControllerRecord = {
  id: string;
  name: string;
  email: string;
  permissions: ServiceControllerPermission[];
};

const PERMS: Array<{ key: ServiceControllerPermission; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "services", label: "Services" },
  { key: "bookings", label: "Bookings" },
  { key: "customers", label: "Customers" },
  { key: "earnings", label: "Earnings" },
  { key: "analytics", label: "Analytics" },
  { key: "messages", label: "Messages" },
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

export function ServiceControllerModal({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  initial?: ServiceControllerRecord | null;
  onSubmit: (payload: {
    name: string;
    email: string;
    permissions: ServiceControllerPermission[];
  }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [permSet, setPermSet] = useState<
    Record<ServiceControllerPermission, boolean>
  >(() => ({
    dashboard: true,
    services: false,
    bookings: false,
    customers: false,
    earnings: false,
    analytics: false,
    messages: false,
    settings: false,
  }));

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setName(initial.name);
      setEmail(initial.email);
      setPermSet({
        dashboard: initial.permissions.includes("dashboard"),
        services: initial.permissions.includes("services"),
        bookings: initial.permissions.includes("bookings"),
        customers: initial.permissions.includes("customers"),
        earnings: initial.permissions.includes("earnings"),
        analytics: initial.permissions.includes("analytics"),
        messages: initial.permissions.includes("messages"),
        settings: initial.permissions.includes("settings"),
      });
      return;
    }
    // create
    setName("");
    setEmail("");
    setPermSet({
      dashboard: true,
      services: false,
      bookings: false,
      customers: false,
      earnings: false,
      analytics: false,
      messages: false,
      settings: false,
    });
  }, [open, mode, initial]);

  const selected = useMemo(
    () => PERMS.filter((p) => permSet[p.key]).map((p) => p.key),
    [permSet],
  );
  const canSubmit =
    name.trim().length > 0 && isEmail(email) && selected.length > 0;

  function submit() {
    if (!canSubmit) {
      toast.error("Add name, valid email, and at least 1 permission.");
      return;
    }
    onSubmit({ name: name.trim(), email: email.trim(), permissions: selected });
    toast.success(
      mode === "edit" ? "Controller updated" : "Controller created",
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Controller" : "Add Controller"}
          </DialogTitle>
          <DialogDescription>
            Create a controller with page access permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="scName">Full name</Label>
              <Input
                id="scName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ayesha Khan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scEmail">Email</Label>
              <Input
                id="scEmail"
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
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#895129] hover:bg-[#7b4723]"
            disabled={!canSubmit}
            onClick={submit}
          >
            {mode === "edit" ? "Save Changes" : "Create Controller"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
