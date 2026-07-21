import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserProfile } from "@/types/api";
import { useUpdateProfileMutation } from '@/services/userApi';
import {
  CountryMultiSelect,
  type ServiceCountrySelection,
} from "@/components/CountryMultiSelect";
import {
  readVendorServiceLocationFromLocalStorage,
  writeVendorServiceLocationToLocalStorage,
} from "@/utils/service-provider-profile-storage";

const VENDOR_ONBOARDING_STORAGE_KEY = "vendor_onboarding_v1";

const categoryOptions = [
  "Grocery",
  "Restaurant",
  "Fashion",
  "Electronics",
  "Beauty",
  "Home & Kitchen",
  "Kids",
  "Health",
  "Books",
  "Sports",
] as const;

const shopTypeOptions = [
  "Retail",
  "Online-only",
  "Restaurant",
  "Grocery",
  "Wholesale",
  "Other",
] as const;

function safeReadOnboarding(): Partial<Record<string, any>> | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(VENDOR_ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<Record<string, any>>;
  } catch {
    return null;
  }
}

function fullNameFromProfile(p: UserProfile | undefined) {
  const first = p?.firstName ?? "";
  const last = p?.lastName ?? "";
  return `${first} ${last}`.trim();
}

export function ProfileSettings({
  profile,
}: {
  profile: UserProfile | undefined;
}) {
  const [update, { isLoading }] = useUpdateProfileMutation();

  const onboarding = useMemo(() => safeReadOnboarding(), []);

  const initial = useMemo(
    () => ({
      businessName: String(onboarding?.businessName ?? ""),
      ownerName: String(onboarding?.ownerName ?? fullNameFromProfile(profile)),
      email: profile?.email ?? "",
      phone: String(onboarding?.phone ?? profile?.phone ?? ""),
      streetAddress: String(onboarding?.address ?? profile?.address ?? ""),
      category: Array.isArray(onboarding?.category)
        ? String(onboarding?.category?.[0] ?? "")
        : String(onboarding?.category ?? ""),
      shopType: String(onboarding?.shopType ?? ""),
      approxProductCount: String(onboarding?.productCount ?? ""),
      description: String(onboarding?.description ?? ""),
    }),
    [profile, onboarding],
  );

  const [email, setEmail] = useState(initial.email);
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [ownerName, setOwnerName] = useState(initial.ownerName);
  const [phone, setPhone] = useState(initial.phone);
  const [streetAddress, setStreetAddress] = useState(initial.streetAddress);
  const [serviceLocation, setServiceLocation] =
    useState<ServiceCountrySelection>(() =>
      readVendorServiceLocationFromLocalStorage(),
    );
  const [category, setCategory] = useState(initial.category);
  const [shopType, setShopType] = useState(initial.shopType);
  const [approxProductCount, setApproxProductCount] = useState(
    initial.approxProductCount,
  );
  const [description, setDescription] = useState(initial.description);

  useEffect(() => {
    setEmail(initial.email);
    setBusinessName(initial.businessName);
    setOwnerName(initial.ownerName);
    setPhone(initial.phone);
    setStreetAddress(initial.streetAddress);
    setCategory(initial.category);
    setShopType(initial.shopType);
    setApproxProductCount(initial.approxProductCount);
    setDescription(initial.description);
  }, [
    initial.email,
    initial.businessName,
    initial.ownerName,
    initial.phone,
    initial.streetAddress,
    initial.category,
    initial.shopType,
    initial.approxProductCount,
    initial.description,
  ]);

  useEffect(() => {
    setServiceLocation(readVendorServiceLocationFromLocalStorage());
  }, [profile?.id]);

  const canSave =
    businessName.trim().length > 0 &&
    ownerName.trim().length > 0 &&
    (!email || email.includes("@"));

  async function onSave() {
    if (!businessName.trim() || !ownerName.trim()) {
      toast.error("Please fill required fields.");
      return;
    }
    if (email && !email.includes("@")) {
      toast.error("Please use a valid email.");
      return;
    }
    try {
      // Current API supports only basic profile fields; keep business fields in UI for now.
      await update({
        fullName: ownerName.trim(),
        email: undefined, // email is readonly in this UI
        phone: phone.trim() || undefined,
        address: streetAddress.trim() || undefined,
      }).unwrap();
      writeVendorServiceLocationToLocalStorage(serviceLocation);
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Update the core business details shown to customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Wak Mart"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                readOnly
                placeholder="email@example.com"
                className="bg-muted/30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Address</CardTitle>
          <CardDescription>
            Where you operate from (used for delivery and invoices). Service
            location sets where you sell — same options as Add Product.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="streetAddress">Street Address</Label>
            <Input
              id="streetAddress"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vendor-service-location">Service Location</Label>
            <CountryMultiSelect
              id="vendor-service-location"
              value={serviceLocation}
              onChange={setServiceLocation}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Shop Details</CardTitle>
          <CardDescription>
            Help customers understand what you sell.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Shop Type</Label>
              <Select value={shopType} onValueChange={setShopType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select shop type" />
                </SelectTrigger>
                <SelectContent>
                  {shopTypeOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="approxProductCount">Approx Product Count</Label>
              <Input
                id="approxProductCount"
                value={approxProductCount}
                onChange={(e) =>
                  setApproxProductCount(e.target.value.replace(/[^\d]/g, ""))
                }
                inputMode="numeric"
                placeholder="e.g. 50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription>
            A short description that appears on your shop profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers what you sell and what makes your shop unique…"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              className="bg-[#895129] hover:bg-[#7b4723]"
              disabled={!canSave || isLoading}
              onClick={() => void onSave()}
            >
              {isLoading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
