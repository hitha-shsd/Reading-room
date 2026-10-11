import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
export function Flourish() {
  return (
    <div className="flourish" aria-hidden="true">
      <span />❧<span />
    </div>
  );
}
export function Botanical({ className = "" }: { className?: string }) {
  return (
    <svg className={`botanical ${className}`} viewBox="0 0 100 160" fill="none" aria-hidden="true">
      <path d="M45 154C55 113 46 65 63 14M49 123C25 123 12 102 17 93C39 88 47 107 49 123ZM51 104C76 104 85 84 80 76C59 74 52 91 51 104ZM51 80C29 77 21 55 27 48C46 49 50 66 51 80ZM57 53C76 48 83 30 76 25C61 28 57 43 57 53Z" />
      <path
        className="flower-petals"
        d="M64 24C45 25 41 9 51 6C53-7 68-5 71 4C85 1 91 15 80 21C80 33 67 35 64 24Z"
      />
      <circle cx="66" cy="15" r="5" />
    </svg>
  );
}
export function CoffeeCup() {
  return (
    <svg className="coffee-cup" viewBox="0 0 180 180" aria-hidden="true">
      <ellipse cx="86" cy="135" rx="68" ry="20" className="cup-saucer" />
      <path d="M120 64C166 48 167 109 125 109" className="cup-handle" />
      <path d="M34 57L43 112Q80 147 119 111L128 57Z" className="cup-body" />
      <ellipse cx="81" cy="58" rx="47" ry="18" className="cup-rim" />
      <ellipse cx="81" cy="59" rx="39" ry="12" className="cup-coffee" />
      <g className="steam">
        <path d="M65 38C48 21 79 20 64 1M83 34C66 17 98 13 85-4M101 35C85 22 114 16 102 1" />
      </g>
    </svg>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  // Render outside the book: 3D perspective otherwise traps fixed dialogs in a page.
  useEffect(() => {
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="journal-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "Tab") {
            const controls = Array.from(
              e.currentTarget.querySelectorAll<HTMLElement>(
                "button, input, textarea, select, a[href]",
              ),
            );
            const first = controls[0],
              last = controls.at(-1);
            if (e.shiftKey && document.activeElement === first && last) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last && first) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <Button variant="ghost" size="icon" aria-label="Close dialog" autoFocus onClick={onClose}>
            <X />
          </Button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  );
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
