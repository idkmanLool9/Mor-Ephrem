"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
export const Tabs = TabsPrimitive.Root;
export function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  const list = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  function measure() {
    const el = list.current;
    if (el)
      setEdges({
        left: el.scrollLeft > 2,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
      });
  }
  useEffect(() => {
    const element = list.current;
    if (!element) return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="tabs-navigation">
      {edges.left && (
        <button
          className="tabs-scroll tabs-scroll-left"
          aria-label="Vorige tabbladen"
          onClick={() =>
            list.current?.scrollBy({ left: -250, behavior: "smooth" })
          }
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <TabsPrimitive.List
        {...props}
        ref={list}
        onScroll={(event) => {
          measure();
          props.onScroll?.(event);
        }}
        className={cn(
          "tabs-list flex gap-6 overflow-x-auto border-b border-slate-200",
          className,
        )}
      />
      {edges.right && (
        <button
          className="tabs-scroll tabs-scroll-right"
          aria-label="Meer tabbladen"
          onClick={() =>
            list.current?.scrollBy({ left: 250, behavior: "smooth" })
          }
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "shrink-0 border-b-2 border-transparent px-1 py-4 text-sm text-slate-500 data-[state=active]:border-blue-700 data-[state=active]:text-blue-700 focus-visible:outline-2",
        className,
      )}
      {...props}
    />
  );
}
export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("pt-6 focus-visible:outline-2", className)}
      {...props}
    />
  );
}
