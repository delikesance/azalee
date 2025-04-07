import { Message } from "discord.js";
import { prisma } from "../prisma";
import type { Event } from "../types/event.type";

const messageCooldowns = new Map<string, number>();

const messageCreateEvent: Event = {
  name: "messageCreate",
  once: false,
  async execute(message: Message) {
    if (message.author.bot || message.content.length < 10) return;

    const userId = message.author.id;
    const now = Date.now();

    const lastMessageTime = messageCooldowns.get(userId);
    if (lastMessageTime && now - lastMessageTime < 3000) return;

    messageCooldowns.set(userId, now);

    const xp = 10;
    await prisma.user.upsert({
      where: { userId },
      create: { userId, xp, level: 1 },
      update: { xp: { increment: xp } },
    });
  },
};

export default messageCreateEvent;
