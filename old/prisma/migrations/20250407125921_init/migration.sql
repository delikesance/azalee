-- CreateTable
CREATE TABLE "VoiceSession" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "lastUpdate" DATETIME NOT NULL,
    "isMuted" BOOLEAN NOT NULL,
    "isDeafened" BOOLEAN NOT NULL
);
