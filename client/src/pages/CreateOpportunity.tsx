import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import communityImage from "@assets/generated_images/Community_garden_volunteer_opportunity_4adae3c7.png";
import educationImage from "@assets/generated_images/Education_tutoring_volunteer_opportunity_76c09056.png";
import environmentImage from "@assets/generated_images/Beach_cleanup_environmental_opportunity_599fa134.png";
import foodBankImage from "@assets/generated_images/Food_bank_volunteer_opportunity_b5a5a863.png";

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(1, "Location is required"),
  duration: z.string().optional(),
  volunteersNeeded: z.string().min(1, "Number of volunteers is required"),
  imageUrl: z.string().optional(),
});

const CATEGORY_IMAGES: Record<string, string> = {
  "Community": communityImage,
  "Education": educationImage,
  "Environment": environmentImage,
  "Food Bank": foodBankImage,
  "Health": communityImage,
  "Animal Welfare": environmentImage,
};

export default function CreateOpportunity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: user?.location || "",
      duration: "",
      volunteersNeeded: "10",
      imageUrl: "",
    },
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const imageUrl = CATEGORY_IMAGES[data.category] || communityImage;
      await apiRequest("POST", "/api/opportunities", {
        ...data,
        volunteersNeeded: parseInt(data.volunteersNeeded),
        imageUrl,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your opportunity has been created",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities/mine"] });
      setLocation("/manage");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create opportunity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createOpportunityMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-card-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="font-display text-xl font-bold" data-testid="text-page-title">
            Create Opportunity
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opportunity Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Community Garden Planting Day"
                        {...field}
                        data-testid="input-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what volunteers will be doing, what to bring, and any other important details..."
                        className="min-h-32"
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCategory(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Environment">Environment</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Community">Community</SelectItem>
                        <SelectItem value="Food Bank">Food Bank</SelectItem>
                        <SelectItem value="Animal Welfare">Animal Welfare</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City, State"
                          {...field}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 2 hours"
                          {...field}
                          data-testid="input-duration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="volunteersNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volunteers Needed</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        data-testid="input-volunteers-needed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={createOpportunityMutation.isPending}
                data-testid="button-submit"
              >
                {createOpportunityMutation.isPending ? "Creating..." : "Create Opportunity"}
              </Button>
            </form>
          </Form>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
