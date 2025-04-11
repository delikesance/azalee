import type { Event } from "types/event.type";
import { handleLevelUp } from "../xpSystem.util";
import { prisma } from "src/prisma";
import type {Message} from "discord.js"
import { XP_SYSTEM_CONFIG } from "src/config";

const cooldowns = new Map<string, number>();

export const XpSystemMessageCreateEvent = {
    name: "messageCreate",
    async execute(message: Message) {
        if (!message.inGuild() || !message.member || message.author.bot) return;

        const key = `${message.author.id}-${message.guildId}`;
        const lastTime = cooldowns.get(key);

        if (lastTime && Date.now() < lastTime) return;
        cooldowns.set(key, Date.now() + XP_SYSTEM_CONFIG.MESSAGE_COOLDOWN_MS);

        const memberData = await prisma.member.upsert({
            where: { guildID_memberID: { guildID: message.guildId, memberID: message.author.id } },
            create: { memberID: message.author.id, guildID: message.guildId, xp: 10, totalXP: 10 },
            update: { xp: { increment: 10 }, totalXP: { increment: 10 } },
        });

        await handleLevelUp(memberData);
    },
} as Event<"messageCreate">;
