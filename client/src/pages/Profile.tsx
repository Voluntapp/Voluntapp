import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Award, Clock, LogOut } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { ApplicationWithDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { user } = useAuth();
  
  const { data: applications, isLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications/user"],
  });

  const completedApplications = applications?.filter(app => app.status === "completed") || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-b from-primary/10 to-transparent pt-8 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-end mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
          
          <div className="text-center">
            <img
              src={user?.profileImageUrl || "/default-avatar.png"}
              alt={user?.firstName || "User"}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-background"
              data-testid="img-profile-avatar"
            />
            <h1 className="font-display text-2xl font-bold mb-2" data-testid="text-user-name">
              {user?.firstName} {user?.lastName}
            </h1>
            {user?.location && (
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary" data-testid="text-opportunities-completed">
                  {user?.opportunitiesCompleted || 0}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary" data-testid="text-hours-volunteered">
                  {user?.hoursVolunteered || 0}
                </div>
                <div className="text-sm text-muted-foreground">Hours</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 -mt-8">
        {user?.interests && user.interests.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, i) => (
                <Badge key={i} variant="secondary">{interest}</Badge>
              ))}
            </div>
          </Card>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Volunteer History</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : completedApplications.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">
              No Completed Opportunities Yet
            </h3>
            <p className="text-muted-foreground">
              Start volunteering to build your impact history!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedApplications.map((app) => (
              <Card key={app.id} className="p-4 hover-elevate" data-testid={`card-completed-${app.id}`}>
                <div className="flex gap-4">
                  <img
                    src={app.opportunity.imageUrl || "/placeholder-opportunity.jpg"}
                    alt={app.opportunity.title}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{app.opportunity.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {app.opportunity.location}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Completed {app.completedAt ? new Date(app.completedAt).toLocaleDateString() : ""}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
