-- Migration: AddFriendSystem
-- This migration adds the FriendRequests table for the friend system

-- Create FriendRequests table
CREATE TABLE "FriendRequests" (
    "Id" SERIAL PRIMARY KEY,
    "SenderId" INTEGER NOT NULL,
    "ReceiverId" INTEGER NOT NULL,
    "Status" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NULL,

    CONSTRAINT "FK_FriendRequests_Sender" FOREIGN KEY ("SenderId") REFERENCES "Users"("Id") ON DELETE NO ACTION,
    CONSTRAINT "FK_FriendRequests_Receiver" FOREIGN KEY ("ReceiverId") REFERENCES "Users"("Id") ON DELETE NO ACTION
);

-- Create unique index on SenderId + ReceiverId to prevent duplicate requests
CREATE UNIQUE INDEX "IX_FriendRequests_SenderId_ReceiverId" ON "FriendRequests"("SenderId", "ReceiverId");

-- Create index on Status for filtering
CREATE INDEX "IX_FriendRequests_Status" ON "FriendRequests"("Status");

-- Add comment to explain the Status values
COMMENT ON COLUMN "FriendRequests"."Status" IS '0 = Pending, 1 = Accepted, 2 = Rejected, 3 = Cancelled';
