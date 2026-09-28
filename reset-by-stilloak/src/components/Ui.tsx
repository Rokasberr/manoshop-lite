import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function ProgressRing({ value, size = 88 }: { value: number; size?: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-ring" style={{ width: size, height: size }} aria-label={`${progress}% complete`}>
      <svg viewBox="0 0 100 100" role="img">
        <circle className="ring-track" cx="50" cy="50" r={radius} />
        <circle className="ring-value" cx="50" cy="50" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)} />
      </svg>
      <strong>{progress}%</strong>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="page-header">
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div>
      {action}
    </header>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><span aria-hidden="true">○</span><h3>{title}</h3><p>{text}</p></div>;
}

export function LoadingScreen() {
  return <div className="loading-screen"><div className="pulse-mark">R</div><p>Preparing your reset…</p></div>;
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header><h2 id="modal-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></header>
        {children}
      </section>
    </div>
  );
}

export function Notice({ tone = "neutral", children }: { tone?: "neutral" | "success" | "error"; children: ReactNode }) {
  return <div className={`notice notice-${tone}`} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}
