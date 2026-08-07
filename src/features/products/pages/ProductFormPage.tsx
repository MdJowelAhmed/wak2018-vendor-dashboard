import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  useCreateProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/features/products";
import {
  ProductForm,
  type ProductFormValues,
} from "@/features/products/components/ProductForm";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isCountrySelectionValid,
  type ServiceCountrySelection,
} from "@/components/CountryMultiSelect";
import type { Product } from "@/types/api";
import {
  readServiceLocationFromLocalStorage,
  readVendorServiceLocationFromLocalStorage,
} from "@/utils/service-provider-profile-storage";

function defaultNewProductCountrySelection(): ServiceCountrySelection {
  const vendor = readVendorServiceLocationFromLocalStorage();
  if (isCountrySelectionValid(vendor)) return vendor;
  const service = readServiceLocationFromLocalStorage();
  if (isCountrySelectionValid(service)) return service;
  return vendor;
}

type Props = { mode: "create" | "edit" };

function productToCountrySelection(p: Product): ServiceCountrySelection {
  if (p.allCountries) {
    return { mode: "multi", allCountries: true, countryCodes: [] };
  }
  const codes = p.productCountries ?? [];
  if (codes.length === 0) {
    return { mode: "multi", allCountries: true, countryCodes: [] };
  }
  if (codes.length === 1) {
    return { mode: "single", allCountries: false, countryCodes: codes };
  }
  return { mode: "multi", allCountries: false, countryCodes: codes };
}

export function ProductFormPage({ mode }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetProductQuery(id ?? "", {
    skip: mode === "create" || !id,
  });
  const [create, { isLoading: isCreating }] = useCreateProductMutation();
  const [update, { isLoading: isUpdating }] = useUpdateProductMutation();

  useEffect(() => {
    // keep any future side-effects here
  }, [data, mode]);

  const isBusy = isCreating || isUpdating;
  if (mode === "edit" && (isLoading || !id)) {
    return (
      <div className="w-full space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const initialValues: Partial<ProductFormValues> | undefined =
    mode === "edit" && data
      ? {
          name: data.name,
          category: data.category ?? "",
          countrySelection: productToCountrySelection(data),
          price: String(data.price ?? ""),
          discount: data.discount != null ? String(data.discount) : "",
          description: data.description ?? "",
          productDetails: data.productDetails ?? "",
          active: data.status === "active" || data.active === true,
          stock: String(data.stock ?? 0),
          existingImageUrls: data.imageUrls ?? [],
          newFiles: [],
          mainImageIndex: data.mainImageIndex ?? 0,
          highlights: data.highlights ?? [],
          brand: data.brand ?? "",
          weight: String(data.weight ?? 0),
          dimensions: {
            length: String(data.dimensions?.length ?? 0),
            width: String(data.dimensions?.width ?? 0),
            height: String(data.dimensions?.height ?? 0),
          },
        }
      : mode === "create"
        ? { countrySelection: defaultNewProductCountrySelection() }
        : undefined;

  return (
    <ProductForm
      mode={mode}
      isBusy={isBusy}
      initialValues={initialValues}
      onCancel={() => navigate(-1)}
      onSubmit={async (v) => {
        const formData = v.toFormData();
        try {
          if (mode === "create") {
            await create(formData).unwrap();
            toast.success("Product created");
            void navigate("/vendor/products");
            return;
          }
          if (id) {
            await update({ id, data: formData }).unwrap();
            toast.success("Product updated");
            void navigate("/vendor/products");
          }
        } catch {
          toast.error("Save failed");
        }
      }}
    />
  );
}
