-- Migration: AddBlogVisibility
-- This migration adds the Visibility column to the Posts table

-- Add Visibility column to Posts table
ALTER TABLE "Posts" ADD COLUMN "Visibility" INTEGER NOT NULL DEFAULT 0;

-- Add comment to explain the values
COMMENT ON COLUMN "Posts"."Visibility" IS '0 = Public, 1 = FriendsOnly, 2 = Private';
