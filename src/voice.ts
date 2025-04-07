import { prisma } from "./prisma";
import { XP_RATES } from "./config";

const MAX_MINUTES = 60; // Cap for XP calculation
const LEVEL_MULTIPLIER = XP_RATES.LEVEL_MULTIPLIER;
const CLEANUP_INTERVAL = 3600000; // 1 hour in milliseconds

interface VoiceSession {
  channelId: string;
  lastUpdate: Date;
  isMuted: boolean;
  isDeafened: boolean;
}

export const activeVoiceUsers = new Map<string, VoiceSession>();

const cleanupIntervalId = setInterval(() => {
  const now = Date.now();
  activeVoiceUsers.forEach((session, userId) => {
    if (now - session.lastUpdate.getTime() > CLEANUP_INTERVAL) {
      console.log(`Cleaning up inactive session for user ${userId}`);
      activeVoiceUsers.delete(userId);
    }
  });
}, CLEANUP_INTERVAL);

// Add this function to clear the interval when needed
export function stopCleanupInterval() {
  clearInterval(cleanupIntervalId);
}

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
    console.log("Active voice sessions loaded successfully.");
  } catch (error) {
    console.error("Failed to load active voice sessions:", error);
  }
}

loadActiveSessions().catch(console.error);

function calculateXP(minutes: number, isMuted: boolean, isDeafened: boolean): number {
  const elapsedMinutes = Math.min(minutes, MAX_MINUTES);
  if (isDeafened) return Math.floor(elapsedMinutes * XP_RATES.DEAFENED);
  if (isMuted) return Math.floor(elapsedMinutes * XP_RATES.MUTED);
  return Math.floor(elapsedMinutes * XP_RATES.ACTIVE);
}

async function updateVoiceSession(userId: string, isMuted: boolean, isDeafened: boolean) {
  const session = activeVoiceUsers.get(userId);
  if (!session) return;

  try {
    await prisma.voiceSession.upsert({
      where: { userId },
      create: {
        userId,
        channelId: session.channelId,
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
    console.log(`Voice session updated for user ${userId}`);
  } catch (error) {
    console.error(`Failed to update voice session for user ${userId}:`, error);
  }
}

async function cleanupVoiceSession(userId: string) {
  try {
    await prisma.voiceSession.deleteMany({ where: { userId } });
    console.log(`Voice session cleaned up for user ${userId}`);
  } catch (error) {
    console.error(`Failed to clean up voice session for user ${userId}:`, error);
  }
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

      const newLevel = Math.floor(LEVEL_MULTIPLIER * Math.sqrt(user.xp));
      if (newLevel > user.level) {
        await tx.user.update({
          where: { userId },
          data: { level: newLevel, xp: user.xp - Math.pow((user.level + 1) / LEVEL_MULTIPLIER, 2) },
        });
        console.log(`User ${userId} leveled up to ${newLevel}`);
      }

      await updateVoiceSession(userId, isMuted, isDeafened);
    });
  } catch (error) {
    console.error(`Failed to handle voice XP for user ${userId}:`, error);  }  if (!activeVoiceUsers.has(userId)) {    await cleanupVoiceSession(userId);
  }
}

