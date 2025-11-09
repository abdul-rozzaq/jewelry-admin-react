import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet";
import {
  Home,
  Factory,
  ArrowLeftRight,
  Bell,
  Settings,
  Users,
  Menu,
  LogOut,
  ShoppingBag,
  Package,
  Moon,
  Sun,
  Cog,
} from "lucide-react";
import { Toaster } from "@/src/components/ui/toaster";
import { cn } from "@/src/lib/utils";
import { LanguageSwitcher } from "@/src/components/language-switcher";

import { getCurrentUser } from "@/src/lib/auth";
import type { User } from "@/src/types/user";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { darkMode, toggleTheme } = useTheme();

  const { t } = useTranslation();

  const unreadCount = 3;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const userType = user?.organization?.type;

  const navigation = [
    { name: t("Navigation.dashboard"), href: "/", icon: Home },
    { name: t("Navigation.materials"), href: "/materials", icon: Package, types: ["bank"] },
    { name: t("Navigation.inventory"), href: "/products", icon: ShoppingBag },
    { name: t("Navigation.projects"), href: "/projects", icon: Cog, types: ["bank"] },
    { name: t("Navigation.workshops"), href: "/organizations", icon: Factory, types: ["bank"] },
    { name: t("Navigation.transfers"), href: "/transactions", icon: ArrowLeftRight },
    { name: t("Navigation.users"), href: "/users", icon: Users, types: ["bank"] },
    { name: t("Navigation.processes"), href: "/processes", icon: Settings },
  ];

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const filteredNavigation = navigation.filter((item) => !item.types || (userType && item.types.includes(userType)));

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", mobile ? "w-full" : "w-64")}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b">
        <div className="h-14 w-14">
          <img src="/logo.jpg" alt="logo" />
          {/* <Gem className="h-6 w-6 text-primary" /> */}
        </div>
        <div>
          <h2 className="font-bold text-lg">FergaGold</h2>
          <p className="text-xs text-muted-foreground">
            {user && user.organization ? `${user.organization.name}(${user.organization.type})` : t("Common.loading")}{" "}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {item.href === "/dashboard/notifications" && unreadCount > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="bg-card h-full">
            <Sidebar mobile />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <div className="bg-card h-full">
                    <Sidebar mobile />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-4">
              <Button className="cursor-pointer" variant="outline" size="icon" onClick={toggleTheme}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <LanguageSwitcher />

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative" asChild>
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {/* <AvatarImage src="/admin-avatar.png" alt="Admin" /> */}
                      <AvatarFallback>FG</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username || user?.first_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator /> */}
                  <DropdownMenuItem className="text-red-600 hover:text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4 text-red-600" />
                    <span className="">{t("Auth.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {/* <motion.div key={pathname} initial={{ y: 30 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}> */}
          {<Outlet />}
          {/* </motion.div> */}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
