import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Delivery } from "@/types/api";
import { InternationalDeliveryList } from "./InternationalDeliveryList";
import { LocalDeliveryList } from "./LocalDeliveryList";

export function DeliveryTabs({
  local,
  international,
  isDriver,
  value,
  onValueChange,
  onViewDetails,
  onAccept,
  onReject,
  onStep,
  busy,
}: {
  local: Delivery[];
  international: Delivery[];
  isDriver: boolean;
  value: "local" | "international";
  onValueChange: (v: "local" | "international") => void;
  onViewDetails: (d: Delivery) => void;
  onAccept: (d: Delivery) => void;
  onReject: (d: Delivery) => void;
  onStep: (d: Delivery) => void;
  busy?: boolean;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as "local" | "international")}
      className="w-full"
    >
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="local" className="min-w-[10rem]">
          Local Delivery
        </TabsTrigger>
        <TabsTrigger value="international" className="min-w-[12rem]">
          International Delivery
        </TabsTrigger>
      </TabsList>

      <TabsContent value="local" className="mt-4">
        <LocalDeliveryList
          deliveries={local}
          isDriver={isDriver}
          onViewDetails={onViewDetails}
          onAccept={onAccept}
          onReject={onReject}
          onStep={onStep}
          busy={busy}
        />
      </TabsContent>
      <TabsContent value="international" className="mt-4">
        <InternationalDeliveryList
          deliveries={international}
          onViewDetails={onViewDetails}
        />
      </TabsContent>
    </Tabs>
  );
}
