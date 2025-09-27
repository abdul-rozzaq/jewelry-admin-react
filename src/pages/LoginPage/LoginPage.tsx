import type React from "react";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Lock, User } from "lucide-react";
import authApi, { useLoginMutation } from "@/src/lib/service/authApi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t: tAuth } = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveToLocalStorage = (data: { access: string; refresh: string; user: any }) => {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login(formData).unwrap();

      if (result && result.access) {
        saveToLocalStorage(result);
        navigate("/");
        dispatch(authApi.util.resetApiState());
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      if (typeof err === "object" && err !== null && "data" in err) {
        setError((err.data as any).message || "Noto'g'ri username yoki parol");
      } else {
        setError("Tizimga kirishda xatolik yuz berdi");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-1 bg-primary/10 ">
              <img src="/logo.jpg" alt="logo" className="w-[80px] h-[80px]" />

              {/* <Gem className="h-8 w-8 text-primary" /> */}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{tAuth("Auth.loginTitle")}</CardTitle>
          <CardDescription>{tAuth("Auth.loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off" method="post">
            <div className="space-y-2">
              <Label htmlFor="username">{tAuth("Auth.username")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 placeholder:text-gray-400"
                  placeholder="abdurazzoq"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{tAuth("Auth.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 placeholder:text-gray-400"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? tAuth("Auth.loggingIn") : tAuth("Auth.login")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
