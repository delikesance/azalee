import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command.type";
import { prisma } from "../prisma";

export default {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Configurer")
        .addSubcommand(subcommand =>
            subcommand
                .setName("notification")
                .setDescription("Configurer les canaux de notification")
                .addChannelOption(option =>
                    option
                        .setName("infos")
                        .setDescription("Channel pour les informations")
                        .setRequired(false)
                        .addChannelTypes(0)
                )
                .addChannelOption(option =>
                    option
                        .setName("logs")
                        .setDescription("Channel pour les logs")
                        .setRequired(false)
                        .addChannelTypes(0)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand()
        if (subcommand === "notification") handleNotificationSubcommand(interaction)

    },
} as Command

async function handleNotificationSubcommand(interaction: ChatInputCommandInteraction<"cached">) {
    const infoChannel = interaction.options.getChannel("infos", false, [0]);
    const logChannel = interaction.options.getChannel("logs", false, [0]);

    await prisma.guildSettings.upsert({
        where: { guildId: interaction.guildId },
        create: {
            guildId: interaction.guildId,
            infoChannel: infoChannel?.id || null,
            logChannel: logChannel?.id || null,
        },
        update: {
            infoChannel: infoChannel?.id || null,
            logChannel: logChannel?.id || null,
        },
    });

    await interaction.reply({
        ephemeral: true,
        content: "Les paramètres de notification ont été mis à jour avec succès.",
    });
}
