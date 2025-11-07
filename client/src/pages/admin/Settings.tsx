import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Settings() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get stored password (default is admin123)
    const storedPassword = localStorage.getItem("adminPassword") || "admin123";

    // Validate current password
    if (currentPassword !== storedPassword) {
      toast({
        title: "Error",
        description: "Current password is incorrect",
        variant: "destructive",
      });
      return;
    }

    // Validate new passwords match
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Validate new password is not empty
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    // Save new password
    localStorage.setItem("adminPassword", newPassword);

    // Clear form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    toast({
      title: "Success",
      description: "Password changed successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold font-display">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your admin account settings
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your admin panel password. You'll need to enter your current password to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                data-testid="input-current-password"
                required
              />
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    data-testid="input-new-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    data-testid="button-toggle-new-password"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter new password again"
                    data-testid="input-confirm-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" size="lg" data-testid="button-save-password">
                <Save className="w-4 h-4 mr-2" />
                Save New Password
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Password Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Minimum 6 characters</li>
                <li>Both new password fields must match</li>
                <li>Must enter current password correctly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
