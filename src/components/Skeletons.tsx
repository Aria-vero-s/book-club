export function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className ?? ""}`} />;
}

export function BookSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-8">
      <Pulse className="w-44 h-64 rounded-2xl flex-shrink-0 mx-auto md:mx-0" />
      <div className="flex-1 space-y-4 pt-2">
        <Pulse className="h-4 w-32 rounded-full" />
        <Pulse className="h-8 w-3/4" />
        <Pulse className="h-5 w-1/3" />
        <Pulse className="h-4 w-24 rounded-full" />
        <div className="space-y-2 pt-2">
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-5/6" />
          <Pulse className="h-4 w-4/6" />
        </div>
        <div className="flex gap-3 pt-4">
          <Pulse className="h-10 w-32 rounded-full" />
          <Pulse className="h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
      <Pulse className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-4 w-28" />
        <Pulse className="h-3 w-20 rounded-full" />
        <Pulse className="h-4 w-full mt-3" />
        <Pulse className="h-4 w-3/4" />
      </div>
    </div>
  );
}
