"use client";
import { useEffect, useRef, useId } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="edit-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <div className="card-header">
        <div>
          <span className="eyebrow">ADMINISTRATIE</span>
          <h2 id={titleId}>{title}</h2>
        </div>
        <Button variant="ghost" aria-label="Venster sluiten" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
