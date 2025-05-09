import { db } from './db';
import { sql } from 'drizzle-orm';
import * as schema from '../shared/schema';

// List all schema entities to ensure they're properly migrated
console.log('Pushing schema to database...');
console.log('Schema includes tables:', 
  Object.keys(schema)
    .filter(key => key.includes('$') || key.endsWith('Relations'))
    .join(', ')
);

// Execute SQL to create session table if it doesn't exist
async function createSessionTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);
    console.log('Session table verified');
  } catch (error) {
    console.error('Error creating session table:', error);
  }
}

// Push schema to database with a simple confirmation message
async function main() {
  try {
    // Create all tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY,
        "username" text NOT NULL UNIQUE,
        "email" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "full_name" text NOT NULL,
        "role" text NOT NULL,
        "is_active" boolean NOT NULL DEFAULT false,
        "bio" text,
        "profile_picture" text,
        "created_at" timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "courses" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL,
        "department" text NOT NULL,
        "code" text NOT NULL,
        "description" text
      );

      CREATE TABLE IF NOT EXISTS "tutor_courses" (
        "id" serial PRIMARY KEY,
        "tutor_id" integer NOT NULL,
        "course_id" integer NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "availabilities" (
        "id" serial PRIMARY KEY,
        "tutor_id" integer NOT NULL,
        "day_of_week" integer NOT NULL,
        "start_time" text NOT NULL,
        "end_time" text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "bookings" (
        "id" serial PRIMARY KEY,
        "learner_id" integer NOT NULL,
        "tutor_id" integer NOT NULL,
        "course_id" integer NOT NULL,
        "date" text NOT NULL,
        "start_time" text NOT NULL,
        "end_time" text NOT NULL,
        "location" text NOT NULL,
        "status" text NOT NULL DEFAULT 'pending',
        "notes" text,
        "created_at" timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" serial PRIMARY KEY,
        "booking_id" integer NOT NULL,
        "learner_id" integer NOT NULL,
        "tutor_id" integer NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        "created_at" timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "message" text NOT NULL,
        "type" text NOT NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "related_id" integer,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    // Create foreign key constraints
    await db.execute(sql`
      -- tutor_courses foreign keys
      ALTER TABLE "tutor_courses" ADD CONSTRAINT "fk_tutor_courses_tutor" 
        FOREIGN KEY ("tutor_id") REFERENCES "users"("id") ON DELETE CASCADE;
      ALTER TABLE "tutor_courses" ADD CONSTRAINT "fk_tutor_courses_course" 
        FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;

      -- availabilities foreign keys
      ALTER TABLE "availabilities" ADD CONSTRAINT "fk_availabilities_tutor" 
        FOREIGN KEY ("tutor_id") REFERENCES "users"("id") ON DELETE CASCADE;

      -- bookings foreign keys
      ALTER TABLE "bookings" ADD CONSTRAINT "fk_bookings_learner" 
        FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE;
      ALTER TABLE "bookings" ADD CONSTRAINT "fk_bookings_tutor" 
        FOREIGN KEY ("tutor_id") REFERENCES "users"("id") ON DELETE CASCADE;
      ALTER TABLE "bookings" ADD CONSTRAINT "fk_bookings_course" 
        FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;

      -- reviews foreign keys
      ALTER TABLE "reviews" ADD CONSTRAINT "fk_reviews_booking" 
        FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE;
      ALTER TABLE "reviews" ADD CONSTRAINT "fk_reviews_learner" 
        FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE;
      ALTER TABLE "reviews" ADD CONSTRAINT "fk_reviews_tutor" 
        FOREIGN KEY ("tutor_id") REFERENCES "users"("id") ON DELETE CASCADE;

      -- notifications foreign keys
      ALTER TABLE "notifications" ADD CONSTRAINT "fk_notifications_user" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
    `);

    await createSessionTable();
    
    console.log('Schema pushed successfully!');
  } catch (error) {
    console.error('Error pushing schema:', error);
  } finally {
    process.exit(0);
  }
}

main();