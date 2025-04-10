/*
  Warnings:

  - A unique constraint covering the columns `[guildID,memberID]` on the table `VoiceSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VoiceSession_guildID_memberID_key" ON "VoiceSession"("guildID", "memberID");
