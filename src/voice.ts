import { prisma } from "./prisma";
import { XP_RATES } from "./config";

interface VoiceSession {
  channelId: string;
  lastUpdate: Date;
  isMuted: boolean;
  isDeafened: boolean;
}

export const activeVoiceUsers = new Map<string, VoiceSession>();

// Load active sessions on startup
async function loadActiveSessions() {
  try {
    const sessions = await prisma.voiceSession.findMany();
    sessions.forEach(session => {
      activeVoiceUsers.set(session.userId, {
        channelId: session.channelId,
        lastUpdate: session.lastUpdate,
        isMuted: session.isMuted,
        isDeafened: session.isDeafened,
      });
    });
  } catch (error) {
    console.error("Failed to load active voice sessions:", error);
  }
}

loadActiveSessions().catch(console.error);

function calculateXP(minutes: number, isMuted: boolean, isDeafened: boolean): number {
  const elapsedMinutes = Math.min(minutes, 60); // Cap at 1 hour
  if (isDeafened) return Math.floor(elapsedMinutes * XP_RATES.DEAFENED);
  if (isMuted) return Math.floor(elapsedMinutes * XP_RATES.MUTED);
  return Math.floor(elapsedMinutes * XP_RATES.ACTIVE);
}

export async function handleVoiceXP(userId: string, minutes: number, isMuted: boolean, isDeafened: boolean) {
  const xp = calculateXP(minutes, isMuted, isDeafened);
  if (xp <= 0) return;

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { userId },
        create: { userId, xp, level: 1 },
        update: { xp: { increment: xp } },
        select: { xp: true, level: true },
      });

      const newLevel = Math.floor(0.1 * Math.sqrt(user.xp));
      if (newLevel > user.level) {
        await tx.user.update({
          where: { userId },
          data: { level: newLevel, xp: user.xp - Math.pow((user.level + 1) / 0.1, 2) },
        });
      }

      if (activeVoiceUsers.has(userId)) {
        await tx.voiceSession.upsert({
          where: { userId },
          create: {
            userId,
            channelId: activeVoiceUsers.get(userId)!.channelId,
            lastUpdate: new Date(),
            isMuted,
            isDeafened,
          },
          update: {
            lastUpdate: new Date(),
            isMuted,
            isDeafened,
          },
        });
      }
    });
  } catch (error) {
    console.error(`Failed to handle voice XP for user ${userId}:`, error);
  }

  if (!activeVoiceUsers.has(userId)) {
    try {
      await prisma.voiceSession.deleteMany({ where: { userId } });
    } catch (error) {
      console.error(`Failed to clean up voice session for user ${userId}:`, error);
    }
  }
}

