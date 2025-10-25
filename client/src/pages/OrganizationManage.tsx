import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Pause, Play, Trash2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import type { Opportunity } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function OrganizationManage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const { data: opportunities, isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities/mine"],
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/opportunities/${id}`, {
        status: status === "active" ? "paused" : "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities/mine"] });
      toast({
        title: "Success",
        description: "Opportunity status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const deleteOpportunityMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/opportunities/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities/mine"] });
      toast({
        title: "Success",
        description: "Opportunity deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete opportunity",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-card-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="font-display text-xl font-bold" data-testid="text-page-title">
            Manage Opportunities
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </div>
        ) : !opportunities || opportunities.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">
              No Opportunities Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first opportunity to get started
            </p>
            <Button onClick={() => setLocation("/create")} data-testid="button-create-first">
              Create Opportunity
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="p-4" data-testid={`card-opportunity-${opportunity.id}`}>
                <div className="flex gap-4">
                  <img
                    src={opportunity.imageUrl || "/placeholder-opportunity.jpg"}
                    alt={opportunity.title}
                    className="w-24 h-24 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold line-clamp-1">{opportunity.title}</h3>
                      <Badge
                        variant={opportunity.status === "active" ? "default" : "secondary"}
                      >
                        {opportunity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {opportunity.volunteersApplied} / {opportunity.volunteersNeeded} volunteers applied
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatusMutation.mutate({
                          id: opportunity.id,
                          status: opportunity.status || "active",
                        })}
                        data-testid={`button-toggle-${opportunity.id}`}
                      >
                        {opportunity.status === "active" ? (
                          <><Pause className="w-4 h-4 mr-1" /> Pause</>
                        ) : (
                          <><Play className="w-4 h-4 mr-1" /> Resume</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-edit-${opportunity.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this opportunity?")) {
                            deleteOpportunityMutation.mutate(opportunity.id);
                          }
                        }}
                        data-testid={`button-delete-${opportunity.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
