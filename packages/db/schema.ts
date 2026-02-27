import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  jsonb,
  varchar,
  index,
} from 'drizzle-orm/pg-core'

// Users table (multi-tenant)
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    polarCustomerId: varchar('polar_customer_id', { length: 255 }).unique(),
    tier: varchar('tier', { length: 50 }).default('free'), // free, pro, enterprise
    active: boolean('active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
  })
)

// Agents table (multi-tenant, owned by users)
export const agents = pgTable(
  'agents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    model: varchar('model', { length: 100 }).default('claude-haiku-4-5'),
    provider: varchar('provider', { length: 100 }).default('anthropic'),
    status: varchar('status', { length: 50 }).default('active'), // active, inactive, error
    config: jsonb('config'), // SOUL.md, IDENTITY.md, etc
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('agents_user_id_idx').on(table.userId),
    statusIdx: index('agents_status_idx').on(table.status),
  })
)

// Sessions table (multi-tenant)
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    history: jsonb('history').default([]),
    memory: jsonb('memory').default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
    agentIdIdx: index('sessions_agent_id_idx').on(table.agentId),
  })
)

// Billing table (track subscriptions)
export const billing = pgTable(
  'billing',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    polarOrderId: varchar('polar_order_id', { length: 255 }).unique(),
    tier: varchar('tier', { length: 50 }).notNull(),
    status: varchar('status', { length: 50 }).default('active'),
    nextBillingDate: timestamp('next_billing_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('billing_user_id_idx').on(table.userId),
  })
)
