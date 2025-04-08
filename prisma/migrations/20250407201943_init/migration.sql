/*
  Warnings:

  - You are about to drop the `VoiceSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VoiceSession";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "voice_sessions" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "channel_id" TEXT NOT NULL,
    "last_update" DATETIME NOT NULL,
    "is_muted" BOOLEAN NOT NULL,
    "is_deafened" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Config" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);
