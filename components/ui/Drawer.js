"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "max-w-xl",
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      <button className="absolute inset-0 bg-slate-900/35" onClick={onClose} aria-label="Close drawer" />

      <div
        className={cn(
          "absolute right-0 top-0 h-full w-full border-l border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.2)]",
          width,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
            <div>
              {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
              {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg">
              <X size={16} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">{children}</div>

          {footer ? <div className="border-t border-slate-200 px-5 py-4">{footer}</div> : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
