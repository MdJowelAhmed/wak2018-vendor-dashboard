import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChatLayout({
  sidebar,
  window,
}: {
  sidebar: ReactNode;
  window: ReactNode;
}) {
  return (
    <div className="grid min-h-[560px] gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Conversations</CardTitle>
        </CardHeader>
        <CardContent>{sidebar}</CardContent>
      </Card>

      <Card className="flex min-h-0 flex-col lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
          {window}
        </CardContent>
      </Card>
    </div>
  );
}
