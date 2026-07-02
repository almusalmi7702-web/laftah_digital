interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-200/60 rounded-xl ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl p-6 border border-gray-100">
    <Skeleton className="w-12 h-12 rounded-lg mb-4" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-3 w-full mb-1" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const PricingSkeleton = () => (
  <div className="bg-white rounded-2xl p-8 border border-gray-200">
    <Skeleton className="h-5 w-1/2 mb-4" />
    <Skeleton className="h-10 w-1/3 mb-8" />
    <div className="space-y-3 mb-8">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-2/3" />
    </div>
    <Skeleton className="h-10 w-full rounded-full" />
  </div>
);

export const PortfolioSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <Skeleton className="aspect-video w-full rounded-none" />
    <div className="p-6">
      <Skeleton className="h-4 w-1/4 mb-2" />
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full" />
    </div>
  </div>
);

export const FaqSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

export default Skeleton;
