import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Plus,
  Square,
  Terminal,
  AlertCircle,
  RotateCw,
  X,
  Link2,
  Sparkles,
} from "lucide-react";

type RuntimeState =
  | "disconnected"
  | "tmux-detected"
  | "connecting"
  | "ready"
  | "busy"
  | "error"
  | "new-session";

interface ComposerProps {
  state: RuntimeState;
  sessionId?: string;
  workspace?: string;
  tmuxName?: string;
  errorMessage?: string;
}

const MODEL_LABEL = "codex · gpt-5-high";

export function SessionActionComposer({
  state,
  sessionId = "019ec12c…16e26",
  workspace = "~/code/ai-rdx-lab",
  tmuxName = "rdx-codex-3",
  errorMessage = "Runtime lost. tmux pane closed unexpectedly.",
}: ComposerProps) {
  const [advanced, setAdvanced] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [text, setText] = useState(
    state === "busy" ? "Refactor the retry loop with exponential backoff" : "",
  );
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [text]);

  useEffect(() => {
    const onDoc = () => setMenuOpen(false);
    if (menuOpen) window.addEventListener("click", onDoc);
    return () => window.removeEventListener("click", onDoc);
  }, [menuOpen]);

  const runtimeConnected = state === "ready" || state === "busy";
  const composerDisabled = !runtimeConnected;
  const canSend = text.trim().length > 0 && state === "ready";
  const showStop = state === "busy";

  return (
    <div className="w-full">
      {/* Runtime bar */}
      <RuntimeBar
        state={state}
        sessionId={sessionId}
        workspace={workspace}
        tmuxName={tmuxName}
        errorMessage={errorMessage}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        advanced={advanced}
        setAdvanced={setAdvanced}
      />

      {/* Advanced / CLI details */}
      {advanced && (
        <div className="mt-2 rounded-lg border border-border bg-surface-sunken px-3 py-2.5 text-[12px]">
          <div className="mb-1.5 flex items-center justify-between text-muted-foreground">
            <span className="font-medium">Advanced · manual CLI</span>
            <button
              onClick={() => setAdvanced(false)}
              className="rounded p-0.5 hover:bg-accent"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <pre className="overflow-x-auto rounded bg-background px-2.5 py-2 font-mono text-[12px] leading-relaxed text-foreground/80">
{`cd ${workspace} && \\
  tmux new -s ${tmuxName} 'codex resume ${sessionId}'`}
          </pre>
        </div>
      )}

      {/* Prompt composer — ChatGPT-style pill */}
      <div
        className={[
          "mt-2 flex items-center gap-1 rounded-full border bg-composer px-2 py-1.5 transition-colors",
          composerDisabled
            ? "border-composer-border/70 opacity-80"
            : "border-composer-border shadow-[var(--shadow-composer)] focus-within:border-foreground/25",
        ].join(" ")}
      >
        <button
          type="button"
          disabled={composerDisabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Attach"
        >
          <Plus className="h-5 w-5" />
        </button>

        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={composerDisabled}
          placeholder={
            composerDisabled
              ? state === "connecting"
                ? "Runtime is starting…"
                : "Resume or attach a runtime to send prompts"
              : "Ask anything"
          }
          className="min-h-[28px] max-h-[200px] flex-1 resize-none self-center border-0 bg-transparent px-2 py-1.5 text-[15px] leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
        />

        <button
          type="button"
          disabled={composerDisabled}
          className="hidden h-8 shrink-0 items-center gap-0.5 rounded-full px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 sm:inline-flex"
        >
          High
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          disabled={composerDisabled}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 sm:flex"
          aria-label="Voice input"
        >
          <Mic className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={!canSend && !showStop}
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
            showStop || canSend
              ? "bg-foreground text-background hover:opacity-90"
              : "bg-foreground/85 text-background",
          ].join(" ")}
          aria-label={showStop ? "Stop" : "Send"}
        >
          {showStop ? (
            <Square className="h-3.5 w-3.5 fill-current" />
          ) : (
            <AudioLines className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Helper row — meta label tags + shortcut hints */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        <MetaTag tone="neutral">codex</MetaTag>
        <MetaTag tone="neutral">gpt-5-high</MetaTag>
        {(state === "ready" || state === "busy") && (
          <MetaTag tone="success">tmux · {tmuxName}</MetaTag>
        )}
        {state === "connecting" && <MetaTag tone="warning">starting…</MetaTag>}
        {state === "error" && <MetaTag tone="danger">runtime lost</MetaTag>}
        {composerDisabled && state !== "connecting" && state !== "error" && (
          <MetaTag tone="neutral">read-only</MetaTag>
        )}
        <span className="ml-auto hidden sm:inline">
          <kbd className="rounded border border-border bg-background px-1 py-px font-mono text-[10px]">
            Enter
          </kbd>{" "}
          send ·{" "}
          <kbd className="rounded border border-border bg-background px-1 py-px font-mono text-[10px]">
            Shift+Enter
          </kbd>{" "}
          newline
        </span>
      </div>
    </div>
  );
}

/* ---------- Meta tag ---------- */

