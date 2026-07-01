import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SessionActionComposer } from "@/components/SessionActionComposer";
import { Moon, Sun, Smartphone, Monitor } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Showcase,
  head: () => ({
    meta: [
      { title: "RDX Canvas · Session Action Composer" },
      {
        name: "description",
        content:
          "High-fidelity design states for the RDX Canvas session drawer bottom composer.",
      },
      { property: "og:title", content: "RDX Canvas · Session Action Composer" },
      {
        property: "og:description",
        content: "Runtime bar + prompt composer states for Codex sessions.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

const STATES = [
  {
    id: "disconnected",
    title: "1 · Read-only Codex session",
    caption: "No runtime attached. Compact bar with one primary action + menu.",
    props: { state: "disconnected" as const },
  },
  {
    id: "tmux-detected",
    title: "2 · Detected existing tmux",
    caption: "Primary action switches to Attach; no duplicate resume.",
    props: { state: "tmux-detected" as const },
  },
  {
    id: "connecting",
    title: "3 · Resuming runtime",
    caption: "Inline progress with cancel. No modal, no full-width blue button.",
    props: { state: "connecting" as const },
  },
  {
    id: "ready",
    title: "4 · Runtime ready",
    caption: "Runtime bar collapses to a status pill; composer takes focus.",
    props: { state: "ready" as const },
  },
  {
    id: "busy",
    title: "5 · Generating",
    caption: "Send button becomes Stop. Composer stays enabled to queue thoughts.",
    props: { state: "busy" as const },
  },
  {
    id: "error",
    title: "6 · Runtime lost / resume failed",
    caption: "Inline destructive alert with a scoped retry — no yellow card.",
    props: { state: "error" as const },
  },
  {
    id: "new-session",
    title: "7 · Start new Codex session",
    caption: "Same bar shape, different primary — chosen via menu.",
    props: { state: "new-session" as const },
  },
];

function Showcase() {
  const [dark, setDark] = useState(false);
  const [mobile, setMobile] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background font-mono text-[11px] font-bold">
                RDX
              </div>
              <div>
                <h1 className="text-[14px] font-semibold leading-tight">
                  Session Action Composer
                </h1>
                <p className="text-[11.5px] text-muted-foreground">
                  Drawer bottom · Codex runtime & prompt
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Toggle
                on={mobile}
                onClick={() => setMobile(!mobile)}
                icon={mobile ? Smartphone : Monitor}
                label={mobile ? "Mobile" : "Desktop"}
              />
              <Toggle
                on={dark}
                onClick={() => setDark(!dark)}
                icon={dark ? Moon : Sun}
                label={dark ? "Dark" : "Light"}
              />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">
          <section className="mb-10 max-w-2xl">
            <h2 className="text-[22px] font-semibold tracking-tight">
              One composer. Every runtime state.
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              A single Runtime Bar + Prompt Composer replaces the yellow warning card,
              the resume-command block, and the isolated input. One primary action,
              secondary paths in a menu, manual CLI tucked into Advanced details.
            </p>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            {STATES.map((s) => (
              <StateCard key={s.id} title={s.title} caption={s.caption} mobile={mobile}>
                <SessionActionComposer {...s.props} />
              </StateCard>
            ))}
          </div>

          <section className="mt-16">
            <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              In context · session drawer preview
            </h3>
            <DrawerPreview />
          </section>

          <footer className="mt-16 border-t border-border pt-6 text-[12px] text-muted-foreground">
            Designed for React + Radix Themes. Ships as a plain component: no
            complex animations, no non-standard shapes. Every action is one click.
          </footer>
        </main>
      </div>
    </div>
  );
}

function Toggle({
  on,
  onClick,
  icon: Icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function StateCard({
  title,
  caption,
  children,
  mobile,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
  mobile: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div className="mb-2.5">
        <h3 className="text-[13.5px] font-semibold text-foreground">{title}</h3>
        <p className="text-[12px] text-muted-foreground">{caption}</p>
      </div>
      <div className="rounded-xl border border-border bg-surface-sunken p-4">
        <div
          className={
            mobile
              ? "mx-auto w-[360px] max-w-full rounded-lg border border-border bg-surface p-2.5 shadow-sm"
              : "rounded-lg border border-border bg-surface p-3 shadow-sm"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function DrawerPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-sunken shadow-sm">
      {/* Fake canvas backdrop */}
      <div
        className="relative h-[560px]"
        style={{
          backgroundImage:
            "radial-gradient(oklch(0.85 0.005 260) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        {/* Drawer */}
        <div className="absolute inset-x-6 bottom-4 top-6 flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="status-dot bg-dot-ready" />
              <span className="text-[13px] font-semibold">Ai-Rdx-Lab</span>
              <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                CODEX
              </span>
              <span className="rounded bg-accent px-1.5 py-0.5 text-[10.5px] text-muted-foreground">
                LIVE
              </span>
            </div>
            <button className="rounded p-1 text-muted-foreground hover:bg-accent">
              ✕
            </button>
          </div>

          {/* Fake transcript */}
          <div className="flex-1 space-y-4 overflow-hidden px-4 py-4 text-[13px]">
            <Bubble
              role="assistant"
              text="已重启并确认运行：前端 http://127.0.0.1:5177/ · 后端 http://127.0.0.1:8765/api/health · 后端健康检查正常"
            />
            <Bubble role="user" text="本地服务都是启动状态的吗？还是你要重启下，我想手动验证下" />
            <Bubble role="assistant" text="Runtime 已连接。你可以直接在下面输入 Prompt，不需要复制命令。" />
          </div>

          {/* Composer at bottom */}
          <div className="border-t border-border bg-surface-sunken px-4 pb-3 pt-2.5">
            <SessionActionComposer state="ready" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[75%] rounded-2xl px-3.5 py-2 leading-relaxed",
          isUser
            ? "bg-accent text-foreground"
            : "bg-transparent text-foreground/85",
        ].join(" ")}
      >
        {text}
      </div>
    </div>
  );
}
