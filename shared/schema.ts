// Voluntapp Database Schema
// Reference: javascript_log_in_with_replit and javascript_database blueprints

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  double,
  datetime,
  json,
  index,
} from 'drizzle-orm/mysql-core';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage (only needed if using server-side sessions; kept for compatibility)
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: datetime("expire").notNull(),
  },
  (table) => ({ IDX_session_expire: index("IDX_session_expire").on(table.expire) }),
);

// Users
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(uuid())`),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 32 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  accountType: varchar("account_type", { length: 20 }).notNull().default("volunteer"),
  location: varchar("location", { length: 255 }),
  latitude: double("latitude"),
  longitude: double("longitude"),
  interests: json("interests").$type<string[] | null>(),
  bio: text("bio"),
  organizationName: varchar("organization_name", { length: 255 }),
  hoursVolunteered: int("hours_volunteered").default(0),
  opportunitiesCompleted: int("opportunities_completed").default(0),
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many }) => ({
  opportunities: many(opportunities),
  applications: many(applications),
}));

// Opportunities
export const opportunities = mysqlTable("opportunities", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(uuid())`),
  organizationId: varchar("organization_id", { length: 36 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  imageUrl: text("image_url"),
  location: varchar("location", { length: 255 }).notNull(),
  latitude: double("latitude"),
  longitude: double("longitude"),
  dateTime: datetime("date_time"),
  duration: varchar("duration", { length: 50 }),
  volunteersNeeded: int("volunteers_needed").notNull().default(10),
  volunteersApplied: int("volunteers_applied").notNull().default(0),
  skills: json("skills").$type<string[] | null>(),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  organization: one(users, {
    fields: [opportunities.organizationId],
    references: [users.id],
  }),
  applications: many(applications),
}));

// Applications
export const applications = mysqlTable("applications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(uuid())`),
  opportunityId: varchar("opportunity_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  message: text("message"),
  appliedAt: datetime("applied_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: datetime("completed_at"),
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
