import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command.type";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pong"),

    async execute(interaction) {
        interaction.reply({
            content: "pong!",
            flags: "Ephemeral"
        })
    },
} as Command