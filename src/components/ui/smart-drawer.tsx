import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────── SmartDrawer ─────────────────────────────────────────────────
 * A right-side drawer with:
 *   • Close (X) button
 *   • Maximize / restore toggle
 *   • Drag-to-resize left edge
 *   • Content-aware default width (auto up to a max, or explicit via `defaultWidth`)
 *   • Smooth slide-in / slide-out animation
 * ─────────────────────────────────────────────────────────────────────── */

const SmartDrawer = SheetPrimitive.Root;
const SmartDrawerTrigger = SheetPrimitive.Trigger;
const SmartDrawerClose = SheetPrimitive.Close;
const SmartDrawerPortal = SheetPrimitive.Portal;

// ── Overlay ──
const SmartDrawerOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
SmartDrawerOverlay.displayName = 'SmartDrawerOverlay';

// ── Size constants ──
const MIN_WIDTH = 340;   // px — never narrower than this
const MAX_AUTO = 640;    // px — default max when width is auto

// ── Content ──
interface SmartDrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  /** Explicit default width in px. When omitted the drawer fits its content up to MAX_AUTO. */
  defaultWidth?: number;
}

const SmartDrawerContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SmartDrawerContentProps
>(({ className, children, defaultWidth, ...props }, ref) => {
  const [isMaximized, setIsMaximized] = React.useState(false);
  const [width, setWidth] = React.useState<number>(defaultWidth ?? MAX_AUTO);
  const dragging = React.useRef(false);
  const startX = React.useRef(0);
  const startW = React.useRef(0);

  // Reset on open
  React.useEffect(() => {
    setIsMaximized(false);
    setWidth(defaultWidth ?? MAX_AUTO);
  }, [defaultWidth]);

  // ── Resize handlers ──
  const onPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (isMaximized) return;
      e.preventDefault();
      dragging.current = true;
      startX.current = e.clientX;
      startW.current = width;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isMaximized, width],
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const delta = startX.current - e.clientX; // dragging left → bigger
      const next = Math.max(MIN_WIDTH, Math.min(window.innerWidth - 48, startW.current + delta));
      setWidth(next);
    },
    [],
  );

  const onPointerUp = React.useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <SmartDrawerPortal>
      <SmartDrawerOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex flex-col bg-background shadow-xl border-l',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'data-[state=closed]:duration-200 data-[state=open]:duration-300',
          isMaximized && 'rounded-none',
          !isMaximized && 'rounded-l-xl',
          className,
        )}
        style={{
          width: isMaximized ? '100vw' : `${width}px`,
          maxWidth: '100vw',
          transition: dragging.current ? 'none' : 'width 0.25s ease',
        }}
        {...props}
      >
        {/* ── Drag handle (left edge) ── */}
        {!isMaximized && (
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors z-10 touch-none"
          />
        )}

        {/* ── Title-bar buttons ── */}
        <div className="absolute right-3 top-3 flex items-center gap-1 z-10">
          <button
            type="button"
            onClick={() => setIsMaximized(m => !m)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <SheetPrimitive.Close className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-12">
          {children}
        </div>
      </SheetPrimitive.Content>
    </SmartDrawerPortal>
  );
});
SmartDrawerContent.displayName = 'SmartDrawerContent';

// ── Header / Footer / Title / Description ──
const SmartDrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-left mb-4', className)} {...props} />
);
SmartDrawerHeader.displayName = 'SmartDrawerHeader';

const SmartDrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-border mt-auto', className)}
    {...props}
  />
);
SmartDrawerFooter.displayName = 'SmartDrawerFooter';

const SmartDrawerTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)}
    {...props}
  />
));
SmartDrawerTitle.displayName = 'SmartDrawerTitle';

const SmartDrawerDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
SmartDrawerDescription.displayName = 'SmartDrawerDescription';

export {
  SmartDrawer,
  SmartDrawerTrigger,
  SmartDrawerClose,
  SmartDrawerContent,
  SmartDrawerHeader,
  SmartDrawerFooter,
  SmartDrawerTitle,
  SmartDrawerDescription,
};
