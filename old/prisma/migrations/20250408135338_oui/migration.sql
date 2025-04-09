/*
  Warnings:

  - You are about to drop the column `customVoiceParent` on the `GuildConfig` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "UserProgress" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "currentXp" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "xpNeeded" INTEGER NOT NULL DEFAULT 100
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildConfig" (
    "guildId" TEXT NOT NULL PRIMARY KEY,
    "notificationChannelId" TEXT
);
INSERT INTO "new_GuildConfig" ("guildId") SELECT "guildId" FROM "GuildConfig";
DROP TABLE "GuildConfig";
ALTER TABLE "new_GuildConfig" RENAME TO "GuildConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_guildId_key" ON "UserProgress"("userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_guildId_channelId_key" ON "Notification"("userId", "guildId", "channelId");
