import { prisma } from "src/prisma";
import type { Event } from "types/event.type";
import { handleLevelUp, updateXp } from "../xpSystem.util";

const cooldowns = new Map<string, number>()

setInterval(() => {
    const now = Date.now();
    cooldowns.forEach((value, key) => {
        if (now - value > 120_000) cooldowns.delete(key);
    });
}, 3600000);

export const XpSystemMessageCreateEvent = {
    name: "messageCreate",
    async execute(message) {
        if (!message.guildId || !message.member || message.author.bot) return

        const key = `${message.author.id}-${message.guildId}`;
        const lastTime = cooldowns.get(key);

        if (lastTime && Date.now() - lastTime < 60_000) return;
        cooldowns.set(key, Date.now());

        const memberData = await updateXp(message.member.id, message.guildId)
        return handleLevelUp(memberData, message.member)
    },
} as Event<"messageCreate">