import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingSkeleton() {
  return (
    <div className="container max-w-md mx-auto px-4 py-8 space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-3">
              <Skeleton className="h-14 flex-1" />
              <Skeleton className="h-14 w-32" />
            </div>
          </div>

          <div className="flex justify-center">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-3">
              <Skeleton className="h-14 flex-1" />
              <Skeleton className="h-14 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
