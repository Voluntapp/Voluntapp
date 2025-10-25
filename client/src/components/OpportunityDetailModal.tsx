import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Calendar, X } from "lucide-react";
import type { OpportunityWithOrganization } from "@shared/schema";
import { formatDistance, calculateDistance } from "@/lib/locationUtils";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface OpportunityDetailModalProps {
  opportunity: OpportunityWithOrganization | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OpportunityDetailModal({
  opportunity,
  isOpen,
  onClose,
}: OpportunityDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const applyMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      await apiRequest("POST", "/api/applications", { opportunityId });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "You've successfully applied to this opportunity.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/user"] });
      onClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!opportunity) return null;
  
  const distance = user?.latitude && user?.longitude && opportunity.latitude && opportunity.longitude
    ? calculateDistance(user.latitude, user.longitude, opportunity.latitude, opportunity.longitude)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0" data-testid="modal-opportunity-detail">
        <div className="relative">
          <img
            src={opportunity.imageUrl || "/placeholder-opportunity.jpg"}
            alt={opportunity.title}
            className="w-full h-64 object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={onClose}
            data-testid="button-close-modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={opportunity.organization.profileImageUrl || "/default-avatar.png"}
              alt={opportunity.organization.organizationName || "Organization"}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">
                {opportunity.organization.organizationName || 
                 `${opportunity.organization.firstName} ${opportunity.organization.lastName}`}
              </p>
              <p className="text-sm text-muted-foreground">{opportunity.location}</p>
            </div>
          </div>
          
          <DialogHeader className="mb-4">
            <DialogTitle className="font-display text-2xl" data-testid="text-opportunity-title">
              {opportunity.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className="bg-primary text-primary-foreground">{opportunity.category}</Badge>
            {distance && (
              <Badge variant="secondary">
                <MapPin className="w-3 h-3 mr-1" />
                {formatDistance(distance)}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {opportunity.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{opportunity.duration}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Volunteers Needed</p>
                <p className="font-medium">
                  {opportunity.volunteersNeeded - opportunity.volunteersApplied} spots left
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">About This Opportunity</h3>
            <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-opportunity-description">
              {opportunity.description}
            </p>
          </div>
          
          {opportunity.skills && opportunity.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.skills.map((skill, i) => (
                  <Badge key={i} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <Button
            className="w-full"
            size="lg"
            onClick={() => applyMutation.mutate(opportunity.id)}
            disabled={applyMutation.isPending}
            data-testid="button-apply"
          >
            {applyMutation.isPending ? "Submitting..." : "Apply to This Opportunity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
