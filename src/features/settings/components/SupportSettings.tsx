import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSendSupportMessageMutation } from "@/features/settings";

export function SupportSettings() {
  const [send, { isLoading }] = useSendSupportMessageMutation();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Optional UI fields (display only; real flags usually live in user prefs endpoint)
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [smsOptIn, setSmsOptIn] = useState(false);

  const valid = subject.trim().length > 0 && message.trim().length > 0;

  async function onSubmit() {
    if (!valid) {
      toast.error("Please provide a subject and message.");
      return;
    }
    try {
      await send({ subject: subject.trim(), message: message.trim() }).unwrap();
      toast.success("Support message sent");
      setSubject("");
      setMessage("");
    } catch (e: any) {
      const msg =
        (e && typeof e === "object" && "data" in e
          ? (e as any).data?.message
          : null) ?? "Failed to send message";
      toast.error(String(msg));
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Contact support</CardTitle>
          <CardDescription>Send a message to the support team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sub">Subject</Label>
            <Input
              id="sub"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Billing issue"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="msg">Message</Label>
            <Textarea
              id="msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue..."
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              className="bg-[#895129] hover:bg-[#7b4723]"
              disabled={!valid || isLoading}
              onClick={() => void onSubmit()}
            >
              {isLoading ? "Sending…" : "Send Message"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Support info</CardTitle>
          <CardDescription>
            Quick contact channels and marketing preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-1">
            <div className="text-muted-foreground">Support email</div>
            <div className="font-medium">support@wak.app</div>
          </div>
          <div className="grid gap-1">
            <div className="text-muted-foreground">Support phone</div>
            <div className="font-medium">+1 (555) 010-9999</div>
          </div>

          <div className="h-px bg-border my-2" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Email marketing</div>
              <div className="text-muted-foreground text-xs">Opt in/out</div>
            </div>
            <Switch checked={emailOptIn} onCheckedChange={setEmailOptIn} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">SMS marketing</div>
              <div className="text-muted-foreground text-xs">Opt in/out</div>
            </div>
            <Switch checked={smsOptIn} onCheckedChange={setSmsOptIn} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
