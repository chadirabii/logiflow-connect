import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NotificationPanel } from "@/components/NotificationPanel";

const managerNav = [
  { label: "Tableau de bord", icon: LayoutDashboard, path: "/manager" },
  { label: "Réclamations", icon: AlertTriangle, path: "/manager/reclamations" },
  { label: "Messagerie", icon: MessageSquare, path: "/manager/chat" },
  { label: "Commandes Historiques", icon: History, path: "/manager/legacy-orders" },
  { label: "Statistiques", icon: BarChart3, path: "/manager/stats" },
];

export function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex-shrink-0",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <img
            src="/logo-24-7-logistics.png"
            alt="24/7 Logistics"
            className="h-7 w-7 flex-shrink-0"
          />
          {!collapsed && (
            <div>
              <span className="font-heading font-bold text-lg">
                24/7 Logistics
              </span>
              <span className="block text-xs text-sidebar-foreground/60">
                Manager
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {managerNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "hover:bg-sidebar-accent/50",
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 w-full"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Réduire</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 w-full"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-foreground">
            {managerNav.find((n) => n.path === location.pathname)?.label ||
              "Manager"}
          </h2>
          <div className="flex items-center gap-3">
            <NotificationPanel />
            <span className="text-sm text-muted-foreground">
              {user?.fullName}
            </span>
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-semibold">
              M
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
