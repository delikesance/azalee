import { SlashCommandBuilder } from "discord.js";
import type { Command } from "types/command.type";

export const PingCommand = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Répond avec pong"),

    async execute(interaction) {
        return interaction.reply({
            content: "🏓 Pong!",
            flags: "Ephemeral"
        })
    },
} as Command