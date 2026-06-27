import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, ClipboardCheck, FileText, LogOut, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const adminLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/cuestionario", icon: ClipboardCheck, label: "Cuestionario" },
];

const empresaLinks = [
  { to: "/empresa/mis-diagnosticos", icon: FileText, label: "Mis Diagnósticos" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links = user?.role === "admin" ? adminLinks : empresaLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-primary text-primary-foreground flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <BookOpen className="h-6 w-6 shrink-0" />
        {!collapsed && (
          <span className="font-semibold text-sm truncate">Ley 1581</span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )
            }
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-2 space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-2 text-xs text-white/50 truncate">
            {user.nombre}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
