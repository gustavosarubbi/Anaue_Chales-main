import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton rounded-md bg-moss-100/50 relative overflow-hidden", className)}
      {...props}
    />
  )
}

// Card Skeleton for features, pricing, etc.
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 p-6 border border-moss-200 rounded-lg bg-white", className)}>
      <Skeleton className="h-16 w-16 rounded-full mx-auto" />
      <Skeleton className="h-4 w-3/4 mx-auto" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  )
}

// Gallery Image Skeleton
function GallerySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="aspect-[3/2] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

// Calendar Skeleton
function CalendarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 p-6", className)}>
      <Skeleton className="h-8 w-48 mx-auto" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-10" />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, GallerySkeleton, CalendarSkeleton }
