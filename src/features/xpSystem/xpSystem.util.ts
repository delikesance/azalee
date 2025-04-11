import type { Member, Prisma, VoiceSession } from "@prisma/client";
import { type GuildMember } from "discord.js";
import { prisma } from "src/prisma";

export async function handleLevelUp(memberData: Member) {
    const currentXp = memberData.xp;
    const threshold = calculateXpThreshold(memberData.level);

    // Calcul sécurisé du levelGain
    const levelGain = Math.floor(
        Math.log1p(currentXp / threshold) / Math.log(1.5)
    );

    // Prévention des valeurs négatives
    const xpDecrement = threshold * (Math.pow(1.5, levelGain) - 1);
    const newXp = Math.max(0, currentXp - xpDecrement);

    return prisma.member.update({
        where: {
            guildID_memberID: {
                memberID: memberData.memberID,
                guildID: memberData.guildID
            }
        },
        data: {
            level: { increment: levelGain },
            xp: newXp,
            totalXP: { increment: currentXp }
        }
    });
}


export function calculateXpThreshold(level: number) {
    return Math.max(100, Math.floor(100 * 1.5 ** (level - 1)));
}

export async function calculateVoiceXp(memberID: string, guildID: string, useReturn: true): Promise<[Member, VoiceSession | undefined]>;
export async function calculateVoiceXp(memberID: string, guildID: string, useReturn?: false): Promise<void>;
export async function calculateVoiceXp(memberID: string, guildID: string, useReturn: boolean = false): Promise<[Member, VoiceSession | undefined] | void> {
    const session = await prisma.voiceSession.findUnique({
        where: { guildID_memberID: { guildID, memberID } }
    });

    if (!session) {
        if (useReturn) {
            const member = await prisma.member.findUnique({
                where: { guildID_memberID: { guildID, memberID } }
            });

            if (!member) throw new Error("Member not found");
            return [member, undefined];
        }

        return;
    }

    // Calculate duration in minutes
    const now = Date.now();
    const durationMinutes = Math.floor((now - session.startedAt.getTime()) / 60_000);

    // Earn 10 XP per minute
    const earnedXP = durationMinutes * 10;

    if (useReturn) {
        return prisma.$transaction([
            prisma.member.upsert({
                where: { guildID_memberID: { guildID, memberID } },
                create: { memberID, guildID, xp: earnedXP, totalXP: earnedXP },
                update: { xp: { increment: earnedXP }, totalXP: { increment: earnedXP } }
            }),
            earnedXP > 0 ? prisma.voiceSession.update({
                where: { guildID_memberID: { guildID, memberID } },
                data: { startedAt: new Date() }
            }) : prisma.voiceSession.update({
                where: { guildID_memberID: { guildID, memberID } },
                data: {}
            })
        ]);
    }

    await prisma.$transaction([
        prisma.member.upsert({
            where: { guildID_memberID: { guildID, memberID } },
            create: { memberID, guildID, xp: earnedXP, totalXP: earnedXP },
            update: { xp: { increment: earnedXP }, totalXP: { increment: earnedXP } }
        }),
        prisma.voiceSession.update({
            where: { guildID_memberID: { guildID, memberID } },
            data: { startedAt: new Date() }
        })
    ]);
}

export function createVoiceSession(member: GuildMember) {
    return prisma.voiceSession.upsert({
        where: {
            guildID_memberID: {
                guildID: member.guild.id,
                memberID: member.id
            }
        },
        create: { guildID: member.guild.id, memberID: member.id, startedAt: new Date() },
        update: { startedAt: new Date() }
    });
}

export function getVoiceSession(memberID: string, guildID: string) {
    return prisma.voiceSession.findUnique({
        where: { guildID_memberID: { guildID, memberID } }
    });
}