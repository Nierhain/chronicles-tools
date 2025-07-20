// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTableCreator } from 'drizzle-orm/pg-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `chronicles-tools_${name}`);

export const characterRoleEnum = pgEnum('role', ['tank', 'healer', 'dps']);
export type CharacterRole = typeof characterRoleEnum.enumValues[number];
export const characterClassEnum = pgEnum('class', [
    'warrior',
    'mage',
    'rogue',
    'hunter',
    'priest',
    'deathknight',
    'shaman',
    'warlock',
    'druid',
    'demonhunter',
    'monk',
    'evoker',
    'paladin',
]);
export type CharacterClass = typeof characterClassEnum.enumValues[number];


export const difficulties = {
    lfr: 'lfr',
    normal: 'normal',
    hc: 'heroic',
    mythic: 'mythic',
} as const;
type Difficulty = (typeof difficulties)[keyof typeof difficulties];

export const difficultyLabels: Record<string, string> = {
    lfr: 'Looking For Raid',
    normal: 'Normal',
    heroic: 'Heroic',
    mythic: 'Mythic',
};

export const userRoleEnum = pgEnum('role', [
    'admin',
    'lead',
    'officer',
    'raidlead',
    'raider',
    'social',
    'trial',
    'guest',
]);

export const roleLabels: Record<string, string> = {
    admin: 'Admin',
    lead: 'Guildlead',
    officer: 'Officer',
    raidlead: 'Raidleader',
    raider: 'Raider',
    social: 'Social',
    trial: 'Trial',
    guest: 'Guest',
};

export const posts = createTable(
    'post',
    (d) => ({
        id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
        name: d.varchar({ length: 256 }),
        createdAt: d
            .timestamp({ withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: d
            .timestamp({ withTimezone: true })
            .$onUpdate(() => new Date()),
    }),
    (t) => [index('name_idx').on(t.name)]
);

export const user = createTable('user', (d) => ({
    id: d.text('id').primaryKey(),
    name: d.text('name').notNull(),
    email: d.text('email').notNull().unique(),
    emailVerified: d.boolean('email_verified').notNull(),
    image: d.text('image'),
    role: userRoleEnum().default('guest'),
    createdAt: d.timestamp('created_at').notNull(),
    updatedAt: d.timestamp('updated_at').notNull(),
}));

export const session = createTable('session', (d) => ({
    id: d.text('id').primaryKey(),
    expiresAt: d.timestamp('expires_at').notNull(),
    token: d.text('token').notNull().unique(),
    createdAt: d.timestamp('created_at').notNull(),
    updatedAt: d.timestamp('updated_at').notNull(),
    ipAddress: d.text('ip_address'),
    userAgent: d.text('user_agent'),
    userId: d
        .text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
}));

export const account = createTable('account', (d) => ({
    id: d.text('id').primaryKey(),
    accountId: d.text('account_id').notNull(),
    providerId: d.text('provider_id').notNull(),
    userId: d
        .text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: d.text('access_token'),
    refreshToken: d.text('refresh_token'),
    idToken: d.text('id_token'),
    accessTokenExpiresAt: d.timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: d.timestamp('refresh_token_expires_at'),
    scope: d.text('scope'),
    password: d.text('password'),
    createdAt: d.timestamp('created_at').notNull(),
    updatedAt: d.timestamp('updated_at').notNull(),
}));

export const verification = createTable('verification', (d) => ({
    id: d.text('id').primaryKey(),
    identifier: d.text('identifier').notNull(),
    value: d.text('value').notNull(),
    expiresAt: d.timestamp('expires_at').notNull(),
    createdAt: d.timestamp('created_at'),
    updatedAt: d.timestamp('updated_at'),
}));

export const character = createTable('character', (d) => ({
    id: d
        .text('id')
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    wowId: d.integer('wow_id').notNull(),
    name: d.text('name').notNull(),
    realm: d.text('realm').notNull(),
    mainRole: d.text('main_role').notNull(),
    class: characterClassEnum(),
    level: d.integer('level'),
    render: d.text('render'),
    avatar: d.text('avatar'),
    userId: d
        .text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: d.timestamp('created_at').notNull(),
    updatedAt: d.timestamp('updated_at').notNull(),
}));

export type CharacterInsertType = typeof character.$inferInsert;

export const guild = createTable('guild', (d) => ({
    id: d
        .text('id')
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    name: d.text('name').notNull(),
    realm: d.text('realm').notNull(),
    createdAt: d.timestamp('created_at').notNull().defaultNow(),
    updatedAt: d.timestamp('updated_at').notNull().defaultNow(),
}));

export const roster = createTable('roster', (d) => ({
    id: d
        .text('id')
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    name: d.text('name').notNull(),
    description: d.text('description'),
    difficulties: d.text('difficulties').default('[]'),
    startsAt: d.time('starts_at').notNull(),
    endsAt: d.time('ends_at').notNull(),
    createdAt: d.timestamp('created_at').notNull().defaultNow(),
    updatedAt: d.timestamp('updated_at').notNull().defaultNow(),
}));

export const rosterEntry = createTable('roster_entry', (d) => ({
    id: d
        .text('id')
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    userId: d
        .text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    characterId: d
        .text('character_id')
        .notNull()
        .references(() => character.id, { onDelete: 'cascade' }),
    guildId: d
        .text('guild_id')
        .notNull()
        .references(() => guild.id, { onDelete: 'cascade' }),
    availableMonday: d.boolean('available_monday').notNull(),
    availableTuesday: d.boolean('available_tuesday').notNull(),
    availableWednesday: d.boolean('available_wednesday').notNull(),
    availableThursday: d.boolean('available_thursday').notNull(),
    availableFriday: d.boolean('available_friday').notNull(),
    availableSaturday: d.boolean('available_saturday').notNull(),
    availableSunday: d.boolean('available_sunday').notNull(),
    interestedInMythic: d.boolean('interested_in_mythic').default(false),
    createdAt: d.timestamp('created_at').notNull(),
    updatedAt: d.timestamp('updated_at').notNull(),
}));

export const accountLabels = createTable('account_label', (d) => ({
    id: d
        .text('id')
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    accountId: d.integer('account_id').notNull(),
    label: d.text('label'),
    userId: d
        .text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: d
        .timestamp('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: d
        .timestamp('updated_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
}));

export type AccountLabel = typeof accountLabels.$inferSelect;