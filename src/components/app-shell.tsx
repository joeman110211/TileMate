import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Briefcase, Settings, UserRound } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { fetchUpdateFeed, isUpdateDue } from "@/lib/market";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Jobs", icon: Briefcase },
  { to: "/advice", label: "Advice", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const business = useStore((s) => s.business);
  const setRates = useStore((s) => s.setRates);
  const setUpdateMeta = useStore((s) => s.setUpdateMeta);

  useEffect(() => {
    const { updateMeta } = useStore.getState();
    if (!isUpdateDue(updateMeta.lastCheckedAt)) return;
    let cancelled = false;
    void fetchUpdateFeed(business.updateFeedUrl).then((feed) => {
      if (cancelled) return;
      if (feed.rates) setRates(feed.rates);
      setUpdateMeta({ lastCheckedAt: Date.now(), lastAppliedAt: Date.parse(feed.publishedAt) || Date.now(), sourceStatus: "fresh", latestNote: feed.summary });
    }).catch((error: unknown) => {
      if (cancelled) return;
      setUpdateMeta({ lastCheckedAt: Date.now(), sourceStatus: "error", latestNote: error instanceof Error ? error.message : "Update check failed." });
    });
    return () => { cancelled = true; };
  }, [business.updateFeedUrl, setRates, setUpdateMeta]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="no-print fixed inset-y-0 left-0 hidden w-56 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="px-5 pt-6 pb-5">
          <Link to="/" className="block">
            <p className="font-display text-2xl tracking-tight text-sidebar-foreground">TileMate</p>
            <p className="mt-1 text-xs text-sidebar-muted">Measure · quote · book</p>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" || pathname.startsWith("/job") : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-foreground/10",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <p className="px-5 py-4 text-xs text-sidebar-muted">Built for wall and floor tilers</p>
      </aside>

      <div className="md:pl-56">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <Link to="/" className="font-display text-xl">
            TileMate
          </Link>
        </header>
        <div className="pb-20 md:pb-0">{children}</div>
      </div>

      <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-card md:hidden">
        {NAV.map((item) => {
          const active = item.to === "/" ? pathname === "/" || pathname.startsWith("/job") : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
