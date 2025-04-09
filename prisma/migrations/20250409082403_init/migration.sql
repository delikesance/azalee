-- CreateTable
CREATE TABLE "Guild" (
    "guildID" TEXT NOT NULL PRIMARY KEY,
    "infoChannelID" TEXT,
    "logChannelID" TEXT,
    "welcomeChannelID" TEXT
);

-- CreateTable
CREATE TABLE "Member" (
    "memberID" TEXT NOT NULL PRIMARY KEY,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "guildID" TEXT NOT NULL,
    CONSTRAINT "Member_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild" ("guildID") ON DELETE RESTRICT ON UPDATE CASCADE
);
