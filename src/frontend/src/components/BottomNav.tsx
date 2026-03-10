import { Clock, Home, MapPin, Settings, Truck } from "lucide-react";

export type Page = "home" | "track" | "history" | "rider" | "admin";

interface BottomNavProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const tabs: { id: Page; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "track", label: "Track", icon: MapPin },
  { id: "history", label: "History", icon: Clock },
  { id: "rider", label: "Rider", icon: Truck },
  { id: "admin", label: "Admin", icon: Settings },
];

export function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card border-t border-border bottom-safe z-50"
      style={{ boxShadow: "0 -4px 20px oklch(0 0 0 / 0.08)" }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = current === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={`nav.${tab.id}_link`}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 flex-1 transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-primary/10 scale-150" />
                )}
                <Icon
                  size={18}
                  className={`relative transition-transform duration-200 ${
                    isActive ? "scale-110" : ""
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-[9px] font-semibold tracking-wide ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
