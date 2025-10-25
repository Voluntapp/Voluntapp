import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Filter, Grid, Layers, Heart, X, Bookmark } from "lucide-react";
import OpportunityCard from "@/components/OpportunityCard";
import OpportunityDetailModal from "@/components/OpportunityDetailModal";
import BottomNav from "@/components/BottomNav";
import type { OpportunityWithOrganization } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Discovery() {
  const { user } = useAuth();
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityWithOrganization | null>(null);
  const [viewMode, setViewMode] = useState<"swipe" | "list">("swipe");
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: opportunities, isLoading } = useQuery<OpportunityWithOrganization[]>({
    queryKey: ["/api/opportunities"],
  });

  const currentOpportunity = opportunities && opportunities[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    if (!opportunities || currentIndex >= opportunities.length - 1) return;
    setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-card-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold" data-testid="text-page-title">
              Discover
            </h1>
            {user?.location && (
              <p className="text-sm text-muted-foreground">{user.location}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "swipe" ? "list" : "swipe")}
              data-testid="button-toggle-view"
            >
              {viewMode === "swipe" ? <Grid className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {viewMode === "swipe" ? (
              <Skeleton className="w-full h-[600px] rounded-xl" />
            ) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-24 h-24 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : !opportunities || opportunities.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">
              No Opportunities Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Check back soon for volunteer opportunities in your area.
            </p>
          </div>
        ) : viewMode === "swipe" ? (
          <div className="space-y-6">
            {currentOpportunity ? (
              <>
                <div className="text-center mb-4">
                  <Badge variant="secondary">
                    {currentIndex + 1} / {opportunities.length}
                  </Badge>
                  {(currentOpportunity as any).matchScore && (
                    <Badge variant="default" className="ml-2">
                      {(currentOpportunity as any).matchScore}% Match
                    </Badge>
                  )}
                </div>
                <OpportunityCard
                  opportunity={currentOpportunity}
                  variant="full"
                  onViewDetails={() => setSelectedOpportunity(currentOpportunity)}
                />
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-16 w-16 rounded-full"
                    onClick={() => handleSwipe("left")}
                    data-testid="button-swipe-left"
                  >
                    <X className="w-8 h-8 text-destructive" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-16 w-16 rounded-full"
                    data-testid="button-swipe-save"
                  >
                    <Bookmark className="w-6 h-6" />
                  </Button>
                  <Button
                    size="icon"
                    variant="default"
                    className="h-16 w-16 rounded-full"
                    onClick={() => handleSwipe("right")}
                    data-testid="button-swipe-right"
                  >
                    <Heart className="w-8 h-8 fill-current" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="font-display text-2xl font-semibold mb-2">
                  You've Seen All Opportunities!
                </h2>
                <p className="text-muted-foreground">
                  Check back later for new opportunities in your area.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                variant="list"
                onViewDetails={() => setSelectedOpportunity(opportunity)}
              />
            ))}
          </div>
        )}
      </main>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        isOpen={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />

      <BottomNav />
    </div>
  );
}
