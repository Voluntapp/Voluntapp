import { Button } from "@/components/ui/button";
import { Heart, MapPin, Users, TrendingUp } from "lucide-react";
import welcomeIllustration from "@assets/generated_images/Onboarding_welcome_illustration_0cba416a.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="font-display text-2xl font-bold">Voluntapp</h1>
          </div>
          <Button
            onClick={() => window.location.href = "/api/login"}
            variant="outline"
            data-testid="button-login"
          >
            Log In
          </Button>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="font-display text-5xl font-bold mb-6 leading-tight">
              Discover Meaningful Volunteer Opportunities
              <span className="text-primary"> Near You</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with local organizations, make a difference in your community, 
              and track your volunteer impact—all in one place.
            </p>
            <Button
              size="lg"
              className="text-lg h-12 px-8"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-get-started"
            >
              Get Started Free
            </Button>
          </div>
          
          <div className="flex justify-center">
            <img
              src={welcomeIllustration}
              alt="Volunteer community illustration"
              className="w-full max-w-md"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Location-Based Matching
            </h3>
            <p className="text-muted-foreground">
              Find opportunities close to home with smart location-based recommendations
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Personalized For You
            </h3>
            <p className="text-muted-foreground">
              Get recommendations based on your interests and previous volunteer work
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Track Your Impact
            </h3>
            <p className="text-muted-foreground">
              See your volunteer hours, completed opportunities, and community impact
            </p>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-12 text-center">
          <Users className="w-16 h-16 text-primary mx-auto mb-6" />
          <h3 className="font-display text-3xl font-bold mb-4">
            Are you an organization?
          </h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Post volunteer opportunities, manage applications, and connect with 
            passionate volunteers in your community.
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-organization-signup"
          >
            Sign Up as Organization
          </Button>
        </div>
      </div>
    </div>
  );
}
