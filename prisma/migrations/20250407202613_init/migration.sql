/*
  Warnings:

  - Added the required column `guild_id` to the `Config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guildId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guild_id` to the `voice_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Config" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "guild_id" TEXT NOT NULL,
    "value" TEXT NOT NULL
);
INSERT INTO "new_Config" ("key", "value") SELECT "key", "value" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
CREATE UNIQUE INDEX "Config_key_guild_id_key" ON "Config"("key", "guild_id");
CREATE TABLE "new_User" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_User" ("level", "userId", "xp") SELECT "level", "userId", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_userId_guildId_key" ON "User"("userId", "guildId");
CREATE TABLE "new_voice_sessions" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "last_update" DATETIME NOT NULL,
    "is_muted" BOOLEAN NOT NULL,
    "is_deafened" BOOLEAN NOT NULL
);
INSERT INTO "new_voice_sessions" ("channel_id", "is_deafened", "is_muted", "last_update", "user_id") SELECT "channel_id", "is_deafened", "is_muted", "last_update", "user_id" FROM "voice_sessions";
DROP TABLE "voice_sessions";
ALTER TABLE "new_voice_sessions" RENAME TO "voice_sessions";
CREATE UNIQUE INDEX "voice_sessions_user_id_guild_id_key" ON "voice_sessions"("user_id", "guild_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
