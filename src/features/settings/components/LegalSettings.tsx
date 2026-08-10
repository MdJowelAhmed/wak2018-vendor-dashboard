import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetPrivacyQuery, useGetTermsQuery } from "@/features/settings";

function Doc({
  title,
  content,
  updatedAt,
}: {
  title: string;
  content: string;
  updatedAt?: string;
}) {
  return (
    <Card className="rounded-xl border-border/60 shadow-sm w-full">
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {updatedAt
            ? `Last updated ${new Date(updatedAt).toLocaleDateString()}`
            : "View-only (managed by Admin)."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[68vh] rounded-lg border border-border/60 p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-6">
            {content}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function LegalSettings() {
  const termsQ = useGetTermsQuery();
  const privacyQ = useGetPrivacyQuery();

  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("terms")}
          className={[
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            activeTab === "terms"
              ? "bg-[#895129] text-white"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200",
          ].join(" ")}
        >
          Terms &amp; Conditions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("privacy")}
          className={[
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            activeTab === "privacy"
              ? "bg-[#895129] text-white"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200",
          ].join(" ")}
        >
          Privacy Policy
        </button>
      </div>

      <div className="w-full">
        {activeTab === "terms" ? (
          termsQ.isLoading ? (
            <Skeleton className="h-[520px] w-full rounded-xl" />
          ) : termsQ.isError ? (
            <Card className="rounded-xl border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Terms &amp; Conditions</CardTitle>
                <CardDescription className="text-destructive">
                  Failed to load.
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ) : (
            <Doc
              title="Terms & Conditions"
              content={termsQ.data?.content ?? ""}
              updatedAt={termsQ.data?.updatedAt}
            />
          )
        ) : privacyQ.isLoading ? (
          <Skeleton className="h-[520px] w-full rounded-xl" />
        ) : privacyQ.isError ? (
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription className="text-destructive">
                Failed to load.
              </CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ) : (
          <Doc
            title="Privacy Policy"
            content={privacyQ.data?.content ?? ""}
            updatedAt={privacyQ.data?.updatedAt}
          />
        )}
      </div>
    </div>
  );
}
