-- CreateTable
CREATE TABLE "TemporaryVoiceChannel" (
    "guildId" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL
);
