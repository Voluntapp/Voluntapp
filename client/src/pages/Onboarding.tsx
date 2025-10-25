import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapPin, Heart, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation as useWouterLocation } from "wouter";
import welcomeIllustration from "@assets/generated_images/Onboarding_welcome_illustration_0cba416a.png";
import locationIllustration from "@assets/generated_images/Location_selection_illustration_f460bd5f.png";

const INTEREST_OPTIONS = [
  "Education", "Environment", "Health", "Community", "Animal Welfare",
  "Arts & Culture", "Disaster Relief", "Food Bank", "Youth Programs",
  "Senior Care", "Technology", "Sports & Recreation"
];

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useWouterLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    accountType: "",
    location: "",
    interests: [] as string[],
    organizationName: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", "/api/users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated!",
        description: "Welcome to Voluntapp!",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step === 1 && !formData.accountType) {
      toast({
        title: "Please select an account type",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !formData.location) {
      toast({
        title: "Please enter your location",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && formData.interests.length === 0) {
      toast({
        title: "Please select at least one interest",
        variant: "destructive",
      });
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      const payload: any = {
        location: formData.location,
        interests: formData.interests,
      };
      
      if (formData.accountType === "organization" && formData.organizationName) {
        payload.organizationName = formData.organizationName;
      }
      
      updateProfileMutation.mutate(payload);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <Progress value={progress} className="h-1" data-testid="progress-onboarding" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          {step === 1 && (
            <div className="text-center" data-testid="step-account-type">
              <img
                src={welcomeIllustration}
                alt="Welcome"
                className="w-48 h-48 mx-auto mb-8"
              />
              <h1 className="font-display text-3xl font-bold mb-4">
                Welcome to Voluntapp!
              </h1>
              <p className="text-muted-foreground mb-8">
                Let's get your profile set up. First, tell us what brings you here.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setFormData({ ...formData, accountType: "volunteer" })}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    formData.accountType === "volunteer"
                      ? "border-primary bg-primary/5"
                      : "border-card-border hover-elevate"
                  }`}
                  data-testid="button-account-volunteer"
                >
                  <Heart className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-display text-xl font-semibold mb-2">
                    I Want to Volunteer
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Find opportunities to make a difference in your community
                  </p>
                </button>

                <button
                  onClick={() => setFormData({ ...formData, accountType: "organization" })}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    formData.accountType === "organization"
                      ? "border-primary bg-primary/5"
                      : "border-card-border hover-elevate"
                  }`}
                  data-testid="button-account-organization"
                >
                  <Users className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-display text-xl font-semibold mb-2">
                    I'm an Organization
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Post opportunities and connect with volunteers
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div data-testid="step-location">
              <img
                src={locationIllustration}
                alt="Location"
                className="w-48 h-48 mx-auto mb-8"
              />
              <h1 className="font-display text-3xl font-bold mb-4 text-center">
                Where are you located?
              </h1>
              <p className="text-muted-foreground mb-8 text-center">
                We'll use this to find volunteer opportunities near you.
              </p>

              <div className="space-y-4">
                {formData.accountType === "organization" && (
                  <div>
                    <Label htmlFor="organization-name">Organization Name</Label>
                    <Input
                      id="organization-name"
                      placeholder="Enter organization name"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      data-testid="input-organization-name"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="location"
                      className="pl-10"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      data-testid="input-location"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Example: San Francisco, CA
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div data-testid="step-interests">
              <h1 className="font-display text-3xl font-bold mb-4 text-center">
                What interests you?
              </h1>
              <p className="text-muted-foreground mb-8 text-center">
                Select at least one area you're passionate about. We'll personalize your experience.
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {INTEREST_OPTIONS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={formData.interests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 text-sm hover-elevate active-elevate-2"
                    onClick={() => toggleInterest(interest)}
                    data-testid={`badge-interest-${interest.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {formData.interests.length} selected
              </p>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
                data-testid="button-back"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={updateProfileMutation.isPending}
              className="flex-1"
              data-testid="button-next"
            >
              {step === 3
                ? updateProfileMutation.isPending
                  ? "Finishing..."
                  : "Complete Setup"
                : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
