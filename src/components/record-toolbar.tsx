"use client";
import { Search, X } from "lucide-react";
export function RecordToolbar({
  label,
  query,
  onQuery,
  count,
  children,
  onReset,
  filtered,
}: {
  label: string;
  query: string;
  onQuery: (value: string) => void;
  count: number;
  children?: React.ReactNode;
  onReset: () => void;
  filtered: boolean;
}) {
  return (
    <div className="record-toolbar">
      <div className="record-toolbar-controls">
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label={label}
            placeholder={label + "…"}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label={`${label}: zoekopdracht wissen`}
              onClick={() => onQuery("")}
            >
              <X size={16} />
            </button>
          )}
        </div>
        {children}
      </div>
      <div className="record-toolbar-summary">
        <span role="status">{count} resultaten</span>
        {filtered && (
          <button type="button" onClick={onReset}>
            Zoekopdracht en filters wissen
          </button>
        )}
      </div>
    </div>
  );
}
