import { Skeleton } from "@/components/ui/skeleton";
export function ProjectCardSkeleton() {
    return (<div className="rounded-[18px] p-5 flex flex-col" style={{ background: "var(--lp-bg-raised)", border: "1px solid var(--lp-border)" }}>
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-[14px]" style={{ background: "var(--lp-bg-raised-2)" }}/>
        <div className="flex-1 pt-1 space-y-2">
          <Skeleton className="h-4 w-2/3 rounded" style={{ background: "var(--lp-bg-raised-2)" }}/>
          <Skeleton className="h-3 w-1/3 rounded" style={{ background: "var(--lp-bg-raised-2)" }}/>
        </div>
      </div>
      <Skeleton className="h-3 w-full rounded mt-4" style={{ background: "var(--lp-bg-raised-2)" }}/>
      <Skeleton className="h-3 w-4/5 rounded mt-2" style={{ background: "var(--lp-bg-raised-2)" }}/>
      <div className="flex items-center justify-between mt-4 pt-3.5" style={{ borderTop: "1px solid var(--lp-border-soft)" }}>
        <Skeleton className="h-4 w-14 rounded-full" style={{ background: "var(--lp-bg-raised-2)" }}/>
        <Skeleton className="h-3 w-16 rounded" style={{ background: "var(--lp-bg-raised-2)" }}/>
      </div>
    </div>);
}
export function ProjectGridSkeleton({ count = 6 }) {
    return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (<ProjectCardSkeleton key={i}/>))}
    </div>);
}
