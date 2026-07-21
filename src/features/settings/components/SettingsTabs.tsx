import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type SettingsTabKey = "profile" | "security" | "legal" | "support";

export function SettingsTabs({
  defaultValue = "profile",
  profile,
  security,
  legal,
  support,
}: {
  defaultValue?: SettingsTabKey;
  profile: React.ReactNode;
  security: React.ReactNode;
  legal: React.ReactNode;
  support: React.ReactNode;
}) {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="profile" className="min-w-[8rem]">
          Profile
        </TabsTrigger>
        <TabsTrigger value="security" className="min-w-[8rem]">
          Security
        </TabsTrigger>
        <TabsTrigger value="legal" className="min-w-[8rem]">
          Legal
        </TabsTrigger>
        <TabsTrigger value="support" className="min-w-[8rem]">
          Support
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-4">
        {profile}
      </TabsContent>
      <TabsContent value="security" className="mt-4">
        {security}
      </TabsContent>
      <TabsContent value="legal" className="mt-4">
        {legal}
      </TabsContent>
      <TabsContent value="support" className="mt-4">
        {support}
      </TabsContent>
    </Tabs>
  );
}
