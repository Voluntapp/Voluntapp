// Voluntapp Database Schema
// Reference: javascript_log_in_with_replit and javascript_database blueprints

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth, extended for Voluntapp)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Voluntapp specific fields
  accountType: varchar("account_type", { length: 20 }).notNull().default("volunteer"), // 'volunteer' or 'organization'
  location: varchar("location"), // City, State format
  latitude: real("latitude"),
  longitude: real("longitude"),
  interests: text("interests").array(), // Array of interest categories
  bio: text("bio"),
  organizationName: varchar("organization_name"), // For organization accounts
  hoursVolunteered: integer("hours_volunteered").default(0),
  opportunitiesCompleted: integer("opportunities_completed").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  opportunities: many(opportunities),
  applications: many(applications),
}));

// Volunteer opportunities
export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // Education, Environment, Health, Community, etc.
  imageUrl: text("image_url"),
  location: varchar("location").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  dateTime: timestamp("date_time"),
  duration: varchar("duration"), // "2 hours", "Half day", "Full day", etc.
  volunteersNeeded: integer("volunteers_needed").default(10),
  volunteersApplied: integer("volunteers_applied").default(0),
  skills: text("skills").array(), // Skills required or beneficial
  status: varchar("status", { length: 20 }).default("active"), // active, paused, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  organization: one(users, {
    fields: [opportunities.organizationId],
    references: [users.id],
  }),
  applications: many(applications),
}));

// Applications/Participation tracking
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, rejected, completed
  message: text("message"), // Optional message from volunteer
  appliedAt: timestamp("applied_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const applicationsRelations = relations(applications, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [applications.opportunityId],
    references: [opportunities.id],
  }),
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  interests: z.array(z.string()).optional(),
  bio: z.string().optional(),
  organizationName: z.string().optional(),
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  volunteersApplied: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOpportunitySchema = insertOpportunitySchema.partial();

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  completedAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type UpdateOpportunity = z.infer<typeof updateOpportunitySchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

// Extended types for queries with relations
export type OpportunityWithOrganization = Opportunity & {
  organization: User;
};

export type ApplicationWithDetails = Application & {
  opportunity: Opportunity;
  user: User;
};
