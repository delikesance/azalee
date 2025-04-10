-- CreateTable
CREATE TABLE "VoiceSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildID" TEXT NOT NULL,
    "memberID" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
