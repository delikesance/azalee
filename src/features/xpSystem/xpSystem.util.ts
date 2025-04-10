import type { Member, Prisma } from "@prisma/client";
import { TextChannel, type GuildMember, type User } from "discord.js";
import { prisma } from "src/prisma";
import { createEmbed } from "utils/embed.util";

export async function handleLevelUp(memberData: Prisma.MemberGetPayload<{ select: { level: true, xp: true } }>, guildMember: GuildMember): Promise<Member | null> {
    const xpThreshold = calculateXpThreshold(memberData)

    if (memberData.xp < xpThreshold) return null;

    const updatedMember = await prisma.member.update({
        where: {
            memberID: guildMember.id,
            guildID: guildMember.guild.id,
        },
        data: {
            level: { increment: 1 },
            xp: { decrement: xpThreshold },
        },
        include: {
            guild: {
                select: { infoChannelID: true }
            }
        }
    });

    if (!updatedMember.guild.infoChannelID) return updatedMember;

    // Fetch the notification channel and send a level-up message
    const notificationChannel = await guildMember.client.channels.fetch(updatedMember.guild.infoChannelID);

    if (notificationChannel?.isTextBased() && notificationChannel instanceof TextChannel) {
        const embed = createEmbed().setDescription(`<@${guildMember.id}> est monté d'un niveau! Il est désormais niveau ${updatedMember.level}.`);
        notificationChannel.send({ embeds: [embed] });
    }

    return updatedMember;
}

export function calculateXpThreshold(memberData: Prisma.MemberGetPayload<{ select: { level: true, xp: true } }>) {
    return Math.floor(100 * 1.5 ** (memberData.level - 1));
}

export async function updateXp(memberID: string, guildID: string, xp: number = 10) {
    return prisma.member.upsert({
        where: { guildID, memberID },

        create: {
            memberID,
            guildID,
            xp: xp,
            totalXP: xp
        },

        update: {
            xp: { increment: xp },
            totalXP: { increment: xp }
        }
    })
}

export async function calculateVoiceXp(member: GuildMember, guildID: string, sessionStart: number) {
    const now = Date.now()
    const timePassed = now - sessionStart
    const earnedXP = (timePassed / 1000) * 10

    const updatedMember = await updateXp(member.id, guildID, earnedXP)
    return handleLevelUp({ level: updatedMember.level, xp: updatedMember.xp }, member)
}

export function createVoiceSession(member: GuildMember) {
    return prisma.voiceSession.create({
        data: { guildID: member.guild.id, memberID: member.id }
    })
}

export function getVoiceSession(memberID: string, guildID: string) {
    return prisma.voiceSession.findUnique({
        where: { guildID_memberID: { guildID, memberID } },
        select: { startedAt: true },
    })
}