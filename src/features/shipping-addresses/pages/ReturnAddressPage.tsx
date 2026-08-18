import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Building2,
  Phone,
  User,
  Globe,
  Navigation,
  CheckCircle2,
  Trash2,
  Pencil,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetShippingAddressesQuery,
  useCreateShippingAddressMutation,
  useUpdateShippingAddressMutation,
  useDeleteShippingAddressMutation,
} from "../services/shippingAddressApi";
import type { ShippingAddressPayload } from "../types/shippingAddressTypes";

export function ReturnAddressPage() {
  const { data: addressResponse, isLoading, isFetching } =
    useGetShippingAddressesQuery();
  const [createAddress, { isLoading: isCreating }] =
    useCreateShippingAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] =
    useUpdateShippingAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] =
    useDeleteShippingAddressMutation();

  // Pick the first address if existing (since vendor is allowed only 1 return address)
  const existingAddress = addressResponse?.data?.[0];
  const hasExistingAddress = Boolean(existingAddress?._id);

  const [formData, setFormData] = useState<ShippingAddressPayload>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Bangladesh",
    countryCode: "+880",
    postalCode: "",
    isDefault: true, // Always true behind the scenes
    latitude: 23.7465,
    longitude: 90.3760,
  });

  // Populate form state when existing address loads
  useEffect(() => {
    if (existingAddress) {
      setFormData({
        fullName: existingAddress.fullName || "",
        phone: existingAddress.phone || "",
        address: existingAddress.address || "",
        city: existingAddress.city || "",
        state: existingAddress.state || "",
        country: existingAddress.country || "Bangladesh",
        countryCode: existingAddress.countryCode || "",
        postalCode: existingAddress.postalCode || "",
        isDefault: true, // behind the scenes true
        latitude: existingAddress.latitude ?? 23.7465,
        longitude: existingAddress.longitude ?? 90.3760,
      });
    }
  }, [existingAddress]);

  const handleChange = (field: keyof ShippingAddressPayload, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Street address is required");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!formData.postalCode.trim()) {
      toast.error("Postal code is required");
      return;
    }

    const payload: ShippingAddressPayload = {
      ...formData,
      isDefault: true, // Ensure isDefault is ALWAYS true behind the scenes
      latitude: formData.latitude ? Number(formData.latitude) : 0,
      longitude: formData.longitude ? Number(formData.longitude) : 0,
    };

    try {
      if (hasExistingAddress && existingAddress?._id) {
        await updateAddress({
          id: existingAddress._id,
          data: payload,
        }).unwrap();
        toast.success("Return address updated successfully!");
      } else {
        await createAddress(payload).unwrap();
        toast.success("Return address added successfully!");
      }
    } catch (err: any) {
      const errorMsg =
        err?.data?.message || err?.message || "Failed to save return address";
      toast.error(errorMsg);
    }
  };

  const handleDelete = async () => {
    if (!existingAddress?._id) return;
    if (!confirm("Are you sure you want to delete this return address?")) return;

    try {
      await deleteAddress(existingAddress._id).unwrap();
      toast.success("Return address deleted successfully!");
      setFormData({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "Bangladesh",
        countryCode: "+880",
        postalCode: "",
        isDefault: true,
        latitude: 23.7465,
        longitude: 90.3760,
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete return address");
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Add Return Address
            </h1>
            {hasExistingAddress && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="size-3.5 mr-1" /> Configured
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage your store&apos;s return shipping address for order returns and customer exchanges.
          </p>
        </div>
      </div>

      {/* Info notice if vendor already created address */}
      {hasExistingAddress && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-blue-900 flex items-start gap-3 text-sm">
          <Building2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Return Address Registered</span>
            <p className="text-blue-700 mt-0.5 text-xs">
              As a vendor, you can maintain one primary return address. You can update your existing details below.
            </p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <Card className="border-gray-200/80 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b bg-gray-50/50 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                {hasExistingAddress ? "Edit Return Address" : "New Return Address Details"}
              </CardTitle>
            </div>
            {hasExistingAddress && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="size-3.5 animate-spin mr-1" />
                ) : (
                  <Trash2 className="size-3.5 mr-1" />
                )}
                Delete Address
              </Button>
            )}
          </div>
          <CardDescription className="text-xs text-gray-500">
            Please fill in the exact pickup & return details for your package returns.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact Person Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <User className="size-3.5 text-gray-500" /> Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Md Abdus Salam Suhag"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-gray-500" /> Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="e.g. +8801712345678"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Building2 className="size-3.5 text-gray-500" /> Street Address / Detailed Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                placeholder="e.g. House 12, Road 5, Dhanmondi"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
              />
            </div>

            {/* City, State, Country */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold text-gray-700">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="e.g. Dhaka"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-semibold text-gray-700">
                  State / Division
                </Label>
                <Input
                  id="state"
                  placeholder="e.g. Dhaka"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Globe className="size-3.5 text-gray-500" /> Country
                </Label>
                <Input
                  id="country"
                  placeholder="e.g. Bangladesh"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
              </div>
            </div>

            {/* Country Code & Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="countryCode" className="text-xs font-semibold text-gray-700">
                  Country Code
                </Label>
                <Input
                  id="countryCode"
                  placeholder="e.g. +880 or BD"
                  value={formData.countryCode}
                  onChange={(e) => handleChange("countryCode", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="postalCode" className="text-xs font-semibold text-gray-700">
                  Postal Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postalCode"
                  placeholder="e.g. 1209"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Coordinates (Latitude / Longitude) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div className="space-y-1.5">
                <Label htmlFor="latitude" className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Navigation className="size-3.5 text-gray-500" /> Latitude
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 23.7465"
                  value={formData.latitude ?? ""}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="longitude" className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Navigation className="size-3.5 text-gray-500" /> Longitude
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 90.3760"
                  value={formData.longitude ?? ""}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                />
              </div>
            </div>

            {/* Note: isDefault is NOT displayed in UI as per requirement, set to true behind the scenes */}

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="px-6 font-medium"
              >
                {isCreating || isUpdating ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : hasExistingAddress ? (
                  <>
                    <Pencil className="size-4 mr-2" />
                    Update Return Address
                  </>
                ) : (
                  <>
                    <PlusCircle className="size-4 mr-2" />
                    Save Return Address
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
