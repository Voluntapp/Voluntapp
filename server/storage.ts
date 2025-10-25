// Reference: javascript_log_in_with_replit and javascript_database blueprints
import {
  users,
  opportunities,
  applications,
  type User,
  type UpsertUser,
  type UpdateUserProfile,
  type Opportunity,
  type InsertOpportunity,
  type UpdateOpportunity,
  type Application,
  type InsertApplication,
  type OpportunityWithOrganization,
  type ApplicationWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: UpdateUserProfile): Promise<User>;
  
  // Opportunity operations
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  getOpportunity(id: string): Promise<OpportunityWithOrganization | undefined>;
  getOpportunities(): Promise<OpportunityWithOrganization[]>;
  getOpportunitiesWithMatching(userLat?: number | null, userLon?: number | null, userInterests?: string[]): Promise<OpportunityWithOrganization[]>;
  getOpportunitiesByOrganization(orgId: string): Promise<Opportunity[]>;
  updateOpportunity(id: string, data: UpdateOpportunity): Promise<Opportunity>;
  deleteOpportunity(id: string): Promise<void>;
  
  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByUser(userId: string): Promise<ApplicationWithDetails[]>;
  getApplicationsByOpportunity(opportunityId: string): Promise<ApplicationWithDetails[]>;
  updateApplication(id: string, status: string): Promise<Application>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: UpdateUserProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Opportunity operations
  async createOpportunity(opportunityData: InsertOpportunity): Promise<Opportunity> {
    const [opportunity] = await db
      .insert(opportunities)
      .values(opportunityData)
      .returning();
    return opportunity;
  }

  async getOpportunity(id: string): Promise<OpportunityWithOrganization | undefined> {
    const result = await db
      .select()
      .from(opportunities)
      .leftJoin(users, eq(opportunities.organizationId, users.id))
      .where(eq(opportunities.id, id))
      .limit(1);
    
    if (!result[0]) return undefined;
    
    return {
      ...result[0].opportunities,
      organization: result[0].users!,
    };
  }

  async getOpportunities(): Promise<OpportunityWithOrganization[]> {
    const result = await db
      .select()
      .from(opportunities)
      .leftJoin(users, eq(opportunities.organizationId, users.id))
      .where(eq(opportunities.status, "active"))
      .orderBy(desc(opportunities.createdAt));
    
    return result.map(row => ({
      ...row.opportunities,
      organization: row.users!,
    }));
  }

  async getOpportunitiesWithMatching(
    userLat?: number | null,
    userLon?: number | null,
    userInterests: string[] = []
  ): Promise<OpportunityWithOrganization[]> {
    const result = await db
      .select()
      .from(opportunities)
      .leftJoin(users, eq(opportunities.organizationId, users.id))
      .where(eq(opportunities.status, "active"))
      .orderBy(desc(opportunities.createdAt));
    
    const allOpportunities = result.map(row => ({
      ...row.opportunities,
      organization: row.users!,
    }));

    // Calculate matching scores
    const { calculateDistance } = require("./locationService");
    const scoredOpportunities = allOpportunities.map(opp => {
      let score = 0;
      
      // Distance score (0-50 points, proportional decay)
      if (userLat && userLon && opp.latitude && opp.longitude) {
        const distance = calculateDistance(userLat, userLon, opp.latitude, opp.longitude);
        // 0 miles: 50 points, linearly decreasing to 100 miles: 0 points
        if (distance <= 100) {
          score += Math.max(0, 50 - (distance * 0.5));
        }
      }
      
      // Interest match score (0-50 points)
      if (userInterests.length > 0 && opp.category) {
        // Exact category match gets full points
        if (userInterests.includes(opp.category)) {
          score += 50;
        } else {
          // Partial credit for having interests set (shows engagement)
          score += 10;
        }
      } else if (opp.category) {
        // No interests set, give base score to all opportunities
        score += 25;
      }
      
      return { ...opp, matchScore: Math.round(score) };
    });

    // Sort by match score (highest first), then by created date
    return scoredOpportunities.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
    });
  }

  async getOpportunitiesByOrganization(orgId: string): Promise<Opportunity[]> {
    return await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.organizationId, orgId))
      .orderBy(desc(opportunities.createdAt));
  }

  async updateOpportunity(id: string, data: UpdateOpportunity): Promise<Opportunity> {
    const [opportunity] = await db
      .update(opportunities)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(opportunities.id, id))
      .returning();
    return opportunity;
  }

  async deleteOpportunity(id: string): Promise<void> {
    await db.delete(opportunities).where(eq(opportunities.id, id));
  }

  // Application operations
  async createApplication(applicationData: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(applicationData)
      .returning();
    
    // Increment the volunteersApplied count
    await db
      .update(opportunities)
      .set({
        volunteersApplied: sql`${opportunities.volunteersApplied} + 1`,
      })
      .where(eq(opportunities.id, applicationData.opportunityId));
    
    return application;
  }

  async getApplicationsByUser(userId: string): Promise<ApplicationWithDetails[]> {
    const result = await db
      .select()
      .from(applications)
      .leftJoin(opportunities, eq(applications.opportunityId, opportunities.id))
      .leftJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.appliedAt));
    
    return result.map(row => ({
      ...row.applications,
      opportunity: row.opportunities!,
      user: row.users!,
    }));
  }

  async getApplicationsByOpportunity(opportunityId: string): Promise<ApplicationWithDetails[]> {
    const result = await db
      .select()
      .from(applications)
      .leftJoin(opportunities, eq(applications.opportunityId, opportunities.id))
      .leftJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.opportunityId, opportunityId))
      .orderBy(desc(applications.appliedAt));
    
    return result.map(row => ({
      ...row.applications,
      opportunity: row.opportunities!,
      user: row.users!,
    }));
  }

  async updateApplication(id: string, status: string): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }
}

export const storage = new DatabaseStorage();
