import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
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
import { useChangePasswordMutation } from "@/services/userApi";

export function SecuritySettings() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      }).unwrap();
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
          <div className="relative">
            <Input
              id="cur"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="next">New password</Label>
            <div className="relative">
              <Input
                id="next"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
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
