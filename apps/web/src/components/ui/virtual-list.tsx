"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useVirtualizer,
  type Rect,
  type VirtualItem,
  type Virtualizer,
} from "@tanstack/react-virtual";
import { OVERSCAN_DEFAULT } from "@/lib/constants/virtualization";
import { cn } from "@/lib/utils";

const DEFAULT_TEST_RECT: Rect = { width: 900, height: 600 };

export interface VirtualListHandle {
  scrollToIndex: (
    index: number,
    options?: Parameters<
      Virtualizer<HTMLDivElement, Element>["scrollToIndex"]
    >[1],
  ) => void;
}

interface VirtualRenderArgs<T> {
  item: T;
  index: number;
  virtualItem: VirtualItem;
}

interface VirtualListProps<T> {
  items: T[];
  getKey: (item: T, index: number) => string;
  estimateSize: number;
  className?: string;
  itemClassName?: string;
  overscan?: number;
  role?: string;
  ariaLabel?: string;
  renderItem: (args: VirtualRenderArgs<T>) => ReactNode;
  /**
   * Test-only measurement escape hatch for jsdom, where element rects are zero.
   */
  __testRect?: Rect;
}

interface VirtualGridProps<T> extends Omit<VirtualListProps<T>, "renderItem"> {
  gapPx: number;
  minColumnWidthPx: number;
  renderItem: (args: VirtualRenderArgs<T>) => ReactNode;
}

