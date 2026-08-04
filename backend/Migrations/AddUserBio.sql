-- Migration: AddUserBio
-- This migration adds the Bio column to the Users table

-- Add Bio column to Users table
ALTER TABLE "Users" ADD COLUMN "Bio" TEXT NULL;
