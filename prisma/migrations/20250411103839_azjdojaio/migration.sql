-- CreateTable
CREATE TABLE "Guild" (
    "guildID" TEXT NOT NULL PRIMARY KEY,
    "infoChannelID" TEXT,
    "logChannelID" TEXT,
    "welcomeChannelID" TEXT,
    "welcomeMessageTemplate" TEXT
);

-- CreateTable
CREATE TABLE "Member" (
    "memberID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "guildGuildID" TEXT,

    PRIMARY KEY ("guildID", "memberID"),
    CONSTRAINT "Member_guildGuildID_fkey" FOREIGN KEY ("guildGuildID") REFERENCES "Guild" ("guildID") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoiceSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildID" TEXT NOT NULL,
    "memberID" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "VoiceSession_guildID_memberID_key" ON "VoiceSession"("guildID", "memberID");
