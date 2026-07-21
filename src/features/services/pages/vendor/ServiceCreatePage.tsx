import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useCreateServiceMutation } from "@/features/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RootState } from "@/app/store";
import { useGetProfileQuery } from "@/features/auth";
import { ServiceFormPage } from "@/features/services/pages/vendor/ServiceFormPage";
import type { UserRole } from "@/features/auth";

type PkgState = {
  name: "basic" | "standard" | "premium";
  price: number;
  deliveryTimeDays: number;
  description: string;
};

const emptyPkg = (name: PkgState["name"]): PkgState => ({
  name,
  price: 0,
  deliveryTimeDays: 1,
  description: "",
});

export function ServiceCreatePage() {
  const authRole: UserRole | undefined = useSelector(
    (s: RootState) => s.auth.user?.role,
  );
  const { data: profile } = useGetProfileQuery();
  const role: UserRole | null = authRole ?? profile?.role ?? null;
  if (role === "service") {
    return <ServiceFormPage mode="create" />;
  }

  const navigate = useNavigate();
  const [submit, { isLoading }] = useCreateServiceMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basic, setBasic] = useState(emptyPkg("basic"));
  const [standard, setStandard] = useState(emptyPkg("standard"));
  const [premium, setPremium] = useState(emptyPkg("premium"));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submit({
        title: title.trim(),
        description: description.trim(),
        packages: {
          basic: {
            name: "basic" as const,
            price: Number(basic.price),
            deliveryTimeDays: Math.max(
              0,
              Math.floor(Number(basic.deliveryTimeDays)),
            ),
            description: basic.description,
          },
          standard: {
            name: "standard" as const,
            price: Number(standard.price),
            deliveryTimeDays: Math.max(
              0,
              Math.floor(Number(standard.deliveryTimeDays)),
            ),
            description: standard.description,
          },
          premium: {
            name: "premium" as const,
            price: Number(premium.price),
            deliveryTimeDays: Math.max(
              0,
              Math.floor(Number(premium.deliveryTimeDays)),
            ),
            description: premium.description,
          },
        },
      }).unwrap();
      toast.success("Service created");
      void navigate("/vendor/services");
    } catch {
      toast.error("Could not create service");
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Create service</h1>
        <p className="text-muted-foreground">
          Add Basic, Standard, and Premium with price and delivery time.
        </p>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <PackageCard label="Basic" value={basic} onChange={setBasic} />
          <PackageCard
            label="Standard"
            value={standard}
            onChange={setStandard}
          />
          <PackageCard label="Premium" value={premium} onChange={setPremium} />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving…" : "Create service"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function PackageCard({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PkgState;
  onChange: (n: PkgState) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1.5">
          <Label>Price (USD)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={value.price}
            onChange={(e) =>
              onChange({ ...value, price: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Delivery time (days)</Label>
          <Input
            type="number"
            min={0}
            value={value.deliveryTimeDays}
            onChange={(e) =>
              onChange({ ...value, deliveryTimeDays: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Package notes</Label>
          <Textarea
            rows={3}
            value={value.description ?? ""}
            onChange={(e) =>
              onChange({ ...value, description: e.target.value })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
