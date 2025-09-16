import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-white/10 rounded animate-pulse"></div>
          <div className="h-4 bg-white/5 rounded animate-pulse w-2/3"></div>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="h-6 bg-white/10 rounded animate-pulse w-1/3"></div>
            <div className="h-4 bg-white/5 rounded animate-pulse w-2/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-12 bg-white/5 rounded animate-pulse"></div>
              <div className="h-10 bg-white/5 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="h-6 bg-white/10 rounded animate-pulse w-1/4"></div>
            <div className="h-4 bg-white/5 rounded animate-pulse w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
