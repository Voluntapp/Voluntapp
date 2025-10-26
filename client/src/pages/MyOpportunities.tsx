import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import OpportunityDetailModal from "@/components/OpportunityDetailModal";
import type { ApplicationWithDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyOpportunities() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  
  const { data: applications, isLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications/user"],
  });

  const pendingApps = applications?.filter(app => app.status === "pending") || [];
  const acceptedApps = applications?.filter(app => app.status === "accepted") || [];
  const completedApps = applications?.filter(app => app.status === "completed") || [];

  const renderApplicationCard = (app: ApplicationWithDetails) => (
    <Card
      key={app.id}
      className="p-4 hover-elevate cursor-pointer"
      onClick={() => setSelectedOpportunity({ ...app.opportunity, organization: {} })}
      data-testid={`card-application-${app.id}`}
    >
      <div className="flex gap-4">
        <img
          src={app.opportunity.imageUrl || "/placeholder-opportunity.jpg"}
          alt={app.opportunity.title}
          className="w-20 h-20 rounded-md object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1 line-clamp-1">{app.opportunity.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{app.opportunity.location}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ""}</span>
          </div>
        </div>
        <Badge
          variant={
            app.status === "accepted" ? "default" :
            app.status === "completed" ? "secondary" :
            "outline"
          }
          className="h-fit"
        >
          {app.status}
        </Badge>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-card-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="font-display text-xl font-bold" data-testid="text-page-title">
            My Opportunities
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending ({pendingApps.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" data-testid="tab-accepted">
              Accepted ({acceptedApps.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Completed ({completedApps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </Card>
                ))}
              </div>
            ) : pendingApps.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">
                  No Pending Applications
                </h3>
                <p className="text-muted-foreground">
                  Your pending applications will appear here
                </p>
              </Card>
            ) : (
              pendingApps.map(renderApplicationCard)
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </Card>
                ))}
              </div>
            ) : acceptedApps.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">
                  No Accepted Applications
                </h3>
                <p className="text-muted-foreground">
                  Accepted applications will appear here
                </p>
              </Card>
            ) : (
              acceptedApps.map(renderApplicationCard)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </Card>
                ))}
              </div>
            ) : completedApps.length === 0 ? (
              <Card className="p-12 text-center">
                <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">
                  No Completed Opportunities
                </h3>
                <p className="text-muted-foreground">
                  Completed opportunities will appear here
                </p>
              </Card>
            ) : (
              completedApps.map(renderApplicationCard)
            )}
          </TabsContent>
        </Tabs>
      </main>

      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          isOpen={!!selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
