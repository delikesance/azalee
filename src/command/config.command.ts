import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../type/command.type";
import { prisma } from "../prisma";
import { createEmbed } from "../util/embed.util";
import type { Guild } from "@prisma/client";

export default {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Configurer le bot pour ce serveur")
        .addChannelOption(option =>
            option.setName("infochannel")
                .setDescription("Canal d'information")
                .addChannelTypes(0)
                .setRequired(false))
        .addChannelOption(option =>
            option.setName("logchannel")
                .setDescription("Canal de log")
                .addChannelTypes(0)
                .setRequired(false))
        .addChannelOption(option =>
            option.setName("welcomechannel")
                .setDescription("Canal de bienvenue")
                .addChannelTypes(0)
                .setRequired(false))
        .addStringOption(option =>
            option.setName("welcomemessagetemplate")
                .setDescription("Template du message de bienvenue")
                .setRequired(false)),

    async execute(interaction) {
        const infoChannelID = interaction.options.getChannel("infochannel", false, [0])?.id;
        const logChannelID = interaction.options.getChannel("logchannel", false, [0])?.id;
        const welcomeChannelID = interaction.options.getChannel("welcomechannel", false, [0])?.id;
        const welcomeMessageTemplate = interaction.options.getString("welcomemessagetemplate", false);

        const config = await prisma.guild.upsert({
            where: { guildID: interaction.guildId },
            create: {
                guildID: interaction.guildId,
                infoChannelID, logChannelID, welcomeChannelID, welcomeMessageTemplate
            },
            update: { infoChannelID, logChannelID, welcomeChannelID, welcomeMessageTemplate }
        });

        await interaction.reply({
            flags: "Ephemeral",
            embeds: [
                createEmbed()
                    .setTitle("Configuration du serveur")
                    .addFields(
                        { name: "Canal d'information", value: config.infoChannelID ? `<#${config.infoChannelID}>` : "Non configuré", inline: true },
                        { name: "Canal de log", value: config.logChannelID ? `<#${config.logChannelID}>` : "Non configuré", inline: true },
                        { name: "Canal de bienvenue", value: config.welcomeChannelID ? `<#${config.welcomeChannelID}>` : "Non configuré", inline: true },
                        { name: "Template du message de bienvenue", value: config.welcomeMessageTemplate || "Non configuré", inline: true }
                    )
            ]
        });
    },
} as Command;