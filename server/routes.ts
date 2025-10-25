// Reference: javascript_log_in_with_replit blueprint
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  updateUserProfileSchema, 
  insertOpportunitySchema, 
  updateOpportunitySchema,
  insertApplicationSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = updateUserProfileSchema.parse(req.body);
      
      // Geocode location if provided
      if (validatedData.location) {
        const { geocodeLocation } = await import("./locationService");
        const coords = geocodeLocation(validatedData.location);
        if (coords) {
          validatedData.latitude = coords.latitude;
          validatedData.longitude = coords.longitude;
        }
      }
      
      const user = await storage.updateUserProfile(userId, validatedData);
      res.json(user);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  // Opportunity routes with matching algorithm
  app.get('/api/opportunities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const opportunities = await storage.getOpportunitiesWithMatching(
        user?.latitude,
        user?.longitude,
        user?.interests || []
      );
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.get('/api/opportunities/mine', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const opportunities = await storage.getOpportunitiesByOrganization(userId);
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching user opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.get('/api/opportunities/:id', async (req, res) => {
    try {
      const opportunity = await storage.getOpportunity(req.params.id);
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      res.status(500).json({ message: "Failed to fetch opportunity" });
    }
  });

  app.post('/api/opportunities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertOpportunitySchema.parse({
        ...req.body,
        organizationId: userId,
      });
      
      // Geocode location if provided
      if (validatedData.location) {
        const { geocodeLocation } = await import("./locationService");
        const coords = geocodeLocation(validatedData.location);
        if (coords) {
          validatedData.latitude = coords.latitude;
          validatedData.longitude = coords.longitude;
        }
      }
      
      const opportunity = await storage.createOpportunity(validatedData);
      res.status(201).json(opportunity);
    } catch (error: any) {
      console.error("Error creating opportunity:", error);
      res.status(400).json({ message: error.message || "Failed to create opportunity" });
    }
  });

  app.patch('/api/opportunities/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const opportunity = await storage.getOpportunity(req.params.id);
      
      if (!opportunity || opportunity.organizationId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const validatedData = updateOpportunitySchema.parse(req.body);
      const updated = await storage.updateOpportunity(req.params.id, validatedData);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating opportunity:", error);
      res.status(400).json({ message: error.message || "Failed to update opportunity" });
    }
  });

  app.delete('/api/opportunities/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const opportunity = await storage.getOpportunity(req.params.id);
      
      if (!opportunity || opportunity.organizationId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteOpportunity(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      res.status(500).json({ message: "Failed to delete opportunity" });
    }
  });

  // Application routes
  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertApplicationSchema.parse({
        ...req.body,
        userId,
      });
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error: any) {
      console.error("Error creating application:", error);
      res.status(400).json({ message: error.message || "Failed to create application" });
    }
  });

  app.get('/api/applications/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getApplicationsByUser(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/applications/opportunity/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const opportunity = await storage.getOpportunity(req.params.id);
      
      if (!opportunity || opportunity.organizationId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const applications = await storage.getApplicationsByOpportunity(req.params.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching opportunity applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
