import { SlashCommandBuilder } from "discord.js";
import { XP_SYSTEM_CONFIG } from "src/config";
import { prisma } from "src/prisma";
import type { Command } from "types/command.type";
import { createEmbed } from "utils/embed.util";

export const TopCommand = {
    async execute(interaction) {
        if (!interaction.inGuild() || !interaction.guild) return;

        const { id: guildID } = interaction.guild;
        const { id: memberID } = interaction.user;

        const membersDatas = await prisma.member.findMany({
            select: { totalXP: true, level: true, memberID: true },
            orderBy: { totalXP: "desc" },
            take: 10
        })

        if (membersDatas.length <= 0) return interaction.reply({
            content: "Il n'y a personne dans le classement pour le moment.",
            flags: "Ephemeral"
        })

        let authorDatas = membersDatas.find(a => a.memberID === interaction.user.id) ?? null
        if (!authorDatas) authorDatas = await prisma.member.findUnique({
            where: { guildID_memberID: { guildID, memberID } },
            select: { totalXP: true, level: true, memberID: true },
        })

        const leaderboardMessage = membersDatas.map((md, i) => `${i+1} <@${md.memberID}> - Niv. ${md.level} (${md.totalXP}exp)`).join("\n")
        const embed = createEmbed().setDescription(leaderboardMessage)

        interaction.reply({embeds: [embed]})
    },

    data: new SlashCommandBuilder()
        .setName("top")
        .setDescription("Affiche le classement des membres selon leur XP"),
} as Command;