function VirtualListInner<T>(
  {
    items,
    getKey,
    estimateSize,
    className,
    itemClassName,
    overscan = OVERSCAN_DEFAULT,
    role = "list",
    ariaLabel,
    renderItem,
    __testRect,
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<VirtualListHandle>,
) {
  const initialRect =
    __testRect ??
    (process.env.NODE_ENV === "test" ? DEFAULT_TEST_RECT : undefined);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [testScrollOffset, setTestScrollOffset] = useState(0);
  const useTestMeasurements = Boolean(
    initialRect && process.env.NODE_ENV === "test",
  );
  const testMeasurementOptions = getTestMeasurementOptions(
    initialRect,
    estimateSize,
  );
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    getItemKey: (index) => getKey(items[index], index),
    overscan,
    initialRect,
    ...testMeasurementOptions,
  });
  const virtualItems =
    useTestMeasurements && initialRect
      ? getTestVirtualItems(
          items.length,
          estimateSize,
          initialRect.height,
          overscan,
          testScrollOffset,
          (index) => getKey(items[index], index),
        )
      : virtualizer.getVirtualItems();

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index, options) => {
        if (useTestMeasurements) {
          setTestScrollOffset(index * estimateSize);
          virtualizer.scrollToOffset(index * estimateSize, options);
          return;
        }

        virtualizer.scrollToIndex(index, options);
      },
    }),
    [estimateSize, useTestMeasurements, virtualizer],
  );

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", className)}
      role={role}
      aria-label={ariaLabel}
      data-virtual-parent=""
      // The virtualizer measures container size on mount, so the
      // server renders 0 rows while the client renders the visible
      // window. That delta is expected — suppress the resulting
      // hydration warning rather than disable SSR for the entire
      // list.
      suppressHydrationWarning
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
        suppressHydrationWarning
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];

          return (
            <div
              key={virtualItem.key}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              data-virtual-row=""
              role="listitem"
              aria-posinset={virtualItem.index + 1}
              aria-setsize={items.length}
              className={cn("absolute left-0 top-0 w-full", itemClassName)}
              style={{
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem({
                item,
                index: virtualItem.index,
                virtualItem,
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VirtualGridInner<T>(
  {
    items,
    getKey,
    estimateSize,
    className,
    itemClassName,
    overscan = OVERSCAN_DEFAULT,
    role = "list",
    ariaLabel,
    renderItem,
    gapPx,
    minColumnWidthPx,
    __testRect,
  }: VirtualGridProps<T>,
  ref: React.ForwardedRef<VirtualListHandle>,
) {
  const initialRect =
    __testRect ??
    (process.env.NODE_ENV === "test" ? DEFAULT_TEST_RECT : undefined);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(initialRect?.width ?? 0);
  const testMeasurementOptions = getTestMeasurementOptions(
    initialRect,
    estimateSize,
  );
  const columnCount = Math.max(
    1,
    Math.floor((width + gapPx) / (minColumnWidthPx + gapPx)),
  );
  const rows = useMemo(() => {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += columnCount) {
      chunks.push(items.slice(index, index + columnCount));
    }
    return chunks;
  }, [columnCount, items]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    getItemKey: (index) => rows[index]?.map(getKey).join(":") ?? index,
    overscan,
    initialRect,
    ...testMeasurementOptions,
  });
  const virtualRows = virtualizer.getVirtualItems();

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index, options) =>
        virtualizer.scrollToIndex(Math.floor(index / columnCount), options),
    }),
    [columnCount, virtualizer],
  );

  function handleParentRef(node: HTMLDivElement | null) {
    parentRef.current = node;
    if (!node) return;

    setWidth(node.getBoundingClientRect().width || initialRect?.width || 0);
  }

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width || initialRect?.width || 0);
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [initialRect?.width]);

  return (
    <div
      ref={handleParentRef}
      className={cn("overflow-auto", className)}
      role={role}
      aria-label={ariaLabel}
      data-virtual-parent=""
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualRows.map((virtualRow) => {
          const rowItems = rows[virtualRow.index] ?? [];

          return (
            <div
              key={virtualRow.key}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              data-virtual-row=""
              className="absolute left-0 top-0 grid w-full"
              style={{
                gap: `${gapPx}px`,
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowItems.map((item, itemOffset) => {
                const index = virtualRow.index * columnCount + itemOffset;

                return (
                  <div
                    key={getKey(item, index)}
                    role="listitem"
                    aria-posinset={index + 1}
                    aria-setsize={items.length}
                    className={itemClassName}
                    data-virtual-grid-cell=""
                  >
                    {renderItem({ item, index, virtualItem: virtualRow })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTestMeasurementOptions(
  initialRect: Rect | undefined,
  itemSize: number,
) {
  if (!initialRect || process.env.NODE_ENV !== "test") {
    return {};
  }

  let scrollOffset = 0;
  let notifyOffset:
    | ((offset: number, isScrolling: boolean) => void)
    | undefined;

  return {
    observeElementRect: (
      _instance: Virtualizer<HTMLDivElement, Element>,
      callback: (rect: Rect) => void,
    ) => {
      callback(initialRect);
      return () => {};
    },
    observeElementOffset: (
      _instance: Virtualizer<HTMLDivElement, Element>,
      callback: (offset: number, isScrolling: boolean) => void,
    ) => {
      notifyOffset = callback;
      callback(scrollOffset, false);
      return () => {
        notifyOffset = undefined;
      };
    },
    scrollToFn: (
      offset: number,
      { adjustments = 0 }: { adjustments?: number },
      instance: Virtualizer<HTMLDivElement, Element>,
    ) => {
      const scrollElement = instance.scrollElement;
      if (!scrollElement) return;

      scrollOffset = offset + adjustments;
      scrollElement.scrollTop = scrollOffset;
      notifyOffset?.(scrollOffset, false);
    },
    measureElement: () => itemSize,
  };
}

function getTestVirtualItems(
  count: number,
  itemSize: number,
  viewportHeight: number,
  overscan: number,
  scrollOffset: number,
  getItemKey: (index: number) => string | number | bigint,
): VirtualItem[] {
  const visibleStart = Math.floor(scrollOffset / itemSize);
  const visibleEnd = Math.ceil((scrollOffset + viewportHeight) / itemSize);
  const start = Math.max(0, visibleStart - overscan);
  const end = Math.min(count - 1, visibleEnd + overscan);
  const virtualItems: VirtualItem[] = [];

  for (let index = start; index <= end; index += 1) {
    virtualItems.push({
      key: getItemKey(index),
      index,
      start: index * itemSize,
      end: (index + 1) * itemSize,
      size: itemSize,
      lane: 0,
    });
  }

  return virtualItems;
}

export const VirtualList = forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<VirtualListHandle> },
) => React.ReactElement;

export const VirtualGrid = forwardRef(VirtualGridInner) as <T>(
  props: VirtualGridProps<T> & { ref?: React.Ref<VirtualListHandle> },
) => React.ReactElement;