function MetaTag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const styles: Record<string, string> = {
    neutral: "border-border bg-surface-sunken text-foreground/70",
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/40 bg-warning/15 text-warning-foreground",
    danger: "border-destructive/30 bg-destructive/10 text-destructive",
    info: "border-info/30 bg-info/10 text-info",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] uppercase leading-none tracking-wide ${styles[tone]}`}
    >
      {children}
    </span>
  );
}


/* ---------- Runtime Bar ---------- */

function RuntimeBar(props: {
  state: RuntimeState;
  sessionId: string;
  workspace: string;
  tmuxName: string;
  errorMessage: string;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  advanced: boolean;
  setAdvanced: (v: boolean) => void;
}) {
  const {
    state,
    sessionId,
    tmuxName,
    errorMessage,
    menuOpen,
    setMenuOpen,
    advanced,
    setAdvanced,
  } = props;

  const dot: Record<RuntimeState, string> = {
    disconnected: "bg-dot-idle",
    "tmux-detected": "bg-info",
    connecting: "bg-warning animate-pulse",
    ready: "bg-dot-ready",
    busy: "bg-dot-busy animate-pulse",
    error: "bg-dot-error",
    "new-session": "bg-dot-idle",
  };

  const label: Record<RuntimeState, string> = {
    disconnected: "Read-only · runtime not attached",
    "tmux-detected": `Detected tmux "${tmuxName}"`,
    connecting: "Starting tmux · resuming Codex…",
    ready: `Connected · ${tmuxName} · Ready`,
    busy: `Connected · ${tmuxName} · Generating`,
    error: errorMessage,
    "new-session": "Read-only · runtime not attached",
  };

  // Compact "connected" pill
  if (state === "ready" || state === "busy") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px]">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`status-dot ${dot[state]}`} />
          <span className="truncate text-foreground/80">{label[state]}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            onClick={() => setAdvanced(!advanced)}
            className="rounded px-1.5 py-0.5 text-[11px] hover:bg-accent hover:text-foreground"
          >
            Details
          </button>
          <MenuButton
            open={menuOpen}
            setOpen={setMenuOpen}
            items={[
              { label: "Restart tmux", icon: RotateCw },
              { label: "Detach runtime", icon: Link2 },
              { label: "Copy resume command", icon: Terminal },
            ]}
          />
        </div>
      </div>
    );
  }

  // Error state — inline alert style, not a big card
  if (state === "error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/[0.06] px-3 py-2 text-[12.5px]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <div className="text-foreground">{errorMessage}</div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            Session {sessionId} · last tmux {tmuxName}
          </div>
        </div>
        <button className="shrink-0 rounded-md bg-foreground px-2.5 py-1 text-[12px] font-medium text-background hover:opacity-90">
          Retry resume
        </button>
        <MenuButton
          open={menuOpen}
          setOpen={setMenuOpen}
          items={[
            { label: "Start new Codex session", icon: Plus },
            { label: "Copy resume command", icon: Terminal },
            { label: "Advanced details", icon: MoreHorizontal, onClick: () => setAdvanced(!advanced) },
          ]}
        />
      </div>
    );
  }

  // Connecting — progress bar style
  if (state === "connecting") {
    return (
      <div className="rounded-lg border border-border bg-surface px-3 py-2">
        <div className="flex items-center justify-between gap-2 text-[12.5px]">
          <div className="flex min-w-0 items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-foreground/70" />
            <span className="truncate">Resuming Codex in RDX runtime…</span>
          </div>
          <button className="shrink-0 rounded px-2 py-0.5 text-[11.5px] text-muted-foreground hover:bg-accent hover:text-foreground">
            Cancel
          </button>
        </div>
        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-2/5 animate-[progress_1.6s_ease-in-out_infinite] rounded-full bg-foreground/70" />
        </div>
        <div className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-success" /> tmux {tmuxName}
          </span>
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> codex resume
          </span>
        </div>
        <style>{`@keyframes progress{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
      </div>
    );
  }

  // Disconnected / tmux-detected / new-session — the action bar
  const primary =
    state === "tmux-detected"
      ? { label: `Attach "${tmuxName}"`, icon: Link2 }
      : state === "new-session"
        ? { label: "Start new Codex session", icon: Plus }
        : { label: "Resume in RDX", icon: RotateCw };

  const menuItems =
    state === "tmux-detected"
      ? [
          { label: "Resume in fresh tmux", icon: RotateCw },
          { label: "Start new Codex session", icon: Plus },
          { label: "Advanced details", icon: Terminal, onClick: () => setAdvanced(!advanced) },
        ]
      : state === "new-session"
        ? [
            { label: "Resume existing session", icon: RotateCw },
            { label: "Attach detected tmux", icon: Link2 },
            { label: "Advanced details", icon: Terminal, onClick: () => setAdvanced(!advanced) },
          ]
        : [
            { label: "Attach detected tmux", icon: Link2 },
            { label: "Start new Codex session", icon: Plus },
            { label: "Advanced details", icon: Terminal, onClick: () => setAdvanced(!advanced) },
          ];

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
      <div className="flex min-w-0 flex-1 items-center gap-2 text-[12.5px]">
        <span className={`status-dot ${dot[state]}`} />
        <span className="truncate text-foreground/80">{label[state]}</span>
        <span className="hidden truncate font-mono text-[11px] text-muted-foreground md:inline">
          · {sessionId}
        </span>
      </div>
      <div className="flex shrink-0 items-center">
        <button className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1 text-[12px] font-medium text-background transition-opacity hover:opacity-90">
          <primary.icon className="h-3.5 w-3.5" />
          {primary.label}
        </button>
        <div className="mx-1 h-4 w-px bg-border" />
        <MenuButton open={menuOpen} setOpen={setMenuOpen} items={menuItems} />
      </div>
    </div>
  );
}

/* ---------- Menu ---------- */

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

function MenuButton({
  open,
  setOpen,
  items,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  items: MenuItem[];
}) {
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex h-7 items-center gap-0.5 rounded-md px-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="More"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-20 mb-1 w-56 overflow-hidden rounded-lg border border-border bg-popover py-1 text-[13px] shadow-[var(--shadow-popover)]">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                it.onClick?.();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-popover-foreground hover:bg-accent"
            >
              <it.icon className="h-3.5 w-3.5 text-muted-foreground" />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
