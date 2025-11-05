import { LayoutDashboard, CheckSquare, Users, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "My Tasks",
      icon: CheckSquare,
      href: "/my-tasks",
    },
    {
      title: "Team",
      icon: Users,
      href: "/team",
    },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">TaskFlow</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "hover:bg-sidebar-accent/50"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Coming Soon</span>
          </div>
          <p className="text-xs text-sidebar-foreground/70">
            AI Task Helper will suggest smart task assignments and deadlines
          </p>
        </div>
      </div>
    </aside>
  );
}
