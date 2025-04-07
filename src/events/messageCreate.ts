import { Message } from "discord.js";
import { prisma } from "../prisma";
import type { Event } from "../types/event.type";

const messageCooldowns = new Map<string, number>();

setInterval(() => {
  const now = Date.now();
  messageCooldowns.forEach((timestamp, userId) => {
    if (now - timestamp > 30000) { // Cleanup after 30 seconds
      messageCooldowns.delete(userId);
    }
  });
}, 30000);

const messageCreateEvent: Event = {
  name: "messageCreate",
  once: false,
  async execute(message: Message) {
    if (message.author.bot || message.content.trim().length < 10) return;

    const userId = message.author.id;
    const now = Date.now();

    const lastMessageTime = messageCooldowns.get(userId);
    if (lastMessageTime && now - lastMessageTime < 3000) return;

    messageCooldowns.set(userId, now);

    const xp = 10;
    try {
      await prisma.user.upsert({
        where: { userId },
        create: { userId, xp, level: 1 },
        update: { xp: { increment: xp } },
      });
      console.log(`XP updated for user ${userId}`);
    } catch (error) {
      console.error(`Failed to update XP for user ${userId}:`, error);
    }
  },
};

export default messageCreateEvent;
