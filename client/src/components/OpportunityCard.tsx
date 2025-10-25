import { MapPin, Clock, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OpportunityWithOrganization } from "@shared/schema";
import { formatDistance, calculateDistance } from "@/lib/locationUtils";
import { useAuth } from "@/hooks/useAuth";

interface OpportunityCardProps {
  opportunity: OpportunityWithOrganization;
  onViewDetails: (id: string) => void;
  variant?: "full" | "list";
}

export default function OpportunityCard({ 
  opportunity, 
  onViewDetails,
  variant = "list" 
}: OpportunityCardProps) {
  const { user } = useAuth();
  
  const distance = user?.latitude && user?.longitude && opportunity.latitude && opportunity.longitude
    ? calculateDistance(user.latitude, user.longitude, opportunity.latitude, opportunity.longitude)
    : null;

  const categoryColors: Record<string, string> = {
    Education: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Environment: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Community: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "Food Bank": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  };

  if (variant === "full") {
    return (
      <div 
        className="relative h-[600px] rounded-xl overflow-hidden shadow-lg"
        data-testid={`card-opportunity-${opportunity.id}`}
      >
        <img
          src={opportunity.imageUrl || "/placeholder-opportunity.jpg"}
          alt={opportunity.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={opportunity.organization.profileImageUrl || "/default-avatar.png"}
              alt={opportunity.organization.organizationName || "Organization"}
              className="w-12 h-12 rounded-full object-cover border-2 border-white"
            />
            <div>
              <p className="text-sm opacity-90">
                {opportunity.organization.organizationName || 
                 `${opportunity.organization.firstName} ${opportunity.organization.lastName}`}
              </p>
            </div>
          </div>
          
          <h2 className="font-display text-2xl font-bold mb-2 line-clamp-2" data-testid="text-opportunity-title">
            {opportunity.title}
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={`${categoryColors[opportunity.category] || "bg-gray-100 text-gray-800"} border-0`}>
              {opportunity.category}
            </Badge>
            {distance && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <MapPin className="w-3 h-3 mr-1" />
                {formatDistance(distance)}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            {opportunity.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{opportunity.duration}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{opportunity.volunteersNeeded - opportunity.volunteersApplied} spots left</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20"
              onClick={() => onViewDetails(opportunity.id)}
              data-testid="button-view-details"
            >
              View Details
            </Button>
            <Button
              size="lg"
              className="flex-1"
              data-testid="button-apply"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onViewDetails(opportunity.id)}
      className="flex gap-4 p-4 rounded-lg border border-card-border bg-card hover-elevate active-elevate-2 cursor-pointer"
      data-testid={`card-opportunity-${opportunity.id}`}
    >
      <img
        src={opportunity.imageUrl || "/placeholder-opportunity.jpg"}
        alt={opportunity.title}
        className="w-24 h-24 rounded-md object-cover flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base line-clamp-2" data-testid="text-opportunity-title">
            {opportunity.title}
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">
          {opportunity.organization.organizationName || 
           `${opportunity.organization.firstName} ${opportunity.organization.lastName}`}
        </p>
        
        <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
          {distance && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{formatDistance(distance)}</span>
            </div>
          )}
          {opportunity.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{opportunity.duration}</span>
            </div>
          )}
        </div>
      </div>
      
      <Badge className={`${categoryColors[opportunity.category] || "bg-gray-100 text-gray-800"} h-fit text-xs border-0`}>
        {opportunity.category}
      </Badge>
    </div>
  );
}
