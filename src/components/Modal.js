"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, title, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEsc = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-label="Close modal" />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-slate-200 px-5 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
