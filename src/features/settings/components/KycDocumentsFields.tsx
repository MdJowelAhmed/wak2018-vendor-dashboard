import { Label } from "@/components/ui/label";
import { cn } from "@/utils/utils";

export type IdentityDocType = "nid" | "passport" | "drivingLicense";

export type KycFiles = {
  identityType: IdentityDocType | "";
  identityFile: File | null;
  businessFile: File | null;
};

export const emptyKycFiles: KycFiles = {
  identityType: "",
  identityFile: null,
  businessFile: null,
};

const ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

const IDENTITY_OPTIONS: { value: IdentityDocType; label: string }[] = [
  { value: "nid", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "drivingLicense", label: "Driving license" },
];

function isAllowedFile(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return (
    ["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(
      file.type,
    ) || ["pdf", "jpg", "jpeg", "png"].includes(ext ?? "")
  );
}

export function kycValidationError(kyc: KycFiles): string | null {
  if (kyc.identityFile && !kyc.identityType) {
    return "Select which identity document you are uploading.";
  }
  if (kyc.identityType && !kyc.identityFile) {
    return "Upload the selected identity document.";
  }
  if (kyc.identityFile && !isAllowedFile(kyc.identityFile)) {
    return "Identity document must be a PDF, JPEG, or PNG.";
  }
  if (kyc.businessFile && !isAllowedFile(kyc.businessFile)) {
    return "Business document must be a PDF, JPEG, or PNG.";
  }
  return null;
}

export function appendKycDocuments(formData: FormData, kyc: KycFiles) {
  if (kyc.identityType && kyc.identityFile) {
    formData.append(kyc.identityType, kyc.identityFile);
  }
  if (kyc.businessFile) {
    formData.append("businessDocument", kyc.businessFile);
  }
}

export function vendorVerificationLabel(profile: any): {
  label: string;
  className: string;
} | null {
  const vendor = profile?.vendor ?? {};
  const verified = Boolean(
    vendor.isVendorVerified || profile?.isVendorVerified,
  );
  const status = String(
    vendor.verificationStatus ?? profile?.verificationStatus ?? "",
  ).toLowerCase();

  if (verified || status === "approved") {
    return {
      label: "Verified",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (status === "pending") {
    return {
      label: "Verification pending",
      className: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  if (status === "rejected") {
    return {
      label: "Verification rejected",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }
  return null;
}

export function KycDocumentsFields({
  value,
  onChange,
  className,
}: {
  value: KycFiles;
  onChange: (next: KycFiles) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4", className)}>
      <div className="grid gap-2">
        <Label>Identity document</Label>
        <p className="text-muted-foreground text-xs">
          Upload one document: National ID, passport, or driving license. PDF,
          JPEG, or PNG.
        </p>
        <div className="flex flex-wrap gap-3">
          {IDENTITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-gray-800"
            >
              <input
                type="radio"
                name="identity-document"
                checked={value.identityType === option.value}
                onChange={() =>
                  onChange({
                    ...value,
                    identityType: option.value,
                    identityFile: null,
                  })
                }
              />
              {option.label}
            </label>
          ))}
        </div>
        <input
          type="file"
          accept={ACCEPT}
          disabled={!value.identityType}
          className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#895129] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#6f3f1f] disabled:opacity-60"
          onChange={(e) => {
            onChange({
              ...value,
              identityFile: e.target.files?.[0] ?? null,
            });
            e.currentTarget.value = "";
          }}
        />
        {value.identityFile ? (
          <p className="text-xs text-gray-600">{value.identityFile.name}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="businessDocument">
          Business registration / trade license
        </Label>
        <p className="text-muted-foreground text-xs">Optional. PDF, JPEG, or PNG.</p>
        <input
          id="businessDocument"
          type="file"
          accept={ACCEPT}
          className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#895129] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#6f3f1f]"
          onChange={(e) => {
            onChange({
              ...value,
              businessFile: e.target.files?.[0] ?? null,
            });
            e.currentTarget.value = "";
          }}
        />
        {value.businessFile ? (
          <p className="text-xs text-gray-600">{value.businessFile.name}</p>
        ) : null}
      </div>
    </div>
  );
}
