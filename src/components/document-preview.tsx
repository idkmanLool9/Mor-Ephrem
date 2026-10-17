"use client";
import { useEffect, useRef, useState } from "react";
import { Download, FileText } from "lucide-react";
import type { Document as StoredDocument } from "@/lib/member-store";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
export function documentBlob(record: StoredDocument) {
  return new Blob(
    [Uint8Array.from(atob(record.base64), (c) => c.charCodeAt(0))],
    { type: record.mime },
  );
}
export function downloadDocument(record: StoredDocument) {
  const url = URL.createObjectURL(documentBlob(record));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = record.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function DocumentPreview({
  record,
  onClose,
}: {
  record: StoredDocument;
  onClose: () => void;
}) {
  const image = useRef<HTMLImageElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const url = URL.createObjectURL(documentBlob(record));
    const element =
      record.mime === "application/pdf" ? frame.current : image.current;
    if (element) element.src = url;
    return () => URL.revokeObjectURL(url);
  }, [record]);
  return (
    <Modal title="Documentvoorbeeld" onClose={onClose}>
      <div className="document-preview">
        <div className="preview-heading">
          <div>
            <FileText size={19} />
            <strong>{record.name}</strong>
            <span>
              {record.category} · {Math.max(1, Math.round(record.size / 1024))}{" "}
              KB
            </span>
          </div>
          <Button variant="outline" onClick={() => downloadDocument(record)}>
            <Download size={16} />
            Download
          </Button>
        </div>
        {record.mime === "application/pdf" ? (
          <>
            <p className="preview-help">
              Als de PDF niet wordt weergegeven, gebruik Download om het bestand
              te openen.
            </p>
            <iframe
              ref={frame}
              title={`Voorbeeld van ${record.name}`}
              className="pdf-preview"
            />
          </>
        ) : failed ? (
          <p role="alert" className="form-error">
            De afbeelding kan niet worden weergegeven. U kunt het bestand nog
            wel downloaden.
          </p>
        ) : (
          <div className="image-preview">
            {/* Local blob images are never sent to Next.js or an image service. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={image}
              alt={`Voorbeeld van ${record.name}`}
              onError={() => setFailed(true)}
            />
          </div>
        )}
        {record.description && (
          <p className="preview-description">{record.description}</p>
        )}
      </div>
    </Modal>
  );
}
