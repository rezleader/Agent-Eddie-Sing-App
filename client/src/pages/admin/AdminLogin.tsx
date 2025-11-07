import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft } from "lucide-react";

interface AdminLoginProps {
  onLogin: (password: string) => void;
  onBack?: () => void;
  error?: string;
}

export function AdminLogin({ onLogin, onBack, error }: AdminLoginProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            data-testid="button-back-to-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        )}

        <Card className="shadow-xl border-2">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-display">Admin Access</CardTitle>
            <CardDescription>
              Enter the admin password to access the control panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-admin-password"
                  autoFocus
                />
              </div>

              {error && (
                <div 
                  className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                  data-testid="text-error"
                >
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                data-testid="button-login"
              >
                <Shield className="w-4 h-4 mr-2" />
                Login to Admin Panel
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground text-center">
                American Split AI Admin Panel
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
