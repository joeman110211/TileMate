import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { GUIDES } from "@/lib/tiling/guides";

export const Route = createFileRoute("/advice")({ component: AdvicePage });

export function AdvicePage() {
  const cats = Array.from(new Set(GUIDES.map((g) => g.category)));
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Advice</h1>
        <p className="mt-2 text-muted-foreground">
          Short, practical notes for bathrooms, kitchens, wet rooms and setting out. Photo advice lives on each job
          under Site.
        </p>
        <div className="mt-8 space-y-10">
          {cats.map((cat) => (
            <section key={cat}>
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{cat}</h2>
              <div className="mt-3 space-y-3">
                {GUIDES.filter((g) => g.category === cat).map((g) => (
                  <article key={g.id} className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
                    <h3 className="font-display text-xl">{g.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{g.summary}</p>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
                      {g.body.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
