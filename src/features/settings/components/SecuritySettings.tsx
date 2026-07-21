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
import { Button } from "@/components/ui/button";
import { useChangePasswordMutation } from '@/services/userApi';

export function SecuritySettings() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const valid =
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    confirmPassword.length >= 6 &&
    newPassword === confirmPassword;

  async function onSubmit() {
    if (!valid) {
      toast.error(
        "Check current password and ensure new passwords match (min 6).",
      );
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      const msg =
        (e && typeof e === "object" && "data" in e
          ? (e as any).data?.message
          : null) ?? "Could not update password";
      toast.error(String(msg));
    }
  }

  return (
    <Card className="rounded-xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          For security, choose a strong password you don’t reuse elsewhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="cur">Current password</Label>
          <Input
            id="cur"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="next">New password</Label>
            <Input
              id="next"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            className="bg-[#895129] hover:bg-[#7b4723]"
            disabled={!valid || isLoading}
            onClick={() => void onSubmit()}
          >
            {isLoading ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
