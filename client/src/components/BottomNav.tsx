import { Link, useLocation } from "wouter";
import { Compass, Heart, User, Building2, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const isOrganization = user?.accountType === "organization";

  const navItems = isOrganization
    ? [
        { icon: Compass, label: "Discover", path: "/", testId: "nav-discover" },
        { icon: Building2, label: "Manage", path: "/manage", testId: "nav-manage" },
        { icon: PlusCircle, label: "Create", path: "/create", testId: "nav-create" },
        { icon: User, label: "Profile", path: "/profile", testId: "nav-profile" },
      ]
    : [
        { icon: Compass, label: "Discover", path: "/", testId: "nav-discover" },
        { icon: Heart, label: "My Opportunities", path: "/my-opportunities", testId: "nav-my-opportunities" },
        { icon: User, label: "Profile", path: "/profile", testId: "nav-profile" },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                data-testid={item.testId}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors min-w-[4rem] ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover-elevate active-elevate-2"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
