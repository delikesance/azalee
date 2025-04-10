import type { Member, Prisma } from "@prisma/client";
import { SlashCommandBuilder } from "discord.js";
import { prisma } from "src/prisma";
import type { Command } from "types/command.type";
import { createEmbed } from "utils/embed.util";

export const TopCommand = {
    async execute(interaction) {

        const { id: guildID } = interaction.guild
        const { id: memberID } = interaction.user
        const TOP_LIMIT = 5

        const topMembers = await prisma.member.findMany({
            where: { guildID },
            orderBy: { totalXP: "desc" },
            select: { memberID: true, level: true, totalXP: true },
            take: TOP_LIMIT,
        });

        const currentUser = await prisma.member.findUnique({ where: { guildID, memberID } })
        const userRank = await prisma.member.count({ where: { guildID, totalXP: { gt: currentUser?.totalXP } } });

        const leaderboard = topMembers.map((member, index) =>
            `${member.memberID === memberID ? "> " : ""}${index + 1}) <@${member.memberID}> - ` +
            `Niv. ${member.level} (${member.totalXP}exp)`
        ).join("\n")

        let footer = ""

        if (currentUser && !topMembers.some(m => m.memberID === memberID))
            footer = `\n\n> Votre position: #${userRank} - Niv. ${currentUser.level} (${currentUser.totalXP}exp)`

        interaction.reply({
            embeds: [createEmbed().setDescription(leaderboard + footer).setTitle("🏆 Classement XP du Serveur")]
        })
    },

    data: new SlashCommandBuilder()
        .setName("top")
        .setDescription("lorem ipsum")

} as Command